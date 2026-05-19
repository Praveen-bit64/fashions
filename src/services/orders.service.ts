import crypto from 'node:crypto';
import type {
    OrderStatus,
    PaymentMethod,
    Prisma,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type {
    CreateOrderInput,
    OrderItemInput,
    ShippingAddressInput,
} from '@/lib/validation/order';
import { canTransition } from '@/features/orders/state-machine';
import { evaluateCoupon } from './coupons.service';

function generateOrderNumber(): string {
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `FW-${random}`;
}

function computeShipping(subtotal: number, delivery: 'standard' | 'express') {
    if (delivery === 'express') return 199;
    return subtotal >= 999 ? 0 : 99;
}

export type OrderCreateResult = Prisma.OrderGetPayload<{
    include: {
        items: true;
        payment: true;
        shippingAddress: true;
        billingAddress: true;
    };
}>;

export const ordersService = {
    /**
     * Creates an order with line items, shipping address, and payment record.
     * Prices and totals are computed server-side from the product table —
     * the client's claimed prices are never trusted.
     */
    async create(
        customerId: string,
        input: CreateOrderInput
    ): Promise<OrderCreateResult> {
        // 1. Pull authoritative product data for all line items
        const productIds = Array.from(new Set(input.items.map((i) => i.productId)));
        const products = await prisma.product.findMany({
            where: { id: { in: productIds }, deletedAt: null },
            include: {
                media: { orderBy: { position: 'asc' }, take: 1 },
            },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));

        // 2. Validate every requested item exists
        for (const item of input.items) {
            if (!productMap.has(item.productId)) {
                throw new Error(
                    `Product not available: ${item.productId.slice(0, 8)}`
                );
            }
        }

        // 3. Compute server-side totals
        let subtotal = 0;
        const lineItems = input.items.map((item) => {
            const product = productMap.get(item.productId)!;
            const unitPrice = product.discountPrice ?? product.basePrice;
            subtotal += unitPrice * item.quantity;
            return {
                productId: product.id,
                variantId: item.variantId ?? null,
                title: product.title,
                brand: product.brand,
                imageUrl: product.media[0]?.url ?? '',
                unitPrice,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                isCustom: false,
            };
        });

        // Look up + evaluate coupon (if any). Re-validating server-side
        // means a stale client cart cannot abuse expired/limit-reached codes.
        let discount = 0;
        let appliedCode: string | null = null;
        let appliedCouponId: string | null = null;
        if (input.couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: input.couponCode.trim().toUpperCase() },
            });
            const result = evaluateCoupon(coupon, subtotal);
            if (result.ok) {
                discount = result.discount;
                appliedCode = result.coupon.code;
                appliedCouponId = result.coupon.id;
            }
            // Silently ignore invalid codes — the customer already saw a
            // validation error on the /coupons/validate call at checkout.
        }

        const shipping = computeShipping(subtotal, input.delivery);
        const total = Math.max(0, subtotal - discount) + shipping;

        // 4. Determine initial order + payment status
        const paymentMethod: PaymentMethod = input.payment;
        // COD = order confirmed immediately, payment captured on delivery.
        // UPI/CARD = order pending until a real payment gateway confirms.
        const orderStatus: OrderStatus =
            paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING';

        // 5. Write everything in a single transaction
        const order = await prisma.$transaction(async (tx) => {
            const shippingAddress = await tx.address.create({
                data: {
                    ...mapAddress(input.shipping, customerId),
                },
            });

            let billingAddressId: string | null = null;
            if (input.billing) {
                const billing = await tx.address.create({
                    data: {
                        ...mapAddress(input.billing, customerId),
                    },
                });
                billingAddressId = billing.id;
            }

            const created = await tx.order.create({
                data: {
                    orderNumber: generateOrderNumber(),
                    customerId,
                    status: orderStatus,
                    subtotal,
                    discount,
                    shipping,
                    total,
                    couponCode: appliedCode,
                    notes: input.notes ?? null,
                    shippingAddressId: shippingAddress.id,
                    billingAddressId,
                    items: { createMany: { data: lineItems } },
                    payment: {
                        create: {
                            method: paymentMethod,
                            status: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
                            amount: total,
                        },
                    },
                },
                include: {
                    items: true,
                    payment: true,
                    shippingAddress: true,
                    billingAddress: true,
                },
            });

            if (appliedCouponId) {
                await tx.coupon.update({
                    where: { id: appliedCouponId },
                    data: { usedCount: { increment: 1 } },
                });
            }

            return created;
        });

        return order;
    },

    /**
     * Customer-facing: list their own orders.
     */
    async listForCustomer(customerId: string) {
        return prisma.order.findMany({
            where: { customerId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: { take: 1 }, // just the first item for preview thumbnail
                payment: true,
            },
        });
    },

    /**
     * Admin: list all orders, with filters.
     */
    async listAll(params?: {
        status?: OrderStatus;
        search?: string;
        take?: number;
        skip?: number;
    }) {
        const { status, search, take = 50, skip = 0 } = params ?? {};
        const where: Prisma.OrderWhereInput = {
            ...(status ? { status } : {}),
            ...(search
                ? {
                    OR: [
                        { orderNumber: { contains: search, mode: 'insensitive' } },
                        {
                            customer: {
                                OR: [
                                    { name: { contains: search, mode: 'insensitive' } },
                                    { email: { contains: search, mode: 'insensitive' } },
                                ],
                            },
                        },
                    ],
                }
                : {}),
        };

        const [items, total] = await Promise.all([
            prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take,
                skip,
                include: {
                    customer: { select: { id: true, name: true, email: true } },
                    payment: true,
                    _count: { select: { items: true } },
                },
            }),
            prisma.order.count({ where }),
        ]);

        return { items, total };
    },

    async getById(id: string, opts?: { customerId?: string }) {
        const where: Prisma.OrderWhereInput = {
            id,
            ...(opts?.customerId ? { customerId: opts.customerId } : {}),
        };
        return prisma.order.findFirst({
            where,
            include: {
                customer: {
                    select: { id: true, name: true, email: true, phone: true },
                },
                items: true,
                payment: true,
                shippingAddress: true,
                billingAddress: true,
                tailoring: true,
            },
        });
    },

    async updateStatus(id: string, nextStatus: OrderStatus) {
        const order = await prisma.order.findUnique({
            where: { id },
            select: { status: true },
        });
        if (!order) throw new Error('Order not found');

        if (order.status === nextStatus) return order;
        if (!canTransition(order.status, nextStatus)) {
            throw new Error(
                `Illegal transition: ${order.status} → ${nextStatus}`
            );
        }

        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const updated = await tx.order.update({
                where: { id },
                data: { status: nextStatus },
            });

            // Spin up a tailoring job when entering production
            if (nextStatus === 'IN_PRODUCTION') {
                const existing = await tx.tailoringJob.findUnique({
                    where: { orderId: id },
                });
                if (!existing) {
                    await tx.tailoringJob.create({
                        data: { orderId: id, status: 'PENDING' },
                    });
                }
            }

            // Mark payment paid for COD when shipping
            if (nextStatus === 'DELIVERED') {
                await tx.payment.updateMany({
                    where: { orderId: id, status: 'PENDING' },
                    data: { status: 'PAID', paidAt: new Date() },
                });
            }

            // Refund payment on return
            if (nextStatus === 'RETURNED') {
                await tx.payment.updateMany({
                    where: { orderId: id, status: 'PAID' },
                    data: { status: 'REFUNDED' },
                });
            }

            return updated;
        });
    },
};

function mapAddress(addr: ShippingAddressInput, userId: string) {
    return {
        userId,
        fullName: addr.fullName,
        phone: addr.phone,
        line1: addr.line1,
        line2: addr.line2 ?? null,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
    };
}

// Re-export for convenience
export type { OrderItemInput };
