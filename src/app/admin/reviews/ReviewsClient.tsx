'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import type { ReviewStatus } from '@prisma/client';

export type ReviewView = {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    status: ReviewStatus;
    createdAt: string;
    product: {
        id: string;
        slug: string;
        title: string;
        media: { url: string }[];
    };
    user: { id: string; name: string; email: string };
};

const FILTERS: { key: 'PENDING' | 'APPROVED' | 'HIDDEN' | 'ALL'; label: string }[] = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'HIDDEN', label: 'Hidden' },
    { key: 'ALL', label: 'All' },
];

const STATUS_BADGE: Record<ReviewStatus, string> = {
    PENDING: 'bg-amber-50 border-amber-200 text-amber-800',
    APPROVED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    HIDDEN: 'bg-gray-100 border-gray-200 text-gray-600',
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

const Stars = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
            <svg
                key={n}
                viewBox="0 0 24 24"
                className={`w-3.5 h-3.5 ${n <= rating ? 'fill-amber-400' : 'fill-gray-200'}`}
            >
                <path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.8 5.7 21.1 7 14.2 2 9.3l7-1L12 2z" />
            </svg>
        ))}
    </div>
);

const initials = (name: string) =>
    name
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

type Props = {
    initial: ReviewView[];
    countsByStatus: Record<ReviewStatus, number>;
    activeFilter: 'PENDING' | 'APPROVED' | 'HIDDEN' | 'ALL';
};

