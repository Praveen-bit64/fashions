import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Role } from '@prisma/client';
import { authOptions } from './auth';

export type AuthedSession = {
    userId: string;
    role: Role;
    name: string;
    email: string;
};

/**
 * Returns the active session or a NextResponse 401/403.
 * Use:  const session = await requireRole(['SUPER_ADMIN', 'PRODUCT_MANAGER']);
 *       if (session instanceof NextResponse) return session;
 */
export async function requireRole(
    allowed: Role[]
): Promise<AuthedSession | NextResponse> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json(
            { ok: false, error: { code: 'UNAUTHORIZED', message: 'Sign in required' } },
            { status: 401 }
        );
    }
    if (!allowed.includes(session.user.role)) {
        return NextResponse.json(
            { ok: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
            { status: 403 }
        );
    }
    return {
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
    };
}

export async function requireAuth(): Promise<AuthedSession | NextResponse> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json(
            { ok: false, error: { code: 'UNAUTHORIZED', message: 'Sign in required' } },
            { status: 401 }
        );
    }
    return {
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
    };
}

export const ADMIN_WRITE: Role[] = ['SUPER_ADMIN', 'PRODUCT_MANAGER'];
export const ADMIN_READ: Role[] = [
    'SUPER_ADMIN',
    'PRODUCT_MANAGER',
    'CUSTOMER_SUPPORT',
    'TAILOR',
];

export function apiOk<T>(data: T, status = 200) {
    return NextResponse.json({ ok: true, data }, { status });
}

export function apiError(code: string, message: string, status = 400) {
    return NextResponse.json(
        { ok: false, error: { code, message } },
        { status }
    );
}
