import { NextResponse } from 'next/server';
import { couponsService } from '@/services/coupons.service';
import {
    requireRole,
    ADMIN_READ,
    ADMIN_WRITE,
    apiOk,
    apiError,
} from '@/lib/api-auth';
import { CouponUpdateSchema } from '@/lib/validation/coupon';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
    const auth = await requireRole(ADMIN_READ);
    if (auth instanceof NextResponse) return auth;

    const { id } = await ctx.params;
    const coupon = await couponsService.getById(id);
    if (!coupon) return apiError('NOT_FOUND', 'Coupon not found', 404);
    return apiOk(coupon);
}

export async function PATCH(req: Request, ctx: Ctx) {
    const auth = await requireRole(ADMIN_WRITE);
    if (auth instanceof NextResponse) return auth;

    const { id } = await ctx.params;
    const json = await req.json().catch(() => null);
    const parsed = CouponUpdateSchema.safeParse(json);
    if (!parsed.success) {
        return apiError(
            'VALIDATION_ERROR',
            parsed.error.issues[0]?.message ?? 'Invalid update',
            422
        );
    }

    try {
        const updated = await couponsService.update(id, parsed.data);
        return apiOk(updated);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Update failed';
        const status = message === 'Coupon not found' ? 404 : 400;
        return apiError(
            status === 404 ? 'NOT_FOUND' : 'BAD_REQUEST',
            message,
            status
        );
    }
}

export async function DELETE(_req: Request, ctx: Ctx) {
    const auth = await requireRole(ADMIN_WRITE);
    if (auth instanceof NextResponse) return auth;

    const { id } = await ctx.params;
    try {
        await couponsService.deleteById(id);
        return apiOk({ id });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed';
        const status = message === 'Coupon not found' ? 404 : 400;
        return apiError(
            status === 404 ? 'NOT_FOUND' : 'BAD_REQUEST',
            message,
            status
        );
    }
}
