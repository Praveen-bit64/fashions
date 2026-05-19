import { z } from 'zod';

const ADMIN_ROLE = z.enum([
    'TAILOR',
    'PRODUCT_MANAGER',
    'CUSTOMER_SUPPORT',
    'SUPER_ADMIN',
]);

export const TeamInviteSchema = z.object({
    name: z.string().trim().min(2).max(120),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email('Enter a valid email'),
    role: ADMIN_ROLE,
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(72),
    phone: z.string().trim().max(20).optional().nullable(),
});

export type TeamInviteInput = z.infer<typeof TeamInviteSchema>;

export const TeamUpdateSchema = z.object({
    role: ADMIN_ROLE.optional(),
    reactivate: z.boolean().optional(),
});

export type TeamUpdateInput = z.infer<typeof TeamUpdateSchema>;
