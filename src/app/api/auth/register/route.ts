import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type RegisterBody = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export async function POST(req: Request) {
    let body: RegisterBody;
    try {
        body = (await req.json()) as RegisterBody;
    } catch {
        return NextResponse.json(
            { success: false, error: 'Invalid JSON' },
            { status: 400 }
        );
    }

    const { name, email, password, confirmPassword } = body;

    if (!name?.trim() || !email?.trim() || !password || !confirmPassword) {
        return NextResponse.json(
            { success: false, error: 'All fields are required' },
            { status: 400 }
        );
    }

    if (password.length < 6) {
        return NextResponse.json(
            { success: false, error: 'Password must be at least 6 characters' },
            { status: 400 }
        );
    }

    if (password !== confirmPassword) {
        return NextResponse.json(
            { success: false, error: "Passwords don't match" },
            { status: 400 }
        );
    }

    const normalisedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
        where: { email: normalisedEmail },
    });

    if (existing) {
        return NextResponse.json(
            { success: false, error: 'Email already in use' },
            { status: 409 }
        );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email: normalisedEmail,
            password: hashed,
            role: 'CUSTOMER',
        },
        select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, data: user });
}
