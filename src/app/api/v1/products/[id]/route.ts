import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ProductUpdateSchema } from '@/lib/validation/product';
import { productsService } from '@/services/products.service';
import {
    requireRole,
    ADMIN_WRITE,
    apiError,
    apiOk,
} from '@/lib/api-auth';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
    const { id } = await ctx.params;
    const product = await productsService.getById(id);
    if (!product) return apiError('NOT_FOUND', 'Product not found', 404);
    return apiOk(product);
}

export async function PATCH(req: Request, ctx: Ctx) {
    const auth = await requireRole(ADMIN_WRITE);
    if (auth instanceof NextResponse) return auth;

    const { id } = await ctx.params;
    const json = await req.json().catch(() => null);
    if (!json) return apiError('BAD_REQUEST', 'Invalid JSON', 400);

    const parsed = ProductUpdateSchema.safeParse(json);
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
        const product = await productsService.update(id, parsed.data);
        return apiOk(product);
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
        const message = err instanceof Error ? err.message : 'Update failed';
        const status = message === 'Product not found' ? 404 : 500;
        return apiError(
            status === 404 ? 'NOT_FOUND' : 'INTERNAL',
            message,
            status
        );
    }
}

export async function DELETE(_req: Request, ctx: Ctx) {
    const auth = await requireRole(ADMIN_WRITE);
    if (auth instanceof NextResponse) return auth;

    const { id } = await ctx.params;
    try {
        await productsService.softDelete(id);
        return apiOk({ id });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed';
        return apiError('INTERNAL', message, 500);
    }
}
