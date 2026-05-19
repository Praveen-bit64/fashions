'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCustomizer } from './context/CustomizerContext';

const DressPreview = () => {
    const {
        product,
        zoom,
        rotation,
        zoomIn,
        zoomOut,
        rotateLeft,
        rotateRight,
        resetTransform,
        selectedColorHex,
        material,
        pattern,
        generatedImage,
        aiStatus,
    } = useCustomizer();

    const imageSrc = generatedImage ?? product.image;
    const showAiBadge = generatedImage !== null;

    return (
        <div className="flex flex-col gap-4">
            {/* Preview Frame */}
            <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 border border-gray-100 shadow-sm">
                {/* AI badge */}
                {showAiBadge && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-inter font-semibold tracking-[0.25em] uppercase rounded-full"
                    >
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        AI Preview
                    </motion.div>
                )}

                {/* Loading overlay */}
                <AnimatePresence>
                    {aiStatus === 'generating' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 bg-white/85 backdrop-blur-md flex flex-col items-center justify-center gap-4"
                        >
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-2 border-gray-200 rounded-full" />
                                <div className="absolute inset-0 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                                    Generating
                                </p>
                                <p className="text-xs font-inter text-gray-500 mt-1">
                                    Crafting your unique look…
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Color wash overlay */}
                <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-30 transition-colors duration-500"
                    style={{ backgroundColor: selectedColorHex }}
                />

                {/* Pattern stripe (subtle hint) */}
                {pattern === 'striped' && (
                    <div
                        aria-hidden
                        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
                        style={{
                            backgroundImage:
                                'repeating-linear-gradient(90deg, rgba(0,0,0,0.2) 0 6px, transparent 6px 18px)',
                        }}
                    />
                )}
                {pattern === 'polka' && (
                    <div
                        aria-hidden
                        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40"
                        style={{
                            backgroundImage:
                                'radial-gradient(rgba(0,0,0,0.25) 1.5px, transparent 2px)',
                            backgroundSize: '18px 18px',
                        }}
                    />
                )}

                {/* Product image */}
                <motion.img
                    key={imageSrc}
                    src={imageSrc}
                    alt={product.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35 }}
                    style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out"
                />

                {/* Material caption */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="px-3 py-1.5 bg-white/85 backdrop-blur-md rounded-full text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-900">
                        {material}
                    </div>
                    {(zoom !== 1 || rotation !== 0) && (
                        <button
                            onClick={resetTransform}
                            className="px-3 py-1.5 bg-white/85 backdrop-blur-md rounded-full text-[10px] font-inter font-semibold tracking-wider uppercase text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Reset View
                        </button>
                    )}
                </div>
            </div>

            {/* Transform controls */}
            <div className="flex items-center justify-center gap-2">
                <PreviewButton onClick={zoomOut} label="Zoom out">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="7" />
                        <path strokeLinecap="round" d="M8 11h6M21 21l-4.35-4.35" />
                    </svg>
                </PreviewButton>
                <PreviewButton onClick={zoomIn} label="Zoom in">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="7" />
                        <path strokeLinecap="round" d="M8 11h6M11 8v6M21 21l-4.35-4.35" />
                    </svg>
                </PreviewButton>
                <div className="w-px h-5 bg-gray-200 mx-1" />
                <PreviewButton onClick={rotateLeft} label="Rotate left">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
                    </svg>
                </PreviewButton>
                <PreviewButton onClick={rotateRight} label="Rotate right">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />
                    </svg>
                </PreviewButton>
                <div className="w-px h-5 bg-gray-200 mx-1" />
                <span className="text-[10px] font-inter font-semibold tracking-wider uppercase text-gray-500 min-w-[36px] text-center">
                    {Math.round(zoom * 100)}%
                </span>
            </div>
        </div>
    );
};

function PreviewButton({
    onClick,
    label,
    children,
}: {
    onClick: () => void;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            title={label}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-900 transition-colors"
        >
            {children}
        </button>
    );
}

export default DressPreview;
