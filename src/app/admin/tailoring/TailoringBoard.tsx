'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import type { TailoringStatus } from '@prisma/client';
import {
    TAILORING_PIPELINE,
    TAILORING_STATUS_LABEL,
    TAILORING_TRANSITIONS,
} from '@/features/tailoring/state-machine';

export type JobView = {
    id: string;
    status: TailoringStatus;
    orderId: string;
    orderNumber: string;
    orderTotal: number;
    orderPlacedAt: string;
    customerName: string;
    customerEmail: string;
    itemTitle: string;
    itemImage: string | null;
    itemQuantity: number;
    assignedToName: string | null;
    updatedAt: string;
};

const COLUMN_TINT: Record<TailoringStatus, string> = {
    PENDING: 'bg-amber-50/60 border-amber-200',
    MEASUREMENT_RECEIVED: 'bg-blue-50/60 border-blue-200',
    CUTTING: 'bg-fuchsia-50/60 border-fuchsia-200',
    STITCHING: 'bg-purple-50/60 border-purple-200',
    FINISHING: 'bg-indigo-50/60 border-indigo-200',
    QC: 'bg-cyan-50/60 border-cyan-200',
    DISPATCHED: 'bg-emerald-50/60 border-emerald-200',
};

const formatINR = (paise: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(paise);

const daysSince = (iso: string): number => {
    const ms = Date.now() - new Date(iso).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
};

const TailoringBoard = ({ initial }: { initial: JobView[] }) => {
    const router = useRouter();
    const [jobs, setJobs] = useState(initial);
    const [submitting, setSubmitting] = useState<string | null>(null);

    const grouped = useMemo(() => {
        const map: Record<TailoringStatus, JobView[]> = {
            PENDING: [],
            MEASUREMENT_RECEIVED: [],
            CUTTING: [],
            STITCHING: [],
            FINISHING: [],
            QC: [],
            DISPATCHED: [],
        };
        for (const job of jobs) map[job.status].push(job);
        return map;
    }, [jobs]);

    const transition = async (
        jobId: string,
        nextStatus: TailoringStatus
    ) => {
        setSubmitting(`${jobId}-${nextStatus}`);
        try {
            const res = await fetch(`/api/v1/tailoring/${jobId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Update failed');
            }
            // Optimistic local update
            setJobs((prev) =>
                prev.map((j) =>
                    j.id === jobId
                        ? {
                            ...j,
                            status: nextStatus,
                            updatedAt: new Date().toISOString(),
                        }
                        : j
                )
            );
            toast.success(`→ ${TAILORING_STATUS_LABEL[nextStatus]}`);
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setSubmitting(null);
        }
    };

    if (jobs.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-gray-200 p-16 text-center bg-white">
                <Toaster />
                <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-3">
                    Empty pipeline
                </p>
                <h2 className="font-delius-swash-caps text-3xl text-gray-900 mb-3">
                    No tailoring jobs yet
                </h2>
                <p className="text-sm font-inter text-gray-600 max-w-md mx-auto mb-6">
                    Jobs appear here automatically when an order is moved to{' '}
                    <span className="font-semibold">In Production</span> from the
                    Orders page.
                </p>
                <Link
                    href="/admin/orders"
                    className="inline-flex items-center gap-2 px-6 py-3 text-[11px] font-inter font-semibold tracking-[0.3em] uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors"
                >
                    Go to Orders →
                </Link>
            </div>
        );
    }

    return (
        <>
            <Toaster />
            <div className="overflow-x-auto -mx-6 lg:-mx-8 px-6 lg:px-8 pb-4">
                <div className="flex gap-4 min-w-fit">
                    {TAILORING_PIPELINE.map((status) => {
                        const items = grouped[status];
                        return (
                            <div
                                key={status}
                                className={`flex-shrink-0 w-[280px] rounded-2xl border ${COLUMN_TINT[status]}`}
                            >
                                <header className="px-4 py-3 border-b border-current/10 flex items-center justify-between">
                                    <h3 className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-900">
                                        {TAILORING_STATUS_LABEL[status]}
                                    </h3>
                                    <span className="text-xs font-inter font-semibold text-gray-700 bg-white/80 px-2 py-0.5 rounded-full">
                                        {items.length}
                                    </span>
                                </header>

                                <ul className="p-3 space-y-3 min-h-[100px]">
                                    {items.length === 0 ? (
                                        <li className="text-[11px] font-inter text-gray-400 text-center py-6 italic">
                                            Empty
                                        </li>
                                    ) : (
                                        items.map((job) => (
                                            <JobCard
                                                key={job.id}
                                                job={job}
                                                onTransition={transition}
                                                submitting={submitting}
                                            />
                                        ))
                                    )}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

/* ─── Card ──────────────────────────────────────────────────── */

function JobCard({
    job,
    onTransition,
    submitting,
}: {
    job: JobView;
    onTransition: (id: string, next: TailoringStatus) => void;
    submitting: string | null;
}) {
    const ageInStatus = daysSince(job.updatedAt);
    const ageColor =
        ageInStatus >= 3
            ? 'text-red-600 bg-red-50 border-red-200'
            : ageInStatus >= 1
                ? 'text-amber-700 bg-amber-50 border-amber-200'
                : 'text-gray-500 bg-gray-50 border-gray-200';

    const nextOptions = TAILORING_TRANSITIONS[job.status];

    return (
        <li className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-3">
                <div className="flex items-start gap-3">
                    <div className="relative w-12 h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        {job.itemImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={job.itemImage}
                                alt={job.itemTitle}
                                className="w-full h-full object-cover"
                            />
                        ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                        <Link
                            href={`/admin/orders/${job.orderId}`}
                            className="text-[11px] font-inter font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
                        >
                            #{job.orderNumber}
                        </Link>
                        <p className="text-xs font-inter text-gray-700 truncate mt-0.5">
                            {job.itemTitle}
                        </p>
                        <p className="text-[10px] font-inter text-gray-500 truncate">
                            {job.customerName}
                        </p>
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] font-inter">
                    <span
                        className={`px-1.5 py-0.5 border rounded ${ageColor}`}
                        title="Days in current status"
                    >
                        {ageInStatus === 0
                            ? 'today'
                            : `${ageInStatus}d in status`}
                    </span>
                    <span className="text-gray-500">
                        {formatINR(job.orderTotal)} · {job.itemQuantity} pc
                    </span>
                </div>

                {job.assignedToName && (
                    <p className="mt-2 text-[10px] font-inter text-gray-500">
                        Tailor:{' '}
                        <span className="text-gray-900 font-semibold">
                            {job.assignedToName}
                        </span>
                    </p>
                )}
            </div>

            {/* Actions */}
            {nextOptions.length > 0 && (
                <div className="border-t border-gray-100 p-2 flex flex-wrap gap-1.5">
                    {nextOptions.map((target) => {
                        const isBack = target === 'STITCHING' && job.status === 'QC';
                        const key = `${job.id}-${target}`;
                        const loading = submitting === key;
                        return (
                            <button
                                key={target}
                                onClick={() => onTransition(job.id, target)}
                                disabled={Boolean(submitting)}
                                className={`flex-1 text-[10px] font-inter font-semibold tracking-wider uppercase py-1.5 px-2 rounded transition-colors ${isBack
                                    ? 'border border-amber-200 text-amber-800 hover:bg-amber-50'
                                    : 'bg-gray-900 text-white hover:bg-emerald-600'
                                    } disabled:opacity-50`}
                            >
                                {loading
                                    ? '…'
                                    : isBack
                                        ? '← Re-work'
                                        : TAILORING_STATUS_LABEL[target]}
                            </button>
                        );
                    })}
                </div>
            )}
        </li>
    );
}

export default TailoringBoard;
