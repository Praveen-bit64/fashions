'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import type { ReviewStatus } from '@prisma/client';

export type ApprovedReview = {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    createdAt: string;
    user: { id: string; name: string };
};

export type UserReview = {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    status: ReviewStatus;
    createdAt: string;
};

type Props = {
    productId: string;
    productTitle: string;
    rating: number;
    reviewCount: number;
    approvedReviews: ApprovedReview[];
    /** Logged-in user state, computed server-side. */
    viewer:
    | { state: 'guest' }
    | { state: 'cannot-review' } // logged in, hasn't purchased
    | { state: 'already-reviewed'; review: UserReview }
    | { state: 'can-review' };
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

const initials = (name: string) =>
    name
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

const StatusBadge = ({ status }: { status: ReviewStatus }) => {
    const tone =
        status === 'APPROVED'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : status === 'HIDDEN'
                ? 'bg-gray-100 border-gray-200 text-gray-600'
                : 'bg-amber-50 border-amber-200 text-amber-800';
    const label =
        status === 'APPROVED'
            ? 'Published'
            : status === 'HIDDEN'
                ? 'Hidden by moderator'
                : 'Awaiting moderation';
    return (
        <span
            className={`inline-flex items-center text-[10px] font-inter font-semibold tracking-widest uppercase border px-2 py-0.5 rounded ${tone}`}
        >
            {label}
        </span>
    );
};

const Stars = ({
    rating,
    size = 'sm',
}: {
    rating: number;
    size?: 'sm' | 'lg';
}) => {
    const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <svg
                    key={n}
                    viewBox="0 0 24 24"
                    className={`${cls} ${n <= rating ? 'fill-amber-400' : 'fill-gray-200'}`}
                >
                    <path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.8 5.7 21.1 7 14.2 2 9.3l7-1L12 2z" />
                </svg>
            ))}
        </div>
    );
};

const StarPicker = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (n: number) => void;
}) => {
    const [hover, setHover] = useState<number | null>(null);
    const display = hover ?? value;
    return (
        <div
            className="flex items-center gap-1"
            onMouseLeave={() => setHover(null)}
        >
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onClick={() => onChange(n)}
                    className="p-0.5"
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                >
                    <svg
                        viewBox="0 0 24 24"
                        className={`w-7 h-7 transition-colors ${n <= display ? 'fill-amber-400' : 'fill-gray-200'
                            }`}
                    >
                        <path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.8 5.7 21.1 7 14.2 2 9.3l7-1L12 2z" />
                    </svg>
                </button>
            ))}
        </div>
    );
};

