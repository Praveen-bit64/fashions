'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

const CouponRowActions = ({
    id,
    code,
    active,
}: {
    id: string;
    code: string;
    active: boolean;
}) => {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    const toggle = async () => {
        setBusy(true);
        try {
            const res = await fetch(`/api/v1/coupons/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !active }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Update failed');
            }
            toast.success(active ? 'Coupon deactivated' : 'Coupon activated');
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        if (!confirm(`Delete coupon ${code}? This cannot be undone.`)) return;
        setBusy(true);
        try {
            const res = await fetch(`/api/v1/coupons/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Delete failed');
            }
            toast.success('Coupon deleted');
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Delete failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-1">
            <Link
                href={`/admin/coupons/${id}`}
                className="px-2 py-1 text-[10px] font-inter font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-900 rounded transition-colors"
            >
                Edit
            </Link>
            <button
                onClick={toggle}
                disabled={busy}
                className="px-2 py-1 text-[10px] font-inter font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-900 rounded transition-colors disabled:opacity-50"
            >
                {active ? 'Deactivate' : 'Activate'}
            </button>
            <button
                onClick={remove}
                disabled={busy}
                className="px-2 py-1 text-[10px] font-inter font-semibold tracking-widest uppercase text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            >
                Delete
            </button>
        </div>
    );
};

export default CouponRowActions;
