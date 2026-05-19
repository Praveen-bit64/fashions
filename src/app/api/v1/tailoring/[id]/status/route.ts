import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { TailoringStatus } from '@prisma/client';
import { tailoringService } from '@/services/tailoring.service';
import { requireRole, ADMIN_READ, apiOk, apiError } from '@/lib/api-auth';

export const runtime = 'nodejs';

const Schema = z.object({
    status: z.enum([
        'PENDING',
        'MEASUREMENT_RECEIVED',
        'CUTTING',
        'STITCHING',
        'FINISHING',
        'QC',
        'DISPATCHED',
    ]),
    note: z.string().max(500).optional().nullable(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
    const auth = await requireRole(ADMIN_READ);
    if (auth instanceof NextResponse) return auth;

    const { id } = await ctx.params;
    const json = await req.json().catch(() => null);
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Invalid status', 422);
    }

    try {
        const job = await tailoringService.transition(
            id,
            parsed.data.status as TailoringStatus,
            auth.userId,
            parsed.data.note ?? undefined
        );
        return apiOk(job);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Update failed';
        const status = message === 'Tailoring job not found' ? 404 : 400;
        return apiError(
            status === 404 ? 'NOT_FOUND' : 'CONFLICT',
            message,
            status
        );
    }
}