const ProductReviews = ({
    productId,
    productTitle,
    rating,
    reviewCount,
    approvedReviews,
    viewer,
}: Props) => {
    const router = useRouter();
    const [openForm, setOpenForm] = useState(false);
    const [stars, setStars] = useState(0);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (stars === 0) {
            toast.error('Please pick a star rating');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/v1/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    rating: stars,
                    title: title.trim() || null,
                    body: body.trim() || null,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Submit failed');
            }
            toast.success(
                'Thanks! Your review is awaiting moderation and will appear once approved.'
            );
            setStars(0);
            setTitle('');
            setBody('');
            setOpenForm(false);
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Submit failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section
            id="reviews"
            className="bg-white border-t border-gray-100 py-16 lg:py-20 scroll-mt-24"
        >
            <div className="max-w-5xl mx-auto px-4">
                <div className="text-center mb-10">
                    <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-3">
                        Customer Voice
                    </p>
                    <h2 className="font-delius-swash-caps text-3xl md:text-4xl text-gray-900 mb-3">
                        Reviews
                    </h2>
                    <div className="flex items-center justify-center gap-3 mb-5">
                        <span className="h-px w-10 bg-gray-300" />
                        <span className="text-[11px] font-inter font-medium tracking-[0.25em] uppercase text-gray-500">
                            From real shoppers
                        </span>
                        <span className="h-px w-10 bg-gray-300" />
                    </div>

                    {reviewCount > 0 ? (
                        <div className="inline-flex items-center gap-3">
                            <Stars rating={Math.round(rating)} size="lg" />
                            <span className="text-2xl font-inter font-semibold text-gray-900">
                                {rating.toFixed(1)}
                            </span>
                            <span className="text-sm font-inter text-gray-500">
                                ({reviewCount.toLocaleString('en-IN')} review
                                {reviewCount === 1 ? '' : 's'})
                            </span>
                        </div>
                    ) : (
                        <p className="text-sm font-inter text-gray-500">
                            No reviews yet — be the first to share your thoughts.
                        </p>
                    )}
                </div>

                {/* Viewer panel */}
                <div className="mb-10">
                    {viewer.state === 'guest' && (
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 text-center">
                            <p className="text-sm font-inter text-gray-700 mb-3">
                                Sign in to share your experience.
                            </p>
                            <a
                                href="/?signin=1"
                                className="inline-flex items-center px-5 py-2.5 text-[11px] font-inter font-semibold tracking-widest uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors"
                            >
                                Sign In
                            </a>
                        </div>
                    )}

                    {viewer.state === 'cannot-review' && (
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 text-center">
                            <p className="text-sm font-inter text-gray-700">
                                Reviews are open to shoppers who&apos;ve ordered this piece.
                                Once your order is placed, you&apos;ll be able to leave one
                                here.
                            </p>
                        </div>
                    )}

                    {viewer.state === 'already-reviewed' && (
                        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-500 mb-1.5">
                                        Your Review
                                    </p>
                                    <Stars rating={viewer.review.rating} />
                                </div>
                                <StatusBadge status={viewer.review.status} />
                            </div>
                            {viewer.review.title && (
                                <p className="text-sm font-inter font-semibold text-gray-900 mb-1">
                                    {viewer.review.title}
                                </p>
                            )}
                            {viewer.review.body && (
                                <p className="text-sm font-inter text-gray-700 leading-relaxed whitespace-pre-line">
                                    {viewer.review.body}
                                </p>
                            )}
                            <p className="text-[11px] font-inter text-gray-400 mt-3">
                                Submitted {formatDate(viewer.review.createdAt)}
                            </p>
                        </div>
                    )}

                    {viewer.state === 'can-review' && (
                        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                            {!openForm ? (
                                <button
                                    onClick={() => setOpenForm(true)}
                                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50/60 transition-colors group"
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                            <svg
                                                className="w-5 h-5 text-emerald-600"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={1.8}
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                        </span>
                                        <span className="text-left">
                                            <span className="block text-sm font-inter font-semibold text-gray-900">
                                                Write a review
                                            </span>
                                            <span className="block text-[11px] font-inter text-gray-500">
                                                Share how this piece worked for you
                                            </span>
                                        </span>
                                    </span>
                                    <span className="text-[10px] font-inter font-semibold tracking-widest uppercase text-gray-500 group-hover:text-gray-900">
                                        Start →
                                    </span>
                                </button>
                            ) : (
                                <AnimatePresence>
                                    <motion.form
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        onSubmit={submit}
                                        className="p-6 space-y-5"
                                    >
                                        <div>
                                            <label className="block text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-700 mb-2">
                                                Your Rating *
                                            </label>
                                            <StarPicker value={stars} onChange={setStars} />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="review-title"
                                                className="block text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-700 mb-2"
                                            >
                                                Headline
                                            </label>
                                            <input
                                                id="review-title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder={`e.g. Perfect fit for ${productTitle.slice(0, 30)}`}
                                                maxLength={120}
                                                className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="review-body"
                                                className="block text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-700 mb-2"
                                            >
                                                Your Review
                                            </label>
                                            <textarea
                                                id="review-body"
                                                value={body}
                                                onChange={(e) => setBody(e.target.value)}
                                                rows={5}
                                                maxLength={2000}
                                                placeholder="What did you love? How is the fit, fabric, and finish?"
                                                className="w-full px-4 py-3 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors resize-none"
                                            />
                                            <p className="text-[10px] font-inter text-gray-400 text-right mt-1">
                                                {body.length}/2000
                                            </p>
                                        </div>

                                        <p className="text-[11px] font-inter text-gray-500 bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
                                            Reviews go to our moderation queue first. They&apos;ll
                                            appear here once approved.
                                        </p>

                                        <div className="flex items-center gap-3 pt-2">
                                            <button
                                                type="submit"
                                                disabled={submitting || stars === 0}
                                                className="px-6 py-3 text-[11px] font-inter font-semibold tracking-widest uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? 'Submitting…' : 'Submit Review'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setOpenForm(false)}
                                                disabled={submitting}
                                                className="px-4 py-3 text-[11px] font-inter font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.form>
                                </AnimatePresence>
                            )}
                        </div>
                    )}
                </div>

                {/* Approved reviews list */}
                {approvedReviews.length > 0 && (
                    <ul className="space-y-5">
                        {approvedReviews.map((r) => (
                            <li
                                key={r.id}
                                className="rounded-2xl border border-gray-100 bg-white p-5 lg:p-6 shadow-sm"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] font-inter font-semibold tracking-wider flex-shrink-0">
                                        {initials(r.user.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                                            <p className="text-sm font-inter font-semibold text-gray-900">
                                                {r.user.name}
                                            </p>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-inter font-semibold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Verified Buyer
                                            </span>
                                            <span className="text-[11px] font-inter text-gray-400">
                                                · {formatDate(r.createdAt)}
                                            </span>
                                        </div>
                                        <Stars rating={r.rating} />
                                        {r.title && (
                                            <p className="text-sm font-inter font-semibold text-gray-900 mt-3 mb-1">
                                                {r.title}
                                            </p>
                                        )}
                                        {r.body && (
                                            <p className="text-sm font-inter text-gray-700 leading-relaxed whitespace-pre-line">
                                                {r.body}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};

export default ProductReviews;
