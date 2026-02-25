import { PrismaClient, PaymentStatus, OrderStatus, Prisma, Customer } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const getEcommerceProducts = async () => {
    return await prisma.product.findMany({
        where: {
            ecommerceVisible: true,
        },
        include: {
            variants: true,
        },
    });
};

export const getEcommerceProductBySlug = async (slug: string) => {
    return await prisma.product.findFirst({
        where: {
            sku: slug, // Assuming SKU or SEO slug is used here
            ecommerceVisible: true,
        },
        include: {
            variants: true,
        },
    });
};

export const createEcommerceOrder = async (orderData: any) => {
    const { items, customerDetails, ...rest } = orderData;
    let orderCustomer: Customer | null = null;

    return await prisma.$transaction(async (tx) => {
        // 1. Inventory Check & Lock
        for (const item of items) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            if (!product || product.stockQuantity < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.productId}`);
            }

            // Deduct stock immediately (lock)
            await tx.product.update({
                where: { id: item.productId },
                data: { stockQuantity: product.stockQuantity - item.quantity },
            });
        }

        // 2. Customer Management
        if (customerDetails) {
            if (customerDetails.email) {
                orderCustomer = await tx.customer.findFirst({ where: { email: customerDetails.email } });
            }
            if (!orderCustomer) {
                orderCustomer = await tx.customer.create({
                    data: {
                        name: customerDetails.name,
                        email: customerDetails.email,
                        phone: customerDetails.phone,
                    },
                });
            }
        }

        // 3. Generate Order Number
        const count = await tx.order.count();
        const orderNumber = `SM-ECO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

        // 4. Create Order
        const order = await tx.order.create({
            data: {
                ...rest,
                orderNumber,
                paymentStatus: PaymentStatus.PENDING,
                orderStatus: OrderStatus.PENDING,
                customerId: orderCustomer?.id,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                    })),
                },
            },
            include: {
                items: true,
                customer: true,
            },
        });

        return order;
    });
};

export const getEcommerceOrder = async (orderNumber: string) => {
    return await prisma.order.findUnique({
        where: { orderNumber },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            shippingInfo: true,
        },
    });
};

export const validateDiscountCode = async (code: string, orderAmount: number, userId?: string) => {
    const discount = await prisma.discountCode.findUnique({
        where: { code },
    });

    if (!discount || !discount.isActive) {
        throw new Error('Invalid or inactive discount code');
    }

    if (discount.expiryDate && new Date(discount.expiryDate) < new Date()) {
        throw new Error('Discount code has expired');
    }

    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
        throw new Error('Discount code usage limit reached');
    }

    if (discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
        throw new Error(`Minimum order amount of ${discount.minOrderAmount} required`);
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'FLAT') {
        discountAmount = discount.value;
    } else if (discount.type === 'PERCENT') {
        discountAmount = (orderAmount * discount.value) / 100;
    }

    if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
        discountAmount = discount.maxDiscountAmount;
    }

    return {
        valid: true,
        discountAmount,
        discountCode: discount.code,
    };
};
