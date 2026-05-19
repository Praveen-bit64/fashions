import { NextResponse } from 'next/server';
import { teamService } from '@/services/team.service';
import { requireRole, apiOk, apiError } from '@/lib/api-auth';
import { TeamInviteSchema } from '@/lib/validation/team';

export const runtime = 'nodejs';

export async function GET() {
    // Any admin can view the team list, write is gated below
    const auth = await requireRole([
        'SUPER_ADMIN',
        'PRODUCT_MANAGER',
        'CUSTOMER_SUPPORT',
        'TAILOR',
    ]);
    if (auth instanceof NextResponse) return auth;

    const items = await teamService.listAll();
    return apiOk({ items });
}

export async function POST(req: Request) {
    // Only SUPER_ADMIN can invite new staff
    const auth = await requireRole(['SUPER_ADMIN']);
    if (auth instanceof NextResponse) return auth;

    const json = await req.json().catch(() => null);
    const parsed = TeamInviteSchema.safeParse(json);
    if (!parsed.success) {
        return apiError(
            'VALIDATION_ERROR',
            parsed.error.issues[0]?.message ?? 'Invalid invite',
            422
        );
    }

    try {
        const member = await teamService.invite(parsed.data);
        return apiOk(member, 201);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Invite failed';
        const status = message.includes('already exists') ? 409 : 400;
        return apiError(status === 409 ? 'CONFLICT' : 'BAD_REQUEST', message, status);
    }
}
