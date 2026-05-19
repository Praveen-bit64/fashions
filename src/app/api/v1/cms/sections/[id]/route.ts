import { NextResponse } from 'next/server';
import { cmsService } from '@/services/cms.service';
import { SectionUpdateSchema } from '@/lib/validation/cms';
import { requireRole, ADMIN_WRITE, apiOk, apiError } from '@/lib/api-auth';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
    const auth = await requireRole(ADMIN_WRITE);
    if (auth instanceof NextResponse) return auth;

    const { id } = await ctx.params;
    const json = await req.json().catch(() => null);
    const parsed = SectionUpdateSchema.safeParse(json);
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
        const updated = await cmsService.update(id, parsed.data);
        return apiOk(updated);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Update failed';
        return apiError('INTERNAL', message, 500);
    }
}
