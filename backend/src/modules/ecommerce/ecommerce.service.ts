import { PrismaClient, PaymentStatus, OrderStatus, Customer } from '@prisma/client';
import { getRazorpay } from '../../config/razorpay';

const prisma = new PrismaClient();

// ─── Helper: generate slug from name ─────────────────────
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// ─── Public: List visible products ───────────────────────
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

// ─── Public: Get product by slug ─────────────────────────
export const getEcommerceProductBySlug = async (slug: string) => {
    // Try slug first, fall back to SKU for backwards compatibility
    return await prisma.product.findFirst({
        where: {
            OR: [
                { slug, ecommerceVisible: true },
                { sku: slug, ecommerceVisible: true },
            ],
        },
        include: {
            variants: true,
        },
    });
};

// ─── Public: Create order with Razorpay integration ──────
export const createEcommerceOrder = async (orderData: any) => {
    const { items, customerDetails, shippingAddress, ...rest } = orderData;
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
        const orderNumber = `SM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

        // 4. Create Razorpay Order
        let razorpayOrderId: string | null = null;
        try {
            const razorpay = getRazorpay();
            const totalAmountPaise = Math.round((rest.totalAmount || 0) * 100);
            const rzpOrder = await razorpay.orders.create({
                amount: totalAmountPaise,
                currency: rest.currency || 'INR',
                receipt: orderNumber,
                notes: {
                    orderNumber,
                    customerEmail: customerDetails?.email || '',
                },
            });
            razorpayOrderId = rzpOrder.id;
        } catch (err: any) {
            // If Razorpay is not configured, create order without gateway
            console.warn('Razorpay order creation skipped:', err.message);
        }

        // 5. Create Order in DB
        const order = await tx.order.create({
            data: {
                ...rest,
                orderNumber,
                paymentStatus: PaymentStatus.PENDING,
                orderStatus: OrderStatus.CREATED,
                paymentGateway: razorpayOrderId ? 'razorpay' : null,
                paymentReferenceId: razorpayOrderId,
                customerId: orderCustomer?.id,
                shippingAddress: shippingAddress || undefined,
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

        return {
            ...order,
            razorpayOrderId,
        };
    });
};

// ─── Public: Get order by order number ───────────────────
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
            paymentTransactions: true,
        },
    });
};

// ─── Public: Validate discount code ──────────────────────
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
