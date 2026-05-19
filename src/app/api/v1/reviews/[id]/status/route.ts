import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { ReviewStatus } from '@prisma/client';
import { reviewsService } from '@/services/reviews.service';
import { requireRole, ADMIN_WRITE, apiOk, apiError } from '@/lib/api-auth';

export const runtime = 'nodejs';

const Schema = z.object({
    status: z.enum(['PENDING', 'APPROVED', 'HIDDEN']),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
    const auth = await requireRole(ADMIN_WRITE);
    if (auth instanceof NextResponse) return auth;

    const { id } = await ctx.params;
    const json = await req.json().catch(() => null);
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Invalid status', 422);
    }

    try {
        const updated = await reviewsService.updateStatus(
            id,
            parsed.data.status as ReviewStatus
        );
        return apiOk(updated);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Update failed';
        const code = message === 'Review not found' ? 'NOT_FOUND' : 'CONFLICT';
        const status = code === 'NOT_FOUND' ? 404 : 400;
        return apiError(code, message, status);
    }
}

