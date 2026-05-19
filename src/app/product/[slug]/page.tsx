import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { productsService } from '@/services/products.service';
import { reviewsService } from '@/services/reviews.service';
import { toProductView } from '@/lib/catalog';
import ProductDetailClient from './ProductDetailClient';
import type {
    ApprovedReview,
    UserReview,
} from '@/components/product/ProductReviews';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
    const { slug } = await params;
    const product = await productsService.getBySlug(slug);
    if (!product) return { title: 'Product not found · Fashion' };
    return {
        title: `${product.title} · ${product.brand} · Fashion`,
        description:
            product.description?.slice(0, 160) ??
            `${product.brand} ${product.title} available now.`,
    };
}

export default async function ProductDetailPage({ params }: Ctx) {
    const { slug } = await params;
    const productRaw = await productsService.getBySlug(slug);
    if (!productRaw) notFound();

    const [relatedRaw, approvedRaw, session] = await Promise.all([
        productsService.listPublic({
            excludeId: productRaw.id,
            categoryId: productRaw.categoryId,
            take: 4,
        }),
        reviewsService.getApprovedForProduct(productRaw.id, 20),
        getServerSession(authOptions),
    ]);

    const product = toProductView(productRaw);
    const related = relatedRaw.map(toProductView);

    const approvedReviews: ApprovedReview[] = approvedRaw.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
        user: { id: r.user.id, name: r.user.name },
    }));

    let viewer:
        | { state: 'guest' }
        | { state: 'cannot-review' }
        | { state: 'already-reviewed'; review: UserReview }
        | { state: 'can-review' };

    if (!session?.user?.id) {
        viewer = { state: 'guest' };
    } else {
        const [existing, purchased] = await Promise.all([
            reviewsService.getUserReviewForProduct(session.user.id, productRaw.id),
            reviewsService.hasPurchased(session.user.id, productRaw.id),
        ]);
        if (existing) {
            viewer = {
                state: 'already-reviewed',
                review: {
                    id: existing.id,
                    rating: existing.rating,
                    title: existing.title,
                    body: existing.body,
                    status: existing.status,
                    createdAt: existing.createdAt.toISOString(),
                },
            };
        } else if (purchased) {
            viewer = { state: 'can-review' };
        } else {
            viewer = { state: 'cannot-review' };
        }
    }

    return (
        <ProductDetailClient
            product={product}
            related={related}
            approvedReviews={approvedReviews}
            viewer={viewer}
        />
    );
}
