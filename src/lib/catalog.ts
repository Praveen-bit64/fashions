import type { Prisma } from '@prisma/client';

/**
 * The view-model the storefront UI expects (ProductCard, list item, detail page).
 * Decoupled from the Prisma model so we can rename DB columns without rewiring UI.
 */
export type ProductView = {
    id: string; // UUID — used for cart/wishlist
    slug: string; // URL key
    title: string;
    brand: string;
    description: string | null;
    originalPrice: number;
    discountedPrice?: number;
    discountPercentage?: number;
    rating: number;
    reviewCount: number;
    image: string;
    images: string[];
    isNewArrival: boolean;
    isBestSeller: boolean;
    isOutOfStock: boolean;
    isCustomizable: boolean;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    categoryId: string;
    categoryName: string;
    variants: Array<{
        id: string;
        size: string;
        color: string;
        priceDelta: number;
        stockQty: number;
    }>;
};

type PrismaProductWithRelations = Prisma.ProductGetPayload<{
    include: {
        category: { select: { id: true; name: true; slug: true } };
        media: true;
        variants: true;
    };
}>;

const PLACEHOLDER_IMAGE = '/feature-prod-1.jpg';

export function toProductView(p: PrismaProductWithRelations): ProductView {
    const media = p.media ?? [];
    const variants = p.variants ?? [];
    const sortedMedia = [...media].sort((a, b) => a.position - b.position);
    const allImages = sortedMedia.map((m) => m.url);
    const primary = allImages[0] ?? PLACEHOLDER_IMAGE;
    const rest = allImages.slice(1);

    const totalStock = variants.reduce((sum, v) => sum + v.stockQty, 0);
    const hasVariants = variants.length > 0;
    const isOutOfStock = hasVariants && totalStock === 0;

    const discountedPrice = p.discountPrice ?? undefined;
    const discountPercentage = discountedPrice
        ? Math.round(((p.basePrice - discountedPrice) / p.basePrice) * 100)
        : undefined;

    return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        brand: p.brand,
        description: p.description,
        originalPrice: p.basePrice,
        discountedPrice,
        discountPercentage,
        rating: p.rating,
        reviewCount: p.reviewCount,
        image: primary,
        images: rest,
        isNewArrival: p.isNewArrival,
        isBestSeller: p.isBestSeller,
        isOutOfStock,
        isCustomizable: p.isCustomizable,
        status: p.status,
        categoryId: p.categoryId,
        categoryName: p.category.name,
        variants: variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            priceDelta: v.priceDelta,
            stockQty: v.stockQty,
        })),
    };
}
