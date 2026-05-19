import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type Body = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const body = (await req.json().catch(() => null)) as Body | null;
    if (!body?.currentPassword || !body.newPassword || !body.confirmPassword) {
        return NextResponse.json(
            { success: false, error: 'All fields are required' },
            { status: 400 }
        );
    }

    if (body.newPassword.length < 6) {
        return NextResponse.json(
            { success: false, error: 'Password must be at least 6 characters' },
            { status: 400 }
        );
    }

    if (body.newPassword !== body.confirmPassword) {
        return NextResponse.json(
            { success: false, error: "Passwords don't match" },
            { status: 400 }
        );
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
    });

    if (!user?.password) {
        return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
        );
    }

    const ok = await bcrypt.compare(body.currentPassword, user.password);
    if (!ok) {
        return NextResponse.json(
            { success: false, error: 'Current password is incorrect' },
            { status: 400 }
        );
    }

    const hashed = await bcrypt.hash(body.newPassword, 10);
    await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashed },
    });

    return NextResponse.json({ success: true });
}
