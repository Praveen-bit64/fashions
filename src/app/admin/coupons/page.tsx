import Link from 'next/link';
import type { Coupon } from '@prisma/client';
import { couponsService } from '@/services/coupons.service';
import PageHeader from '@/components/admin/PageHeader';
import CouponRowActions from './CouponRowActions';

export const dynamic = 'force-dynamic';

const formatINR = (paise: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(paise);

const formatDate = (d: Date | null) =>
    d
        ? d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
        : null;

type Visible =
    | { state: 'live'; label: 'Live' }
    | { state: 'inactive'; label: 'Inactive' }
    | { state: 'upcoming'; label: 'Upcoming' }
    | { state: 'expired'; label: 'Expired' }
    | { state: 'used-up'; label: 'Used Up' };

function deriveStatus(c: Coupon, now: Date = new Date()): Visible {
    if (!c.active) return { state: 'inactive', label: 'Inactive' };
    if (c.validFrom && now < c.validFrom)
        return { state: 'upcoming', label: 'Upcoming' };
    if (c.validUntil && now > c.validUntil)
        return { state: 'expired', label: 'Expired' };
    if (c.usageLimit !== null && c.usedCount >= c.usageLimit)
        return { state: 'used-up', label: 'Used Up' };
    return { state: 'live', label: 'Live' };
}

const TINT: Record<Visible['state'], string> = {
    live: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    inactive: 'bg-gray-100 border-gray-200 text-gray-600',
    upcoming: 'bg-blue-50 border-blue-200 text-blue-700',
    expired: 'bg-gray-100 border-gray-200 text-gray-500',
    'used-up': 'bg-amber-50 border-amber-200 text-amber-800',
};

export default async function AdminCouponsPage() {
    const { items, total } = await couponsService.listAll({ take: 200 });

    const liveCount = items.filter(
        (c) => deriveStatus(c).state === 'live'
    ).length;
    const totalUses = items.reduce((sum, c) => sum + c.usedCount, 0);
    const upcomingCount = items.filter(
        (c) => deriveStatus(c).state === 'upcoming'
    ).length;

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Coupons' },
                ]}
                eyebrow="Engagement"
                title="Coupons"
                description="Create discount codes for campaigns, set spend thresholds, expirations, and usage caps."
                actions={
                    <Link
                        href="/admin/coupons/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-inter font-semibold tracking-[0.3em] uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        New Coupon
                    </Link>
                }
            />

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Stat label="Total Coupons" value={total.toLocaleString('en-IN')} />
                <Stat label="Live Right Now" value={liveCount.toLocaleString('en-IN')} />
                <Stat label="Upcoming" value={upcomingCount.toLocaleString('en-IN')} />
                <Stat label="Total Redemptions" value={totalUses.toLocaleString('en-IN')} />
            </div>

            {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-16 text-center bg-white">
                    <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-3">
                        No promotions running
                    </p>
                    <h2 className="font-delius-swash-caps text-3xl text-gray-900 mb-3">
                        Launch your first coupon
                    </h2>
                    <p className="text-sm font-inter text-gray-600 max-w-md mx-auto mb-6">
                        Create a discount code customers can apply at checkout — flat or
                        percent off, with optional minimum cart value and expiration.
                    </p>
                    <Link
                        href="/admin/coupons/new"
                        className="inline-flex items-center gap-2 px-6 py-3 text-[11px] font-inter font-semibold tracking-[0.3em] uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors"
                    >
                        Create Coupon →
                    </Link>
                </div>
            ) : (
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {[
                                    'Code',
                                    'Discount',
                                    'Min. Subtotal',
                                    'Window',
                                    'Usage',
                                    'Status',
                                    '',
                                ].map((label) => (
                                    <th
                                        key={label}
                                        className="px-5 py-3 text-left text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-500"
                                    >
                                        {label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((c) => {
                                const status = deriveStatus(c);
                                const from = formatDate(c.validFrom);
                                const until = formatDate(c.validUntil);
                                const usagePct =
                                    c.usageLimit !== null && c.usageLimit > 0
                                        ? Math.min(
                                            100,
                                            Math.round((c.usedCount / c.usageLimit) * 100)
                                        )
                                        : null;
                                return (
                                    <tr
                                        key={c.id}
                                        className="hover:bg-gray-50/60 transition-colors"
                                    >
                                        <td className="px-5 py-4">
                                            <Link
                                                href={`/admin/coupons/${c.id}`}
                                                className="inline-flex items-center gap-2 text-sm font-inter font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
                                            >
                                                <span className="font-mono tracking-wider bg-gray-50 border border-gray-200 px-2 py-1 rounded text-xs">
                                                    {c.code}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-inter font-semibold text-gray-900 whitespace-nowrap">
                                            {c.type === 'PERCENT'
                                                ? `${c.value}% off`
                                                : `${formatINR(c.value)} off`}
                                        </td>
                                        <td className="px-5 py-4 text-sm font-inter text-gray-700 whitespace-nowrap">
                                            {c.minSubtotal > 0 ? formatINR(c.minSubtotal) : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-[11px] font-inter text-gray-600 whitespace-nowrap">
                                            {!from && !until ? (
                                                <span className="text-gray-400">No expiry</span>
                                            ) : (
                                                <>
                                                    {from ?? 'Now'} → {until ?? 'No end'}
                                                </>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-[11px] font-inter text-gray-700">
                                            {c.usageLimit === null ? (
                                                <span>
                                                    {c.usedCount}{' '}
                                                    <span className="text-gray-400">used</span>
                                                </span>
                                            ) : (
                                                <div className="w-28">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span>
                                                            {c.usedCount}/{c.usageLimit}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            {usagePct}%
                                                        </span>
                                                    </div>
                                                    <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gray-900"
                                                            style={{ width: `${usagePct ?? 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center text-[10px] font-inter font-semibold tracking-widest uppercase border px-2 py-0.5 rounded ${TINT[status.state]}`}
                                            >
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <CouponRowActions
                                                id={c.id}
                                                code={c.code}
                                                active={c.active}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
            <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-500 mb-2">
                {label}
            </p>
            <p className="font-delius-swash-caps text-3xl text-gray-900">{value}</p>
        </div>
    );
}
