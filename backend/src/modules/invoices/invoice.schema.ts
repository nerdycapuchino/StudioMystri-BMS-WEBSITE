import { z } from 'zod';

const invoiceItemSchema = z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    amount: z.number().optional(),
    hsnCode: z.string().optional(),
});

export const createInvoiceSchema = z.object({
    customerId: z.string().uuid(),
    orderId: z.string().uuid().optional().nullable(),
    items: z.array(invoiceItemSchema).min(1),
    taxRate: z.number().min(0).max(100).optional(),
    notes: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    currency: z.string().optional(),
    // GST & seller/buyer details
    sellerName: z.string().optional().nullable(),
    sellerAddress: z.string().optional().nullable(),
    sellerGst: z.string().optional().nullable(),
    buyerAddress: z.string().optional().nullable(),
    shippingAddress: z.string().optional().nullable(),
    paymentMode: z.string().optional().nullable(),
    referenceNo: z.string().optional().nullable(),
    termsOfDelivery: z.string().optional().nullable(),
    declaration: z.string().optional().nullable(),
    // Bank
    bankName: z.string().optional().nullable(),
    accountNo: z.string().optional().nullable(),
    ifsc: z.string().optional().nullable(),
    branch: z.string().optional().nullable(),
    // Delivery
    deliveryType: z.string().optional().nullable(),
    deliveryCost: z.number().optional().nullable(),
});

export const updateStatusSchema = z.object({
    status: z.enum(['DRAFT', 'SENT', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED']),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
