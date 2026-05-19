import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const ProductMediaInput = z.object({
    url: z.string().url(),
    publicId: z.string().optional().nullable(),
    kind: z.enum(['IMAGE', 'VIDEO']).default('IMAGE'),
    alt: z.string().optional().nullable(),
});

export const ProductVariantInput = z.object({
    id: z.string().optional(), // present when editing an existing variant
    sku: z.string().min(2).max(64),
    size: z.string().min(1).max(20),
    color: z.string().min(1).max(40),
    priceDelta: z.coerce.number().int().min(-100000).max(1000000).default(0),
    stockQty: z.coerce.number().int().min(0).max(100000).default(0),
});

export const ProductCreateSchema = z.object({
    slug: z
        .string()
        .min(2)
        .max(120)
        .regex(slugRegex, 'Use lowercase letters, numbers, and dashes only'),
    title: z.string().min(2).max(200),
    brand: z.string().min(1).max(100),
    description: z.string().max(5000).optional().nullable(),
    categoryId: z.string().uuid(),
    basePrice: z.coerce.number().int().min(0).max(10_000_000),
    discountPrice: z.coerce
        .number()
        .int()
        .min(0)
        .max(10_000_000)
        .optional()
        .nullable(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
    isCustomizable: z.coerce.boolean().default(true),
    isNewArrival: z.coerce.boolean().default(false),
    isBestSeller: z.coerce.boolean().default(false),
    media: z.array(ProductMediaInput).default([]),
    variants: z.array(ProductVariantInput).default([]),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
export type ProductMediaInputType = z.infer<typeof ProductMediaInput>;
export type ProductVariantInputType = z.infer<typeof ProductVariantInput>;

export function slugify(s: string): string {
    return s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}
