import { NextResponse } from 'next/server';
import { ordersService } from '@/services/orders.service';
import { requireAuth, apiOk, apiError } from '@/lib/api-auth';
import { isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/v1/orders/[id]/cancel
 * Allows a customer to cancel their own order while it's still in PENDING
 * or CONFIRMED. Admins can cancel any order regardless of role gating here.
 */
export async function POST(_req: Request, ctx: Ctx) {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await ctx.params;

    const order = await ordersService.getById(
        id,
        isAdmin(session.role) ? undefined : { customerId: session.userId }
    );
    if (!order) return apiError('NOT_FOUND', 'Order not found', 404);

    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
        return apiError(
            'CONFLICT',
            `Cannot cancel an order in ${order.status} state`,
            409
        );
    }

    try {
        const updated = await ordersService.updateStatus(id, 'CANCELLED');
        return apiOk(updated);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Cancel failed';
        return apiError('INTERNAL', message, 500);
    }
}
