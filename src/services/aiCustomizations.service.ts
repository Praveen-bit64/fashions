import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const aiCustomizationsService = {
    /**
     * Recent generations with product join + order conversion flag.
     */
    async listRecent(params?: {
        take?: number;
        provider?: string;
        productId?: string;
    }) {
        const { take = 60, provider, productId } = params ?? {};
        const where: Prisma.AiCustomizationWhereInput = {
            ...(provider ? { provider } : {}),
            ...(productId ? { basedOnProductId: productId } : {}),
        };

        const items = await prisma.aiCustomization.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take,
            select: {
                id: true,
                provider: true,
                generatedUrl: true,
                bodyImageUrl: true,
                faceImageUrl: true,
                config: true,
                orderId: true,
                basedOnProductId: true,
                createdAt: true,
            },
        });

        // Hydrate product info in one query
        const productIds = Array.from(
            new Set(items.map((i) => i.basedOnProductId))
        );
        const products = productIds.length
            ? await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    media: { take: 1, orderBy: { position: 'asc' } },
                },
            })
            : [];
        const productMap = new Map(products.map((p) => [p.id, p]));

        return items.map((i) => ({
            id: i.id,
            provider: i.provider,
            generatedUrl: i.generatedUrl,
            bodyImageUrl: i.bodyImageUrl,
            faceImageUrl: i.faceImageUrl,
            config: i.config,
            convertedToOrderId: i.orderId,
            createdAt: i.createdAt,
            product: productMap.get(i.basedOnProductId) ?? null,
        }));
    },

    /**
     * Aggregate stats for the dashboard.
     */
    async stats() {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [total, today, thisWeek, byProviderRows, conversions] =
            await Promise.all([
                prisma.aiCustomization.count(),
                prisma.aiCustomization.count({
                    where: { createdAt: { gte: startOfDay } },
                }),
                prisma.aiCustomization.count({
                    where: { createdAt: { gte: weekAgo } },
                }),
                prisma.aiCustomization.groupBy({
                    by: ['provider'],
                    _count: true,
                    orderBy: { _count: { provider: 'desc' } },
                }),
                prisma.aiCustomization.count({
                    where: { orderId: { not: null } },
                }),
            ]);

        const byProvider = byProviderRows.map((r) => ({
            provider: r.provider,
            count: r._count,
        }));

        return {
            total,
            today,
            thisWeek,
            conversions,
            byProvider,
        };
    },

    /**
     * Top products by AI customization count.
     */
    async topProducts(take = 5) {
        const rows = await prisma.aiCustomization.groupBy({
            by: ['basedOnProductId'],
            _count: true,
            orderBy: { _count: { basedOnProductId: 'desc' } },
            take,
        });

        if (rows.length === 0) return [];

        const products = await prisma.product.findMany({
            where: { id: { in: rows.map((r) => r.basedOnProductId) } },
            select: {
                id: true,
                slug: true,
                title: true,
                media: { take: 1, orderBy: { position: 'asc' } },
            },
        });
        const map = new Map(products.map((p) => [p.id, p]));

        return rows
            .map((r) => {
                const product = map.get(r.basedOnProductId);
                if (!product) return null;
                return {
                    product,
                    count: r._count,
                };
            })
            .filter((x): x is { product: typeof products[number]; count: number } => x !== null);
    },

    /**
     * Top quota consumers — read AiQuota table directly.
     * Anon entries get masked IPs; user entries get joined to User.
     */
    async topQuotaConsumers(take = 10) {
        const rows = await prisma.aiQuota.findMany({
            orderBy: { usedCount: 'desc' },
            take,
        });

        const userIds = rows
            .filter((r) => r.identityKey.startsWith('user:'))
            .map((r) => r.identityKey.slice('user:'.length));

        const users = userIds.length
            ? await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, name: true, email: true },
            })
            : [];
        const userMap = new Map(users.map((u) => [u.id, u]));

        return rows.map((r) => {
            if (r.identityKey.startsWith('user:')) {
                const id = r.identityKey.slice('user:'.length);
                const u = userMap.get(id);
                return {
                    kind: 'user' as const,
                    label: u?.name ?? '(unknown user)',
                    sub: u?.email ?? id.slice(0, 8),
                    usedCount: r.usedCount,
                    windowStartsAt: r.windowStartsAt,
                };
            }
            // anon:<ip> — mask last octet for privacy
            const ip = r.identityKey.slice('anon:'.length);
            const masked = ip.replace(/(\.\d+)$/, '.×');
            return {
                kind: 'anon' as const,
                label: 'Anonymous',
                sub: masked,
                usedCount: r.usedCount,
                windowStartsAt: r.windowStartsAt,
            };
        });
    },
};
