import type { ReviewStatus } from '@prisma/client';
import { reviewsService } from '@/services/reviews.service';
import PageHeader from '@/components/admin/PageHeader';
import ReviewsClient, { type ReviewView } from './ReviewsClient';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ status?: string }>;

const VALID_STATUSES: ReviewStatus[] = ['PENDING', 'APPROVED', 'HIDDEN'];

export default async function AdminReviewsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const { status: rawStatus } = await searchParams;
    const statusFilter =
        rawStatus && VALID_STATUSES.includes(rawStatus as ReviewStatus)
            ? (rawStatus as ReviewStatus)
            : rawStatus === 'ALL'
                ? undefined
                : 'PENDING';

    const activeFilter: 'PENDING' | 'APPROVED' | 'HIDDEN' | 'ALL' =
        statusFilter ?? 'ALL';

    const { items, countsByStatus } = await reviewsService.listAll({
        status: statusFilter,
        take: 100,
    });

    const serialised: ReviewView[] = items.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        product: {
            id: r.product.id,
            slug: r.product.slug,
            title: r.product.title,
            media: r.product.media.map((m) => ({ url: m.url })),
        },
        user: {
            id: r.user.id,
            name: r.user.name,
            email: r.user.email,
        },
    }));

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Reviews' },
                ]}
                eyebrow="Engagement"
                title="Reviews"
                description="Approve, hide, or remove customer reviews. Approved reviews update the product rating automatically."
            />

            <ReviewsClient
                initial={serialised}
                countsByStatus={countsByStatus}
                activeFilter={activeFilter}
            />
        </>
    );
}
