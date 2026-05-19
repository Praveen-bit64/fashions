import { z } from 'zod';

export const ReviewCreateSchema = z.object({
    productId: z.string().uuid(),
    rating: z.coerce.number().int().min(1).max(5),
    title: z.string().trim().max(120).optional().nullable(),
    body: z.string().trim().max(2000).optional().nullable(),
});

export type ReviewCreateInput = z.infer<typeof ReviewCreateSchema>;
