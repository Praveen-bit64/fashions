import { NextResponse } from 'next/server';
import { reviewsService } from '@/services/reviews.service';
import { requireAuth, apiOk, apiError } from '@/lib/api-auth';
import { ReviewCreateSchema } from '@/lib/validation/review';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const json = await req.json().catch(() => null);
    const parsed = ReviewCreateSchema.safeParse(json);
    if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Invalid review data', 422);
    }

    const purchased = await reviewsService.hasPurchased(
        auth.userId,
        parsed.data.productId
    );
    if (!purchased) {
        return apiError(
            'FORBIDDEN',
            'You can only review products you have ordered',
            403
        );
    }

    try {
        const review = await reviewsService.createForUser(auth.userId, parsed.data);
        return apiOk(review, 201);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Submit failed';
        const status = message.includes('already reviewed') ? 409 : 400;
        return apiError(status === 409 ? 'CONFLICT' : 'BAD_REQUEST', message, status);
    }
}
