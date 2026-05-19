import type { Coupon, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type {
    CouponCreateInput,
    CouponUpdateInput,
} from '@/lib/validation/coupon';

export type CouponApplyResult =
    | { ok: true; coupon: Coupon; discount: number }
    | { ok: false; reason: string };

/**
 * Pure function: given a coupon + a subtotal, returns the discount in paise
 * or a rejection reason. No DB mutations.
 */
export function evaluateCoupon(
    coupon: Coupon | null,
    subtotal: number,
    now: Date = new Date()
): CouponApplyResult {
    if (!coupon) return { ok: false, reason: 'Invalid coupon code' };
    if (!coupon.active) return { ok: false, reason: 'This coupon is inactive' };
    if (coupon.validFrom && now < coupon.validFrom) {
        return { ok: false, reason: 'This coupon is not yet active' };
    }
    if (coupon.validUntil && now > coupon.validUntil) {
        return { ok: false, reason: 'This coupon has expired' };
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return { ok: false, reason: 'This coupon has reached its usage limit' };
    }
    if (subtotal < coupon.minSubtotal) {
        return {
            ok: false,
            reason: `Add ₹${(coupon.minSubtotal - subtotal).toLocaleString('en-IN')} more to use this coupon`,
        };
    }
    const discount =
        coupon.type === 'PERCENT'
            ? Math.min(subtotal, Math.round((subtotal * coupon.value) / 100))
            : Math.min(subtotal, coupon.value);
    return { ok: true, coupon, discount };
}

export const couponsService = {
    async listAll(params?: { search?: string; take?: number; skip?: number }) {
        const { search, take = 100, skip = 0 } = params ?? {};
        const where: Prisma.CouponWhereInput = search
            ? { code: { contains: search, mode: 'insensitive' } }
            : {};

        const [items, total] = await Promise.all([
            prisma.coupon.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take,
                skip,
            }),
            prisma.coupon.count({ where }),
        ]);

        return { items, total };
    },

    async getById(id: string) {
        return prisma.coupon.findUnique({ where: { id } });
    },

    async findByCode(code: string) {
        return prisma.coupon.findUnique({
            where: { code: code.trim().toUpperCase() },
        });
    },

    async create(input: CouponCreateInput) {
        const existing = await this.findByCode(input.code);
        if (existing) throw new Error('A coupon with this code already exists');

        return prisma.coupon.create({
            data: {
                code: input.code,
                type: input.type,
                value: input.value,
                minSubtotal: input.minSubtotal,
                validFrom: input.validFrom ?? null,
                validUntil: input.validUntil ?? null,
                usageLimit: input.usageLimit ?? null,
                active: input.active,
            },
        });
    },

    async update(id: string, input: CouponUpdateInput) {
        const existing = await prisma.coupon.findUnique({ where: { id } });
        if (!existing) throw new Error('Coupon not found');

        return prisma.coupon.update({
            where: { id },
            data: {
                ...(input.type !== undefined ? { type: input.type } : {}),
                ...(input.value !== undefined ? { value: input.value } : {}),
                ...(input.minSubtotal !== undefined
                    ? { minSubtotal: input.minSubtotal }
                    : {}),
                ...(input.validFrom !== undefined
                    ? { validFrom: input.validFrom }
                    : {}),
                ...(input.validUntil !== undefined
                    ? { validUntil: input.validUntil }
                    : {}),
                ...(input.usageLimit !== undefined
                    ? { usageLimit: input.usageLimit }
                    : {}),
                ...(input.active !== undefined ? { active: input.active } : {}),
            },
        });
    },

    async deleteById(id: string) {
        const existing = await prisma.coupon.findUnique({ where: { id } });
        if (!existing) throw new Error('Coupon not found');
        await prisma.coupon.delete({ where: { id } });
    },

    /**
     * Customer-facing: validates a code against a subtotal. Read-only;
     * the actual `usedCount` increment happens during order creation.
     */
    async validate(code: string, subtotal: number): Promise<CouponApplyResult> {
        const coupon = await this.findByCode(code);
        return evaluateCoupon(coupon, subtotal);
    },
};
