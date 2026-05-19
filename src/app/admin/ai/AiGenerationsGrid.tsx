'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export type GenerationItem = {
    id: string;
    provider: string;
    generatedUrl: string | null;
    bodyImageUrl: string | null;
    faceImageUrl: string | null;
    config: unknown;
    convertedToOrderId: string | null;
    createdAt: string;
    product: { id: string; slug: string; title: string; image: string | null } | null;
};

const PROVIDER_LABEL: Record<string, string> = {
    openai: 'OpenAI',
    gemini: 'Gemini',
    pollinations: 'Pollinations',
};

const PROVIDER_TINT: Record<string, string> = {
    openai: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    gemini: 'bg-blue-50 border-blue-200 text-blue-700',
    pollinations: 'bg-purple-50 border-purple-200 text-purple-700',
};

const formatRelative = (iso: string): string => {
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms / (1000 * 60));
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
    });
};

const AiGenerationsGrid = ({
    generations,
    allProviders,
    activeProviderFilter,
}: {
    generations: GenerationItem[];
    allProviders: string[];
    activeProviderFilter: string | null;
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [selected, setSelected] = useState<GenerationItem | null>(null);

    const filterByProvider = (next: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (next) params.set('provider', next);
        else params.delete('provider');
        const qs = params.toString();
        router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    };

    return (
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <header className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900 mr-auto">
                    Recent Generations
                </h2>
                {/* Provider filter chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                    <Chip
                        active={activeProviderFilter === null}
                        onClick={() => filterByProvider(null)}
                    >
                        All
                    </Chip>
                    {allProviders.map((p) => (
                        <Chip
                            key={p}
                            active={activeProviderFilter === p}
                            onClick={() => filterByProvider(p)}
                        >
                            {PROVIDER_LABEL[p] ?? p}
                        </Chip>
                    ))}
                </div>
            </header>

            {generations.length === 0 ? (
                <div className="px-6 py-16 text-center">
                    <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-3">
                        Nothing here yet
                    </p>
                    <h3 className="font-delius-swash-caps text-3xl text-gray-900 mb-3">
                        No AI generations
                    </h3>
                    <p className="text-sm font-inter text-gray-600 max-w-md mx-auto">
                        Once customers customize a product with the AI tool, their
                        generations appear here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-5">
                    {generations.map((g) => (
                        <button
                            key={g.id}
                            onClick={() => setSelected(g)}
                            className="group relative aspect-[4/5] rounded-lg overflow-hidden bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors"
                        >
                            {g.generatedUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={g.generatedUrl}
                                    alt="AI generation"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-inter text-gray-400">
                                    No image
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />

                            <div className="absolute top-2 left-2 flex gap-1.5">
                                <span
                                    className={`inline-flex items-center text-[9px] font-inter font-semibold tracking-widest uppercase border px-1.5 py-0.5 rounded ${PROVIDER_TINT[g.provider] ?? 'bg-gray-100 border-gray-200 text-gray-600'}`}
                                >
                                    {PROVIDER_LABEL[g.provider] ?? g.provider}
                                </span>
                            </div>

                            {g.convertedToOrderId && (
                                <div className="absolute top-2 right-2">
                                    <span className="inline-flex items-center gap-1 text-[9px] font-inter font-semibold tracking-widest uppercase text-white bg-emerald-600 px-1.5 py-0.5 rounded">
                                        <span className="w-1 h-1 rounded-full bg-white" />
                                        Ordered
                                    </span>
                                </div>
                            )}

                            <div className="absolute bottom-2 left-2 right-2 text-white text-left">
                                <p className="text-[10px] font-inter font-semibold truncate drop-shadow">
                                    {g.product?.title ?? '(unknown product)'}
                                </p>
                                <p className="text-[9px] font-inter text-white/80">
                                    {formatRelative(g.createdAt)}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-5xl w-full max-h-[90vh] grid grid-cols-1 lg:grid-cols-5"
                        >
                            {/* Generated image */}
                            <div className="lg:col-span-3 bg-gray-50 flex items-center justify-center min-h-[300px]">
                                {selected.generatedUrl ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={selected.generatedUrl}
                                        alt="AI generation"
                                        className="max-w-full max-h-[80vh] object-contain"
                                    />
                                ) : (
                                    <p className="text-sm font-inter text-gray-400">
                                        No image
                                    </p>
                                )}
                            </div>

                            {/* Meta */}
                            <div className="lg:col-span-2 p-6 overflow-y-auto max-h-[90vh] flex flex-col gap-5">
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`inline-flex items-center text-[10px] font-inter font-semibold tracking-widest uppercase border px-2 py-0.5 rounded ${PROVIDER_TINT[selected.provider] ?? 'bg-gray-100 border-gray-200 text-gray-600'}`}
                                    >
                                        {PROVIDER_LABEL[selected.provider] ?? selected.provider}
                                    </span>
                                    <button
                                        onClick={() => setSelected(null)}
                                        aria-label="Close"
                                        className="w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 flex items-center justify-center transition-colors"
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
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                {/* Product link */}
                                {selected.product ? (
                                    <Link
                                        href={`/product/${selected.product.slug}`}
                                        target="_blank"
                                        className="flex items-center gap-3 p-3 -m-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="w-12 h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                            {selected.product.image && (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={selected.product.image}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-inter font-semibold tracking-widest uppercase text-gray-500 mb-0.5">
                                                Based on
                                            </p>
                                            <p className="text-sm font-inter font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                                                {selected.product.title}
                                            </p>
                                        </div>
                                    </Link>
                                ) : (
                                    <p className="text-sm font-inter text-gray-400 italic">
                                        Original product no longer available
                                    </p>
                                )}

                                <ConfigBreakdown config={selected.config} />

                                {/* Reference images */}
                                {(selected.bodyImageUrl || selected.faceImageUrl) && (
                                    <div>
                                        <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-500 mb-2">
                                            Customer References
                                        </p>
                                        <div className="flex gap-2">
                                            {selected.bodyImageUrl && (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={selected.bodyImageUrl}
                                                    alt="Body reference"
                                                    className="w-20 h-24 rounded-md object-cover border border-gray-200"
                                                />
                                            )}
                                            {selected.faceImageUrl && (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={selected.faceImageUrl}
                                                    alt="Face reference"
                                                    className="w-20 h-24 rounded-md object-cover border border-gray-200"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto pt-4 border-t border-gray-100 space-y-2 text-[11px] font-inter">
                                    <Row
                                        label="Generated"
                                        value={new Date(selected.createdAt).toLocaleString('en-IN')}
                                    />
                                    {selected.convertedToOrderId && (
                                        <Row
                                            label="Order"
                                            value={
                                                <Link
                                                    href={`/admin/orders/${selected.convertedToOrderId}`}
                                                    className="text-emerald-600 hover:underline"
                                                >
                                                    View order →
                                                </Link>
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

function Chip({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={`px-2.5 py-1 text-[10px] font-inter font-semibold tracking-widest uppercase rounded transition-colors ${active
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
        >
            {children}
        </button>
    );
}

function ConfigBreakdown({ config }: { config: unknown }) {
    if (!config || typeof config !== 'object') return null;
    const entries = Object.entries(config as Record<string, unknown>).filter(
        ([, v]) => v !== null && v !== undefined && v !== ''
    );
    if (entries.length === 0) return null;

    return (
        <div>
            <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-500 mb-2">
                Customization
            </p>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {entries.map(([k, v]) => (
                    <div key={k}>
                        <dt className="text-[10px] font-inter text-gray-400 capitalize">
                            {k.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </dt>
                        <dd className="text-[12px] font-inter font-medium text-gray-900 truncate">
                            {String(v)}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function Row({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="text-gray-900 font-medium">{value}</span>
        </div>
    );
}

export default AiGenerationsGrid;
