import { NextResponse } from 'next/server';
import type { OrderStatus } from '@prisma/client';
import { CreateOrderSchema } from '@/lib/validation/order';
import { ordersService } from '@/services/orders.service';
import {
    requireAuth,
    requireRole,
    ADMIN_READ,
    apiOk,
    apiError,
} from '@/lib/api-auth';

export const runtime = 'nodejs';

/**
 * GET /api/v1/orders
 *   - admin: list all (filterable)
 *   - customer: list their own
 */
export async function GET(req: Request) {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const isAdminQuery = searchParams.get('scope') === 'admin';

    if (isAdminQuery) {
        // Re-gate to admin roles
        const adminCheck = await requireRole(ADMIN_READ);
        if (adminCheck instanceof NextResponse) return adminCheck;

        const status = searchParams.get('status') as OrderStatus | null;
        const search = searchParams.get('search') ?? undefined;
        const take = Math.min(100, Number(searchParams.get('take') ?? 50));
        const skip = Math.max(0, Number(searchParams.get('skip') ?? 0));

        const result = await ordersService.listAll({
            status: status ?? undefined,
            search,
            take,
            skip,
        });
        return apiOk(result);
    }

    const items = await ordersService.listForCustomer(session.userId);
    return apiOk({ items, total: items.length });
}

/**
 * POST /api/v1/orders
 */
export async function POST(req: Request) {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const json = await req.json().catch(() => null);
    if (!json) return apiError('BAD_REQUEST', 'Invalid JSON', 400);

    const parsed = CreateOrderSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            {
                ok: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input',
                    details: parsed.error.flatten(),
                },
            },
            { status: 422 }
        );
    }

    try {
        const order = await ordersService.create(session.userId, parsed.data);
        return apiOk(order, 201);
    } catch (err) {
        console.error('[api/v1/orders] create failed', err);
        const message = err instanceof Error ? err.message : 'Create failed';
        return apiError('INTERNAL', message, 500);
    }
}
