import type { OrderStatus } from '@prisma/client';

/**
 * Legal forward transitions for an order's lifecycle.
 * Refunds/returns happen after delivery; cancellation is allowed
 * up until the order ships.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['IN_PRODUCTION', 'CANCELLED'],
    IN_PRODUCTION: ['READY_TO_SHIP', 'CANCELLED'],
    READY_TO_SHIP: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'RETURNED'],
    DELIVERED: ['RETURNED'],
    CANCELLED: [],
    RETURNED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return ORDER_TRANSITIONS[from].includes(to);
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    IN_PRODUCTION: 'In Production',
    READY_TO_SHIP: 'Ready to Ship',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    RETURNED: 'Returned',
};
