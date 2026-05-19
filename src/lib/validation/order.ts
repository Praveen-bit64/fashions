import { z } from 'zod';

export const ShippingAddressSchema = z.object({
    fullName: z.string().min(2).max(120),
    phone: z.string().min(10).max(20),
    line1: z.string().min(2).max(200),
    line2: z.string().max(200).optional().nullable(),
    city: z.string().min(2).max(80),
    state: z.string().min(2).max(80),
    postalCode: z.string().min(4).max(10),
    country: z.string().min(2).max(80).default('India'),
});

export const OrderItemInputSchema = z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional().nullable(),
    quantity: z.coerce.number().int().min(1).max(20),
    size: z.string().min(1).max(20),
    color: z.string().min(1).max(40),
});

export const CreateOrderSchema = z.object({
    items: z.array(OrderItemInputSchema).min(1, 'Cart cannot be empty'),
    shipping: ShippingAddressSchema,
    billing: ShippingAddressSchema.optional().nullable(),
    delivery: z.enum(['standard', 'express']).default('standard'),
    payment: z.enum(['COD', 'UPI', 'CARD']),
    couponCode: z.string().max(40).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    email: z.string().email(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type OrderItemInput = z.infer<typeof OrderItemInputSchema>;
export type ShippingAddressInput = z.infer<typeof ShippingAddressSchema>;
