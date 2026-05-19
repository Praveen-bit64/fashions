'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import type { OrderStatus } from '@prisma/client';

const CustomerOrderActions = ({
    orderId,
    status,
}: {
    orderId: string;
    status: OrderStatus;
}) => {
    const router = useRouter();
    const [confirming, setConfirming] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const canCancel = status === 'PENDING' || status === 'CONFIRMED';

    const handleCancel = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/v1/orders/${orderId}/cancel`, {
                method: 'POST',
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Cancel failed');
            }
            toast.success('Order cancelled');
            setConfirming(false);
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Cancel failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (!canCancel) return null;

    return (
        <>
            <Toaster />
            <div className="space-y-2">
                {!confirming ? (
                    <button
                        onClick={() => setConfirming(true)}
                        className="w-full py-3 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase border border-gray-200 text-gray-900 rounded-md hover:border-red-400 hover:text-red-600 transition-colors"
                    >
                        Cancel Order
                    </button>
                ) : (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 space-y-3">
                        <p className="text-xs font-inter text-red-900 leading-relaxed">
                            Cancel this order? This can't be undone, but you can place a new
                            order anytime.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setConfirming(false)}
                                disabled={submitting}
                                className="flex-1 py-2 text-[11px] font-inter font-semibold tracking-widest uppercase border border-gray-200 text-gray-900 rounded-md hover:border-gray-900 transition-colors disabled:opacity-50"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={submitting}
                                className="flex-1 py-2 text-[11px] font-inter font-semibold tracking-widest uppercase bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Cancelling…' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CustomerOrderActions;
