import { NextResponse } from 'next/server';
import {
    checkAnonQuota,
    getUserUsage,
    USER_DAILY_QUOTA,
} from '@/lib/ratelimit';
import { getIdentity } from '@/lib/requestIdentity';

export const runtime = 'nodejs';

export async function GET(req: Request) {
    const identity = getIdentity(req);

    if (identity.kind === 'anon') {
        const { remaining, limit } = await checkAnonQuota(identity.ip);
        return NextResponse.json({
            kind: 'anon',
            remaining,
            limit,
            window: 'lifetime',
        });
    }

    try {
        const { remaining, limit } = await getUserUsage(identity.id);
        return NextResponse.json({
            kind: 'user',
            remaining,
            limit,
            window: '1d',
        });
    } catch {
        return NextResponse.json({
            kind: 'user',
            remaining: USER_DAILY_QUOTA,
            limit: USER_DAILY_QUOTA,
            window: '1d',
        });
    }
}
