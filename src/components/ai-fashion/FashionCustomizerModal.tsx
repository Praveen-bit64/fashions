'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CustomizerProvider,
    useCustomizer,
    type CustomizerProduct,
} from './context/CustomizerContext';
import DressPreview from './DressPreview';
import CustomizationPanel from './CustomizationPanel';
import AiTryOnUpload from './AiTryOnUpload';
import OrderSummary from './OrderSummary';
import TrendingDesigns from './TrendingDesigns';

type Props = {
    open: boolean;
    onClose: () => void;
    product: CustomizerProduct;
};

const FashionCustomizerModal = ({ open, onClose, product }: Props) => {
    // Lock background scroll
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    // ESC key
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (typeof window === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <CustomizerProvider product={product}>
                    <ModalShell onClose={onClose} />
                </CustomizerProvider>
            )}
        </AnimatePresence>,
        document.body
    );
};

const ModalShell = ({ onClose }: { onClose: () => void }) => {
    const { resetAll } = useCustomizer();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-stretch"
            role="dialog"
            aria-modal="true"
            aria-label="Customize with AI"
        >
            {/* Backdrop */}
            <button
                onClick={onClose}
                aria-label="Close customizer"
                className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
            />

            {/* Panel */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative ml-auto w-full h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col"
            >
                {/* Header */}
                <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                            <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 2l2 5 5 1-3.5 3.5L17 17l-5-3-5 3 1.5-5.5L5 8l5-1 2-5z"
                                />
                            </svg>
                        </div>
                        <div className="leading-tight">
                            <p className="text-[10px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600">
                                AI Atelier
                            </p>
                            <h2 className="font-delius-swash-caps text-xl sm:text-2xl text-gray-900">
                                Customize with AI
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={resetAll}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-inter font-semibold tracking-widest uppercase text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
                            </svg>
                            Reset
                        </button>
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-900 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                            {/* Trending */}
                            <aside className="lg:col-span-3 order-3 lg:order-1">
                                <div className="lg:sticky lg:top-6">
                                    <TrendingDesigns />
                                </div>
                            </aside>

                            {/* Preview + Try-On */}
                            <section className="lg:col-span-5 order-1 lg:order-2 space-y-6">
                                <DressPreview />
                                <AiTryOnUpload />
                            </section>

                            {/* Customization + Summary */}
                            <section className="lg:col-span-4 order-2 lg:order-3 space-y-6">
                                <CustomizationPanel />
                                <OrderSummary onAdded={onClose} />
                            </section>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FashionCustomizerModal;
