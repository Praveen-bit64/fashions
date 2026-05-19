import type { Prisma, TailoringStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
    canTransition,
    TAILORING_TIMESTAMP_FIELD,
} from '@/features/tailoring/state-machine';

export const tailoringService = {
    async list() {
        return prisma.tailoringJob.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        total: true,
                        createdAt: true,
                        customer: { select: { id: true, name: true, email: true } },
                        items: {
                            select: {
                                title: true,
                                size: true,
                                color: true,
                                quantity: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
                assignedTo: { select: { id: true, name: true } },
            },
        });
    },

    async getById(id: string) {
        return prisma.tailoringJob.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        customer: true,
                        items: true,
                        shippingAddress: true,
                    },
                },
                assignedTo: { select: { id: true, name: true, email: true } },
                events: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    },

    /**
     * Create a TailoringJob for an order. Called automatically when an order
     * transitions to IN_PRODUCTION. Idempotent — returns existing if present.
     */
    async createForOrder(orderId: string, tx?: Prisma.TransactionClient) {
        const db = tx ?? prisma;
        const existing = await db.tailoringJob.findUnique({
            where: { orderId },
        });
        if (existing) return existing;
        return db.tailoringJob.create({
            data: {
                orderId,
                status: 'PENDING',
            },
        });
    },

    /**
     * Advance / bounce a job through the pipeline. Validates the move against
     * the state machine, stamps the matching timestamp column, and logs an event.
     */
    async transition(
        id: string,
        nextStatus: TailoringStatus,
        actorId: string,
        note?: string
    ) {
        const job = await prisma.tailoringJob.findUnique({
            where: { id },
            select: { status: true },
        });
        if (!job) throw new Error('Tailoring job not found');

        if (job.status === nextStatus) return job;

        if (!canTransition(job.status, nextStatus)) {
            throw new Error(
                `Illegal transition: ${job.status} → ${nextStatus}`
            );
        }

        return prisma.$transaction(async (tx) => {
            const timestampField = TAILORING_TIMESTAMP_FIELD[nextStatus];
            const data: Prisma.TailoringJobUpdateInput = {
                status: nextStatus,
                ...(timestampField
                    ? { [timestampField]: new Date() }
                    : {}),
            };

            const updated = await tx.tailoringJob.update({
                where: { id },
                data,
            });

            await tx.tailoringEvent.create({
                data: {
                    jobId: id,
                    fromStatus: job.status,
                    toStatus: nextStatus,
                    actorId,
                    note: note ?? null,
                },
            });

            // If dispatched, push the parent order forward too
            if (nextStatus === 'DISPATCHED') {
                await tx.order.update({
                    where: { id: updated.orderId },
                    data: { status: 'READY_TO_SHIP' },
                });
            }

            return updated;
        });
    },

    async assign(id: string, tailorUserId: string | null) {
        return prisma.tailoringJob.update({
            where: { id },
            data: { assignedToId: tailorUserId },
        });
    },
};
