import { prisma } from '@/lib/prisma';
import type {
    ProductCreateInput,
    ProductUpdateInput,
} from '@/lib/validation/product';

export const productsService = {
    async list(params?: {
        status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
        search?: string;
        take?: number;
        skip?: number;
    }) {
        const { status, search, take = 50, skip = 0 } = params ?? {};
        const where = {
            deletedAt: null,
            ...(status ? { status } : {}),
            ...(search
                ? {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' as const } },
                        { brand: { contains: search, mode: 'insensitive' as const } },
                    ],
                }
                : {}),
        };

        const [items, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take,
                skip,
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    media: { orderBy: { position: 'asc' } },
                    variants: { select: { id: true, size: true, color: true, stockQty: true, priceDelta: true } },
                    _count: { select: { variants: true } },
                },
            }),
            prisma.product.count({ where }),
        ]);

        return { items, total };
    },

    async getById(id: string) {
        return prisma.product.findFirst({
            where: { id, deletedAt: null },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                media: { orderBy: { position: 'asc' } },
                variants: { orderBy: { size: 'asc' } },
            },
        });
    },

    async getBySlug(slug: string) {
        // Any non-deleted product — Drafts and Archived are accessible by direct URL
        // but won't be listed in /products or featured sections (those filter to PUBLISHED).
        // The detail page surfaces a banner for non-PUBLISHED so the admin knows.
        return prisma.product.findFirst({
            where: { slug, deletedAt: null },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                media: { orderBy: { position: 'asc' } },
                variants: { orderBy: { size: 'asc' } },
            },
        });
    },

    async listPublic(params?: {
        take?: number;
        excludeId?: string;
        categoryId?: string;
    }) {
        const { take = 50, excludeId, categoryId } = params ?? {};
        return prisma.product.findMany({
            where: {
                deletedAt: null,
                status: 'PUBLISHED',
                ...(excludeId ? { id: { not: excludeId } } : {}),
                ...(categoryId ? { categoryId } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take,
            include: {
                category: { select: { id: true, name: true, slug: true } },
                media: { orderBy: { position: 'asc' } },
                variants: { orderBy: { size: 'asc' } },
            },
        });
    },

    async create(input: ProductCreateInput) {
        // Verify category exists
        const category = await prisma.category.findUnique({
            where: { id: input.categoryId },
        });
        if (!category) {
            throw new Error('Category not found');
        }

        return prisma.product.create({
            data: {
                slug: input.slug,
                title: input.title,
                brand: input.brand,
                description: input.description ?? null,
                categoryId: input.categoryId,
                basePrice: input.basePrice,
                discountPrice: input.discountPrice ?? null,
                status: input.status,
                isCustomizable: input.isCustomizable,
                isNewArrival: input.isNewArrival,
                isBestSeller: input.isBestSeller,
                media: {
                    create: input.media.map((m, position) => ({
                        url: m.url,
                        publicId: m.publicId ?? null,
                        kind: m.kind,
                        alt: m.alt ?? null,
                        position,
                    })),
                },
                variants: {
                    create: input.variants.map((v) => ({
                        sku: v.sku,
                        size: v.size,
                        color: v.color,
                        priceDelta: v.priceDelta,
                        stockQty: v.stockQty,
                    })),
                },
            },
            include: {
                category: true,
                media: true,
                variants: true,
            },
        });
    },

    async update(id: string, input: ProductUpdateInput) {
        const existing = await prisma.product.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existing) throw new Error('Product not found');

        const { media, variants, ...scalar } = input;

        return prisma.$transaction(async (tx) => {
            await tx.product.update({
                where: { id },
                data: {
                    ...scalar,
                    description: scalar.description ?? undefined,
                    discountPrice: scalar.discountPrice ?? undefined,
                },
            });

            // Replace media + variants wholesale (simpler than diffing, fine for moderate sizes)
            if (media) {
                await tx.productMedia.deleteMany({ where: { productId: id } });
                if (media.length > 0) {
                    await tx.productMedia.createMany({
                        data: media.map((m, position) => ({
                            productId: id,
                            url: m.url,
                            publicId: m.publicId ?? null,
                            kind: m.kind,
                            alt: m.alt ?? null,
                            position,
                        })),
                    });
                }
            }

            if (variants) {
                await tx.productVariant.deleteMany({ where: { productId: id } });
                if (variants.length > 0) {
                    await tx.productVariant.createMany({
                        data: variants.map((v) => ({
                            productId: id,
                            sku: v.sku,
                            size: v.size,
                            color: v.color,
                            priceDelta: v.priceDelta,
                            stockQty: v.stockQty,
                        })),
                    });
                }
            }

            return tx.product.findUnique({
                where: { id },
                include: {
                    category: true,
                    media: { orderBy: { position: 'asc' } },
                    variants: { orderBy: { size: 'asc' } },
                },
            });
        });
    },

    async softDelete(id: string) {
        return prisma.product.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'ARCHIVED' },
        });
    },
};
