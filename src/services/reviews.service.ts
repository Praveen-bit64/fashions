import type { Prisma, ReviewStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ReviewCreateInput } from '@/lib/validation/review';

export const reviewsService = {
    /**
     * Storefront: list approved reviews for a product, newest first.
     */
    async getApprovedForProduct(productId: string, take = 20) {
        return prisma.review.findMany({
            where: { productId, status: 'APPROVED' },
            orderBy: { createdAt: 'desc' },
            take,
            select: {
                id: true,
                rating: true,
                title: true,
                body: true,
                createdAt: true,
                user: { select: { id: true, name: true } },
            },
        });
    },

    /**
     * Returns the current user's own review for a product (any status), if any.
     * Used to switch the form UI to a "your review" panel.
     */
    async getUserReviewForProduct(userId: string, productId: string) {
        return prisma.review.findFirst({
            where: { userId, productId },
            select: {
                id: true,
                rating: true,
                title: true,
                body: true,
                status: true,
                createdAt: true,
            },
        });
    },

    /**
     * Returns true if the user has at least one non-cancelled order containing the product.
     * Verified-purchaser gate for review submission.
     */
    async hasPurchased(userId: string, productId: string) {
        const item = await prisma.orderItem.findFirst({
            where: {
                productId,
                order: {
                    customerId: userId,
                    status: { notIn: ['CANCELLED'] },
                },
            },
            select: { id: true },
        });
        return Boolean(item);
    },

    /**
     * Customer submission. Creates a PENDING review. One review per user/product.
     * Caller must verify identity + verified-purchase status first.
     */
    async createForUser(userId: string, input: ReviewCreateInput) {
        const existing = await prisma.review.findFirst({
            where: { userId, productId: input.productId },
            select: { id: true },
        });
        if (existing) throw new Error('You have already reviewed this product');

        return prisma.review.create({
            data: {
                userId,
                productId: input.productId,
                rating: input.rating,
                title: input.title?.trim() || null,
                body: input.body?.trim() || null,
                status: 'PENDING',
            },
        });
    },

    /**
     * Admin: list reviews with optional status filter + product/user join.
     */
    async listAll(params?: {
        status?: ReviewStatus;
        search?: string;
        take?: number;
        skip?: number;
    }) {
        const { status, search, take = 100, skip = 0 } = params ?? {};

        const where: Prisma.ReviewWhereInput = {
            ...(status ? { status } : {}),
            ...(search
                ? {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { body: { contains: search, mode: 'insensitive' } },
                        {
                            product: {
                                OR: [
                                    { title: { contains: search, mode: 'insensitive' } },
                                    { slug: { contains: search, mode: 'insensitive' } },
                                ],
                            },
                        },
                        {
                            user: {
                                OR: [
                                    { name: { contains: search, mode: 'insensitive' } },
                                    { email: { contains: search, mode: 'insensitive' } },
                                ],
                            },
                        },
                    ],
                }
                : {}),
        };

        const [items, total, counts] = await Promise.all([
            prisma.review.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take,
                skip,
                include: {
                    product: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            media: { take: 1, orderBy: { position: 'asc' } },
                        },
                    },
                    user: { select: { id: true, name: true, email: true } },
                },
            }),
            prisma.review.count({ where }),
            prisma.review.groupBy({
                by: ['status'],
                _count: true,
            }),
        ]);

        const countsByStatus: Record<ReviewStatus, number> = {
            PENDING: 0,
            APPROVED: 0,
            HIDDEN: 0,
        };
        for (const c of counts) countsByStatus[c.status] = c._count;

        return { items, total, countsByStatus };
    },

    /**
     * Updates review status and keeps `Product.rating` + `reviewCount` in sync
     * by recomputing across all APPROVED reviews for the product.
     */
    async updateStatus(id: string, nextStatus: ReviewStatus) {
        const review = await prisma.review.findUnique({
            where: { id },
            select: { id: true, status: true, productId: true },
        });
        if (!review) throw new Error('Review not found');
        if (review.status === nextStatus) return review;

        return prisma.$transaction(async (tx) => {
            const updated = await tx.review.update({
                where: { id },
                data: { status: nextStatus },
            });

            const agg = await tx.review.aggregate({
                where: { productId: review.productId, status: 'APPROVED' },
                _avg: { rating: true },
                _count: true,
            });

            await tx.product.update({
                where: { id: review.productId },
                data: {
                    rating: agg._avg.rating ?? 0,
                    reviewCount: agg._count,
                },
            });

            return updated;
        });
    },

    async deleteById(id: string) {
        const review = await prisma.review.findUnique({
            where: { id },
            select: { id: true, productId: true, status: true },
        });
        if (!review) throw new Error('Review not found');

        return prisma.$transaction(async (tx) => {
            await tx.review.delete({ where: { id } });

            // Only recompute if it was contributing to the rating
            if (review.status === 'APPROVED') {
                const agg = await tx.review.aggregate({
                    where: { productId: review.productId, status: 'APPROVED' },
                    _avg: { rating: true },
                    _count: true,
                });
                await tx.product.update({
                    where: { id: review.productId },
                    data: {
                        rating: agg._avg.rating ?? 0,
                        reviewCount: agg._count,
                    },
                });
            }
        });
    },
};