const ReviewsClient = ({ initial, countsByStatus, activeFilter }: Props) => {
    const router = useRouter();
    const [reviews, setReviews] = useState(initial);
    const [submitting, setSubmitting] = useState<string | null>(null);

    const filterCounts = useMemo(
        () => ({
            PENDING: countsByStatus.PENDING,
            APPROVED: countsByStatus.APPROVED,
            HIDDEN: countsByStatus.HIDDEN,
            ALL:
                countsByStatus.PENDING +
                countsByStatus.APPROVED +
                countsByStatus.HIDDEN,
        }),
        [countsByStatus]
    );

    const transition = async (id: string, nextStatus: ReviewStatus) => {
        setSubmitting(`${id}-${nextStatus}`);
        try {
            const res = await fetch(`/api/v1/reviews/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Update failed');
            }
            setReviews((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
            );
            toast.success(
                nextStatus === 'APPROVED'
                    ? 'Review approved'
                    : nextStatus === 'HIDDEN'
                        ? 'Review hidden'
                        : 'Review moved back to pending'
            );
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setSubmitting(null);
        }
    };

    const remove = async (id: string) => {
        if (
            !confirm(
                'Delete this review permanently? This cannot be undone.'
            )
        ) {
            return;
        }
        setSubmitting(`${id}-DELETE`);
        try {
            const res = await fetch(`/api/v1/reviews/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Delete failed');
            }
            setReviews((prev) => prev.filter((r) => r.id !== id));
            toast.success('Review deleted');
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Delete failed');
        } finally {
            setSubmitting(null);
        }
    };

    return (
        <>
            <Toaster />

            {/* Filter tabs */}
            <div className="border-b border-gray-100 mb-6 -mt-2">
                <div className="flex gap-1">
                    {FILTERS.map((f) => {
                        const active = f.key === activeFilter;
                        const count = filterCounts[f.key];
                        return (
                            <Link
                                key={f.key}
                                href={
                                    f.key === 'PENDING'
                                        ? '/admin/reviews'
                                        : `/admin/reviews?status=${f.key}`
                                }
                                className={`relative px-4 py-3 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase transition-colors ${active
                                    ? 'text-gray-900'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    {f.label}
                                    <span
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${active
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {count}
                                    </span>
                                </span>
                                {active && (
                                    <motion.span
                                        layoutId="reviews-tab-underline"
                                        className="absolute left-0 right-0 -bottom-px h-[2px] bg-gray-900"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-16 text-center bg-white">
                    <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-3">
                        {activeFilter === 'PENDING' ? 'Inbox clear' : 'Nothing here'}
                    </p>
                    <h2 className="font-delius-swash-caps text-3xl text-gray-900 mb-3">
                        {activeFilter === 'PENDING'
                            ? 'No reviews need attention'
                            : 'No reviews in this view'}
                    </h2>
                    <p className="text-sm font-inter text-gray-600 max-w-md mx-auto">
                        {activeFilter === 'PENDING'
                            ? 'New customer reviews land here for moderation before going live.'
                            : 'Try another filter to see more reviews.'}
                    </p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {reviews.map((r) => {
                        const isSubmittingThis = submitting?.startsWith(`${r.id}-`);
                        return (
                            <li
                                key={r.id}
                                className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
                            >
                                <div className="p-5 lg:p-6 flex flex-col lg:flex-row gap-5">
                                    {/* Product thumb + meta */}
                                    <div className="flex items-start gap-3 lg:w-72 flex-shrink-0">
                                        <Link
                                            href={`/product/${r.product.slug}`}
                                            target="_blank"
                                            className="relative w-16 h-20 rounded-md overflow-hidden bg-gray-50 flex-shrink-0"
                                        >
                                            {r.product.media[0]?.url ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={r.product.media[0].url}
                                                    alt={r.product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : null}
                                        </Link>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-inter font-semibold tracking-widest uppercase text-gray-500 mb-1">
                                                Product
                                            </p>
                                            <Link
                                                href={`/product/${r.product.slug}`}
                                                target="_blank"
                                                className="text-sm font-inter font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-2 block"
                                            >
                                                {r.product.title}
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Review body */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-inter font-semibold tracking-wider flex-shrink-0">
                                                    {initials(r.user.name)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-inter font-semibold text-gray-900 truncate">
                                                        {r.user.name}
                                                    </p>
                                                    <p className="text-[11px] font-inter text-gray-500 truncate">
                                                        {r.user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`inline-flex items-center gap-1 text-[10px] font-inter font-semibold tracking-widest uppercase border px-2 py-0.5 rounded flex-shrink-0 ${STATUS_BADGE[r.status]}`}
                                            >
                                                {r.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 mb-2">
                                            <Stars rating={r.rating} />
                                            <span className="text-[11px] font-inter text-gray-500">
                                                {formatDate(r.createdAt)}
                                            </span>
                                        </div>

                                        {r.title && (
                                            <p className="text-sm font-inter font-semibold text-gray-900 mb-1">
                                                {r.title}
                                            </p>
                                        )}
                                        {r.body && (
                                            <p className="text-sm font-inter text-gray-700 leading-relaxed whitespace-pre-line">
                                                {r.body}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
                                            {r.status !== 'APPROVED' && (
                                                <button
                                                    onClick={() => transition(r.id, 'APPROVED')}
                                                    disabled={Boolean(submitting)}
                                                    className="px-3 py-1.5 text-[10px] font-inter font-semibold tracking-widest uppercase bg-gray-900 text-white rounded hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                                >
                                                    {submitting === `${r.id}-APPROVED`
                                                        ? 'Approving…'
                                                        : 'Approve'}
                                                </button>
                                            )}
                                            {r.status !== 'HIDDEN' && (
                                                <button
                                                    onClick={() => transition(r.id, 'HIDDEN')}
                                                    disabled={Boolean(submitting)}
                                                    className="px-3 py-1.5 text-[10px] font-inter font-semibold tracking-widest uppercase border border-gray-200 text-gray-700 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                >
                                                    {submitting === `${r.id}-HIDDEN`
                                                        ? 'Hiding…'
                                                        : 'Hide'}
                                                </button>
                                            )}
                                            {r.status !== 'PENDING' && (
                                                <button
                                                    onClick={() => transition(r.id, 'PENDING')}
                                                    disabled={Boolean(submitting)}
                                                    className="px-3 py-1.5 text-[10px] font-inter font-semibold tracking-widest uppercase border border-gray-200 text-gray-500 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                >
                                                    {submitting === `${r.id}-PENDING`
                                                        ? 'Reverting…'
                                                        : 'Mark Pending'}
                                                </button>
                                            )}
                                            <div className="flex-1" />
                                            <button
                                                onClick={() => remove(r.id)}
                                                disabled={Boolean(submitting)}
                                                className="px-3 py-1.5 text-[10px] font-inter font-semibold tracking-widest uppercase text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                            >
                                                {submitting === `${r.id}-DELETE`
                                                    ? 'Deleting…'
                                                    : 'Delete'}
                                            </button>
                                        </div>
                                        {isSubmittingThis ? null : null}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
};

export default ReviewsClient;
