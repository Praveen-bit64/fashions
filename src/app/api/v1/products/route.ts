import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ProductCreateSchema } from '@/lib/validation/product';
import { productsService } from '@/services/products.service';
import {
    requireRole,
    ADMIN_WRITE,
    apiError,
    apiOk,
} from '@/lib/api-auth';

export const runtime = 'nodejs';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as
        | 'DRAFT'
        | 'PUBLISHED'
        | 'ARCHIVED'
        | null;
    const search = searchParams.get('search') ?? undefined;
    const take = Math.min(100, Number(searchParams.get('take') ?? 50));
    const skip = Math.max(0, Number(searchParams.get('skip') ?? 0));

    const result = await productsService.list({
        status: status ?? undefined,
        search,
        take,
        skip,
    });
    return apiOk(result);
}

export async function POST(req: Request) {
    const auth = await requireRole(ADMIN_WRITE);
    if (auth instanceof NextResponse) return auth;

    const json = await req.json().catch(() => null);
    if (!json) return apiError('BAD_REQUEST', 'Invalid JSON', 400);

    const parsed = ProductCreateSchema.safeParse(json);
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
        const product = await productsService.create(parsed.data);
        return apiOk(product, 201);
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                const target = (err.meta?.target as string[] | undefined)?.[0] ?? 'field';
                return apiError(
                    'CONFLICT',
                    `A product with this ${target} already exists`,
                    409
                );
            }
        }
        const message = err instanceof Error ? err.message : 'Create failed';
        return apiError('INTERNAL', message, 500);
    }
}
