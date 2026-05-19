import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const customersService = {
    /**
     * Admin: list customers with aggregate order stats.
     * Excludes soft-deleted users and only returns CUSTOMER role.
     */
    async listAll(params?: { search?: string; take?: number; skip?: number }) {
        const { search, take = 50, skip = 0 } = params ?? {};

        const where: Prisma.UserWhereInput = {
            role: 'CUSTOMER',
            deletedAt: null,
            ...(search
                ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { phone: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take,
                skip,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    createdAt: true,
                    _count: { select: { orders: true, addresses: true } },
                    orders: {
                        select: { total: true, createdAt: true, status: true },
                        orderBy: { createdAt: 'desc' },
                    },
                },
            }),
            prisma.user.count({ where }),
        ]);

        const items = users.map((u) => {
            const cancelled = new Set(['CANCELLED', 'RETURNED']);
            const validOrders = u.orders.filter((o) => !cancelled.has(o.status));
            const lifetimeValue = validOrders.reduce((sum, o) => sum + o.total, 0);
            return {
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                createdAt: u.createdAt,
                ordersCount: u._count.orders,
                addressesCount: u._count.addresses,
                lifetimeValue,
                lastOrderAt: u.orders[0]?.createdAt ?? null,
            };
        });

        return { items, total };
    },

    /**
     * Admin: full customer profile — orders, addresses, measurements.
     */
    async getById(id: string) {
        const user = await prisma.user.findFirst({
            where: { id, role: 'CUSTOMER', deletedAt: null },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                createdAt: true,
                emailVerified: true,
                addresses: {
                    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
                },
                measurement: true,
                orders: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true,
                        total: true,
                        createdAt: true,
                        payment: { select: { status: true, method: true } },
                        _count: { select: { items: true } },
                    },
                },
            },
        });

        if (!user) return null;

        const cancelled = new Set(['CANCELLED', 'RETURNED']);
        const validOrders = user.orders.filter((o) => !cancelled.has(o.status));
        const lifetimeValue = validOrders.reduce((sum, o) => sum + o.total, 0);

        return {
            ...user,
            stats: {
                ordersCount: user.orders.length,
                lifetimeValue,
                avgOrderValue:
                    validOrders.length > 0
                        ? Math.round(lifetimeValue / validOrders.length)
                        : 0,
                lastOrderAt: user.orders[0]?.createdAt ?? null,
            },
        };
    },
};
