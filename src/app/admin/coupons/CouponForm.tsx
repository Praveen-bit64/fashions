'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import type { CouponType } from '@prisma/client';

export type CouponFormInitial = {
    id?: string;
    code: string;
    type: CouponType;
    value: number;
    minSubtotal: number;
    validFrom: string | null; // YYYY-MM-DD
    validUntil: string | null;
    usageLimit: number | null;
    active: boolean;
};

export const EMPTY_COUPON: CouponFormInitial = {
    code: '',
    type: 'PERCENT',
    value: 10,
    minSubtotal: 0,
    validFrom: null,
    validUntil: null,
    usageLimit: null,
    active: true,
};

const formatINR = (paise: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(paise);

const CouponForm = ({
    initial,
    mode,
}: {
    initial: CouponFormInitial;
    mode: 'create' | 'edit';
}) => {
    const router = useRouter();
    const [form, setForm] = useState(initial);
    const [submitting, setSubmitting] = useState(false);

    const set = <K extends keyof CouponFormInitial>(
        key: K,
        value: CouponFormInitial[K]
    ) => setForm((p) => ({ ...p, [key]: value }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...(mode === 'create' ? { code: form.code.trim().toUpperCase() } : {}),
            type: form.type,
            value: form.value,
            minSubtotal: form.minSubtotal,
            validFrom: form.validFrom ? new Date(form.validFrom) : null,
            validUntil: form.validUntil ? new Date(form.validUntil) : null,
            usageLimit: form.usageLimit,
            active: form.active,
        };

        if (mode === 'create' && !payload.code) {
            toast.error('Code is required');
            return;
        }
        if (form.type === 'PERCENT' && form.value > 100) {
            toast.error('Percent discount cannot exceed 100');
            return;
        }
        if (
            form.validFrom &&
            form.validUntil &&
            new Date(form.validUntil) < new Date(form.validFrom)
        ) {
            toast.error('End date must be after start date');
            return;
        }

        setSubmitting(true);
        try {
            const url =
                mode === 'create' ? '/api/v1/coupons' : `/api/v1/coupons/${initial.id}`;
            const method = mode === 'create' ? 'POST' : 'PATCH';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Save failed');
            }
            toast.success(mode === 'create' ? 'Coupon created' : 'Coupon updated');
            router.push('/admin/coupons');
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Save failed');
        } finally {
            setSubmitting(false);
        }
    };

    const livePreview =
        form.type === 'PERCENT'
            ? `${form.value || 0}% off`
            : `${formatINR(form.value || 0)} off`;

    return (
        <form onSubmit={submit} className="pb-24">
            <Toaster />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Code & type */}
                    <Card title="Code & Discount">
                        <Field label="Code" required>
                            <input
                                value={form.code}
                                onChange={(e) =>
                                    set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))
                                }
                                disabled={mode === 'edit'}
                                placeholder="e.g. WELCOME10"
                                maxLength={40}
                                className="w-full px-4 py-2.5 text-sm font-inter font-semibold tracking-wider uppercase rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                            />
                            {mode === 'edit' && (
                                <p className="text-[11px] font-inter text-gray-400 mt-1.5">
                                    Code can&apos;t change after creation. Delete and recreate to
                                    change it.
                                </p>
                            )}
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Discount Type" required>
                                <div className="flex rounded-md border border-gray-200 overflow-hidden">
                                    {(['PERCENT', 'FLAT'] as const).map((t) => {
                                        const active = form.type === t;
                                        return (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => set('type', t)}
                                                className={`flex-1 py-2.5 text-[11px] font-inter font-semibold tracking-widest uppercase transition-colors ${active
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {t === 'PERCENT' ? '% Off' : '₹ Off'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>

                            <Field
                                label={form.type === 'PERCENT' ? 'Percent Value' : 'Amount (₹)'}
                                required
                            >
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={1}
                                        max={form.type === 'PERCENT' ? 100 : undefined}
                                        value={form.value || ''}
                                        onChange={(e) => set('value', Number(e.target.value))}
                                        className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors pr-9"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-inter text-gray-500">
                                        {form.type === 'PERCENT' ? '%' : '₹'}
                                    </span>
                                </div>
                            </Field>
                        </div>
                    </Card>

                    {/* Rules */}
                    <Card title="Rules">
                        <Field
                            label="Minimum Subtotal (₹)"
                            help="Order subtotal must be at least this much before the coupon applies. Leave 0 for no minimum."
                        >
                            <input
                                type="number"
                                min={0}
                                value={form.minSubtotal || ''}
                                onChange={(e) =>
                                    set('minSubtotal', Number(e.target.value) || 0)
                                }
                                placeholder="0"
                                className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                            />
                        </Field>

                        <Field
                            label="Usage Limit"
                            help="Maximum total redemptions across all customers. Leave blank for unlimited."
                        >
                            <input
                                type="number"
                                min={1}
                                value={form.usageLimit ?? ''}
                                onChange={(e) =>
                                    set(
                                        'usageLimit',
                                        e.target.value ? Number(e.target.value) : null
                                    )
                                }
                                placeholder="Unlimited"
                                className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Valid From" help="Leave blank for immediately">
                                <input
                                    type="date"
                                    value={form.validFrom ?? ''}
                                    onChange={(e) =>
                                        set('validFrom', e.target.value || null)
                                    }
                                    className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                                />
                            </Field>
                            <Field label="Valid Until" help="Leave blank for no expiration">
                                <input
                                    type="date"
                                    value={form.validUntil ?? ''}
                                    onChange={(e) =>
                                        set('validUntil', e.target.value || null)
                                    }
                                    className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                                />
                            </Field>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6 lg:sticky lg:top-[100px] lg:self-start">
                    {/* Status */}
                    <Card title="Status">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span>
                                <span className="block text-sm font-inter font-semibold text-gray-900">
                                    Active
                                </span>
                                <span className="block text-[11px] font-inter text-gray-500">
                                    Inactive coupons reject all redemption attempts.
                                </span>
                            </span>
                            <span
                                className={`relative inline-block w-10 h-6 rounded-full transition-colors ${form.active ? 'bg-emerald-500' : 'bg-gray-300'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={form.active}
                                    onChange={(e) => set('active', e.target.checked)}
                                    className="sr-only"
                                />
                                <span
                                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-[18px]' : 'translate-x-0.5'
                                        }`}
                                />
                            </span>
                        </label>
                    </Card>

                    {/* Live preview */}
                    <Card title="Customer Sees">
                        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
                            <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-emerald-600 mb-2">
                                Promo Applied
                            </p>
                            <p className="font-mono text-lg font-semibold tracking-wider text-gray-900 mb-1">
                                {form.code || 'YOUR-CODE'}
                            </p>
                            <p className="text-sm font-inter text-gray-700">{livePreview}</p>
                            {form.minSubtotal > 0 && (
                                <p className="text-[11px] font-inter text-gray-500 mt-2">
                                    on orders over {formatINR(form.minSubtotal)}
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Sticky bottom bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-30">
                <div className="px-6 lg:px-8 py-4 flex items-center justify-end gap-3">
                    <Link
                        href="/admin/coupons"
                        className="px-5 py-2.5 text-[11px] font-inter font-semibold tracking-widest uppercase text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 text-[11px] font-inter font-semibold tracking-widest uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                        {submitting
                            ? 'Saving…'
                            : mode === 'create'
                                ? 'Create Coupon'
                                : 'Save Changes'}
                    </button>
                </div>
            </div>
        </form>
    );
};

function Card({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <header className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                    {title}
                </h2>
            </header>
            <div className="p-6 space-y-5">{children}</div>
        </section>
    );
}

function Field({
    label,
    required,
    help,
    children,
}: {
    label: string;
    required?: boolean;
    help?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {help && (
                <p className="text-[11px] font-inter text-gray-400 mt-1.5">{help}</p>
            )}
        </div>
    );
}

export default CouponForm;
