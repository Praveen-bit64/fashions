import { NextResponse } from 'next/server';
import { cmsService } from '@/services/cms.service';
import { requireRole, ADMIN_WRITE, apiOk } from '@/lib/api-auth';

export const runtime = 'nodejs';

export async function GET() {
    const auth = await requireRole(ADMIN_WRITE);
    if (auth instanceof NextResponse) return auth;

    await cmsService.ensureDefaults();
    const sections = await cmsService.listAll();
    return apiOk(sections);
}
