import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            image: true,
            createdAt: true,
        },
    });

    if (!user) {
        return NextResponse.json(
            { success: false, error: 'Not found' },
            { status: 404 }
        );
    }

    return NextResponse.json({ success: true, data: user });
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const body = (await req.json().catch(() => null)) as
        | { name?: string; phone?: string }
        | null;
    if (!body?.name?.trim()) {
        return NextResponse.json(
            { success: false, error: 'Name is required' },
            { status: 400 }
        );
    }

    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
            name: body.name.trim(),
            phone: body.phone?.trim() || null,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            image: true,
            createdAt: true,
        },
    });

    return NextResponse.json({ success: true, data: user });
}
