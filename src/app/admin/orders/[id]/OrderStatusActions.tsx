'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import type { OrderStatus } from '@prisma/client';
import {
    ORDER_TRANSITIONS,
    ORDER_STATUS_LABEL,
} from '@/features/orders/state-machine';

const OrderStatusActions = ({
    orderId,
    currentStatus,
}: {
    orderId: string;
    currentStatus: OrderStatus;
}) => {
    const router = useRouter();
    const [submitting, setSubmitting] = useState<OrderStatus | null>(null);

    const next = ORDER_TRANSITIONS[currentStatus];

    const transition = async (target: OrderStatus) => {
        setSubmitting(target);
        try {
            const res = await fetch(`/api/v1/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: target }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Update failed');
            }
            toast.success(`Status → ${ORDER_STATUS_LABEL[target]}`);
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setSubmitting(null);
        }
    };

    if (next.length === 0) {
        return (
            <p className="text-xs font-inter text-gray-500 italic">
                Terminal status — no further transitions available.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            <Toaster />
            {next.map((target) => {
                const isCancel = target === 'CANCELLED' || target === 'RETURNED';
                const loading = submitting === target;
                return (
                    <button
                        key={target}
                        onClick={() => transition(target)}
                        disabled={Boolean(submitting)}
                        className={`w-full inline-flex items-center justify-between gap-2 px-4 py-3 text-[11px] font-inter font-semibold tracking-widest uppercase rounded-md transition-colors ${isCancel
                            ? 'border border-red-200 text-red-600 hover:bg-red-50'
                            : 'bg-gray-900 text-white hover:bg-emerald-600'
                            } disabled:opacity-50`}
                    >
                        <span>
                            {loading
                                ? 'Updating…'
                                : isCancel
                                    ? `Mark ${ORDER_STATUS_LABEL[target]}`
                                    : `Move to ${ORDER_STATUS_LABEL[target]}`}
                        </span>
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
};

export default OrderStatusActions;
