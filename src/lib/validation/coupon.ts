import { z } from 'zod';

export const CouponCreateSchema = z
    .object({
        code: z
            .string()
            .trim()
            .min(3)
            .max(40)
            .regex(/^[A-Z0-9_-]+$/i, 'Code can only contain letters, numbers, _ and -')
            .transform((v) => v.toUpperCase()),
        type: z.enum(['FLAT', 'PERCENT']),
        value: z.coerce.number().int().min(1),
        minSubtotal: z.coerce.number().int().min(0).default(0),
        validFrom: z.coerce.date().optional().nullable(),
        validUntil: z.coerce.date().optional().nullable(),
        usageLimit: z.coerce.number().int().min(1).optional().nullable(),
        active: z.boolean().default(true),
    })
    .superRefine((data, ctx) => {
        if (data.type === 'PERCENT' && data.value > 100) {
            ctx.addIssue({
                code: 'custom',
                path: ['value'],
                message: 'Percent discount cannot exceed 100',
            });
        }
        if (
            data.validFrom &&
            data.validUntil &&
            data.validUntil < data.validFrom
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['validUntil'],
                message: 'End date must be after start date',
            });
        }
    });

export type CouponCreateInput = z.infer<typeof CouponCreateSchema>;

// PATCH — every field optional, code is immutable (controllable via delete + recreate)
export const CouponUpdateSchema = z
    .object({
        type: z.enum(['FLAT', 'PERCENT']).optional(),
        value: z.coerce.number().int().min(1).optional(),
        minSubtotal: z.coerce.number().int().min(0).optional(),
        validFrom: z.coerce.date().optional().nullable(),
        validUntil: z.coerce.date().optional().nullable(),
        usageLimit: z.coerce.number().int().min(1).optional().nullable(),
        active: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.type === 'PERCENT' && data.value !== undefined && data.value > 100) {
            ctx.addIssue({
                code: 'custom',
                path: ['value'],
                message: 'Percent discount cannot exceed 100',
            });
        }
    });

export type CouponUpdateInput = z.infer<typeof CouponUpdateSchema>;

export const CouponValidateSchema = z.object({
    code: z.string().trim().min(1).max(40),
    subtotal: z.coerce.number().int().min(0),
});

export type CouponValidateInput = z.infer<typeof CouponValidateSchema>;
