import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { CategoryCreateSchema } from '@/lib/validation/category';
import {
    requireRole,
    ADMIN_WRITE,
    apiError,
    apiOk,
} from '@/lib/api-auth';

export const runtime = 'nodejs';

export async function GET() {
    const categories = await prisma.category.findMany({
        orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
        include: { _count: { select: { products: true } } },
    });
    return apiOk(categories);
}

export async function POST(req: Request) {
    const auth = await requireRole(ADMIN_WRITE);
    if (auth instanceof NextResponse) return auth;

    const json = await req.json().catch(() => null);
    if (!json) return apiError('BAD_REQUEST', 'Invalid JSON', 400);

    const parsed = CategoryCreateSchema.safeParse(json);
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
        const category = await prisma.category.create({
            data: {
                slug: parsed.data.slug,
                name: parsed.data.name,
                parentId: parsed.data.parentId ?? null,
            },
        });
        return apiOk(category, 201);
    } catch (err) {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2002'
        ) {
            return apiError(
                'CONFLICT',
                'A category with this slug already exists',
                409
            );
        }
        return apiError('INTERNAL', 'Create failed', 500);
    }
}
