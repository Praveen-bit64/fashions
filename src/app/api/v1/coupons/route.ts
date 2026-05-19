import { NextResponse } from 'next/server';
import { couponsService } from '@/services/coupons.service';
import {
    requireRole,
    ADMIN_READ,
    ADMIN_WRITE,
    apiOk,
    apiError,
} from '@/lib/api-auth';
import { CouponCreateSchema } from '@/lib/validation/coupon';

export const runtime = 'nodejs';

export async function GET(req: Request) {
    const auth = await requireRole(ADMIN_READ);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? undefined;

    const { items, total } = await couponsService.listAll({ search, take: 200 });
    return apiOk({ items, total });
}

export async function POST(req: Request) {
    const auth = await requireRole(ADMIN_WRITE);
    if (auth instanceof NextResponse) return auth;

    const json = await req.json().catch(() => null);
    const parsed = CouponCreateSchema.safeParse(json);
    if (!parsed.success) {
        return apiError(
            'VALIDATION_ERROR',
            parsed.error.issues[0]?.message ?? 'Invalid coupon data',
            422
        );
    }

    try {
        const created = await couponsService.create(parsed.data);
        return apiOk(created, 201);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Create failed';
        const status = message.includes('already exists') ? 409 : 400;
        return apiError(status === 409 ? 'CONFLICT' : 'BAD_REQUEST', message, status);
    }
}
