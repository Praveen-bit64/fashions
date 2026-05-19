import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CategoryCreateSchema = z.object({
    slug: z.string().min(2).max(80).regex(slugRegex),
    name: z.string().min(1).max(80),
    parentId: z.string().uuid().optional().nullable(),
});

export const CategoryUpdateSchema = CategoryCreateSchema.partial();

export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>;
