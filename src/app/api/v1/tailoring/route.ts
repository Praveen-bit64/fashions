import { NextResponse } from 'next/server';
import { tailoringService } from '@/services/tailoring.service';
import { requireRole, ADMIN_READ, apiOk } from '@/lib/api-auth';

export const runtime = 'nodejs';

export async function GET() {
    const auth = await requireRole(ADMIN_READ);
    if (auth instanceof NextResponse) return auth;

    const items = await tailoringService.list();
    return apiOk(items);
}
