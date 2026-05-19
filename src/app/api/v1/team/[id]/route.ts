import { NextResponse } from 'next/server';
import { teamService } from '@/services/team.service';
import { requireRole, apiOk, apiError } from '@/lib/api-auth';
import { TeamUpdateSchema } from '@/lib/validation/team';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
    const auth = await requireRole(['SUPER_ADMIN']);
    if (auth instanceof NextResponse) return auth;

    const { id } = await ctx.params;
    const json = await req.json().catch(() => null);
    const parsed = TeamUpdateSchema.safeParse(json);
    if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Invalid update', 422);
    }

    try {
        const updated = await teamService.update(id, parsed.data, auth.userId);
        return apiOk(updated);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Update failed';
        const status = message === 'Member not found' ? 404 : 400;
        return apiError(
            status === 404 ? 'NOT_FOUND' : 'CONFLICT',
            message,
            status
        );
    }
}

export async function DELETE(_req: Request, ctx: Ctx) {
    const auth = await requireRole(['SUPER_ADMIN']);
    if (auth instanceof NextResponse) return auth;

    const { id } = await ctx.params;
    try {
        await teamService.deactivate(id, auth.userId);
        return apiOk({ id });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Deactivate failed';
        const status = message === 'Member not found' ? 404 : 400;
        return apiError(
            status === 404 ? 'NOT_FOUND' : 'CONFLICT',
            message,
            status
        );
    }
}
