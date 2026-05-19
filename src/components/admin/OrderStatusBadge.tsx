import type { OrderStatus, PaymentStatus } from '@prisma/client';
import { ORDER_STATUS_LABEL } from '@/features/orders/state-machine';

const ORDER_COLORS: Record<OrderStatus, string> = {
    PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
    CONFIRMED: 'bg-blue-50 text-blue-800 border-blue-200',
    IN_PRODUCTION: 'bg-purple-50 text-purple-800 border-purple-200',
    READY_TO_SHIP: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    SHIPPED: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    DELIVERED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-red-50 text-red-800 border-red-200',
    RETURNED: 'bg-orange-50 text-orange-800 border-orange-200',
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
    PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
    AUTHORIZED: 'bg-blue-50 text-blue-800 border-blue-200',
    PAID: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    FAILED: 'bg-red-50 text-red-800 border-red-200',
    REFUNDED: 'bg-orange-50 text-orange-800 border-orange-200',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    return (
        <span
            className={`inline-block px-2.5 py-1 text-[10px] font-inter font-semibold tracking-widest uppercase rounded-sm border ${ORDER_COLORS[status]}`}
        >
            {ORDER_STATUS_LABEL[status]}
        </span>
    );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
    return (
        <span
            className={`inline-block px-2.5 py-1 text-[10px] font-inter font-semibold tracking-widest uppercase rounded-sm border ${PAYMENT_COLORS[status]}`}
        >
            {status}
        </span>
    );
}
