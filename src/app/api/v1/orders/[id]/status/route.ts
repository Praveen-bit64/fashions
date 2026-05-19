import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { OrderStatus } from '@prisma/client';
import { ordersService } from '@/services/orders.service';
import {
    requireRole,
    ADMIN_READ,
    apiOk,
    apiError,
} from '@/lib/api-auth';

export const runtime = 'nodejs';

const StatusSchema = z.object({
    status: z.enum([
        'PENDING',
        'CONFIRMED',
        'IN_PRODUCTION',
        'READY_TO_SHIP',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'RETURNED',
    ]),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
    // Admins and tailors can move statuses
    const auth = await requireRole(ADMIN_READ);
    if (auth instanceof NextResponse) return auth;

    const { id } = await ctx.params;
    const json = await req.json().catch(() => null);
    const parsed = StatusSchema.safeParse(json);
    if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Invalid status', 422);
    }

    try {
        const order = await ordersService.updateStatus(
            id,
            parsed.data.status as OrderStatus
        );
        return apiOk(order);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Update failed';
        const status = message === 'Order not found' ? 404 : 400;
        return apiError(status === 404 ? 'NOT_FOUND' : 'CONFLICT', message, status);
    }
}
