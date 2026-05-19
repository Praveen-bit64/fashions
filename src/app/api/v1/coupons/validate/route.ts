import { NextResponse } from 'next/server';
import { couponsService } from '@/services/coupons.service';
import { requireAuth, apiOk, apiError } from '@/lib/api-auth';
import { CouponValidateSchema } from '@/lib/validation/coupon';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const json = await req.json().catch(() => null);
    const parsed = CouponValidateSchema.safeParse(json);
    if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Invalid request', 422);
    }

    const result = await couponsService.validate(
        parsed.data.code,
        parsed.data.subtotal
    );
    if (!result.ok) {
        return apiError('INVALID_COUPON', result.reason, 400);
    }
    return apiOk({
        code: result.coupon.code,
        type: result.coupon.type,
        value: result.coupon.value,
        discount: result.discount,
    });
}
