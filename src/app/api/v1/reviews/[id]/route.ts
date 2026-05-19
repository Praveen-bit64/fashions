import { NextResponse } from 'next/server';
import { reviewsService } from '@/services/reviews.service';
import { requireRole, ADMIN_WRITE, apiOk, apiError } from '@/lib/api-auth';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
    const auth = await requireRole(ADMIN_WRITE);
    if (auth instanceof NextResponse) return auth;

    const { id } = await ctx.params;
    try {
        await reviewsService.deleteById(id);
        return apiOk({ id });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed';
        const code = message === 'Review not found' ? 'NOT_FOUND' : 'CONFLICT';
        const status = code === 'NOT_FOUND' ? 404 : 400;
        return apiError(code, message, status);
    }
}
