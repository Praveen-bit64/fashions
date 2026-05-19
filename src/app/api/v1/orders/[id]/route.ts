import { NextResponse } from 'next/server';
import { ordersService } from '@/services/orders.service';
import { isAdmin } from '@/lib/auth';
import { requireAuth, apiOk, apiError } from '@/lib/api-auth';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await ctx.params;
    const order = await ordersService.getById(
        id,
        isAdmin(session.role) ? undefined : { customerId: session.userId }
    );
    if (!order) return apiError('NOT_FOUND', 'Order not found', 404);
    return apiOk(order);
}
