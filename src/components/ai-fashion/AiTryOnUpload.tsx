'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomizer, type UploadStatus } from './context/CustomizerContext';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic';
const MAX_BYTES = 8 * 1024 * 1024;

const AiTryOnUpload = () => {
    const {
        faceImagePreview,
        bodyImagePreview,
        faceUploadStatus,
        bodyUploadStatus,
        uploadFace,
        uploadBody,
        clearFace,
        clearBody,
        aiStatus,
        aiError,
        generatedImage,
        generateAiPreview,
        clearAiPreview,
        usage,
    } = useCustomizer();

    const faceInput = useRef<HTMLInputElement>(null);
    const bodyInput = useRef<HTMLInputElement>(null);

    const handlePick = (
        e: React.ChangeEvent<HTMLInputElement>,
        upload: (file: File) => Promise<void>
    ) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (file.size > MAX_BYTES) {
            alert('Image must be under 8 MB');
            return;
        }
        void upload(file);
    };

    const isGenerating = aiStatus === 'generating';
    const anyUploading =
        faceUploadStatus === 'uploading' || bodyUploadStatus === 'uploading';
    const canGenerate =
        !isGenerating &&
        !anyUploading &&
        (faceUploadStatus === 'done' || bodyUploadStatus === 'done');

    const quotaExhausted = usage?.remaining === 0;

    return (
        <div className="space-y-4 p-5 rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-white to-emerald-50/30">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-1.5">
                        AI Try-On
                    </p>
                    <h3 className="font-delius-swash-caps text-xl text-gray-900 leading-tight">
                        See It On You
                    </h3>
                    <p className="text-xs font-inter text-gray-500 mt-1.5 leading-relaxed">
                        Upload your photos and our AI will visualise this design on you.
                    </p>
                </div>
                {usage && (
                    <div className="text-right">
                        <p className="text-[10px] font-inter font-semibold tracking-widest uppercase text-gray-400">
                            Remaining
                        </p>
                        <p className="text-sm font-inter font-semibold text-gray-900">
                            {usage.remaining}
                            <span className="text-gray-400">/{usage.limit}</span>
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <UploadCard
                    label="Face photo"
                    helper="Clear, well-lit selfie"
                    image={faceImagePreview}
                    status={faceUploadStatus}
                    onClear={clearFace}
                    onUploadClick={() => faceInput.current?.click()}
                />
                <UploadCard
                    label="Body photo"
                    helper="Full-length, neutral pose"
                    image={bodyImagePreview}
                    status={bodyUploadStatus}
                    onClear={clearBody}
                    onUploadClick={() => bodyInput.current?.click()}
                />
            </div>

            <input
                ref={faceInput}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => handlePick(e, uploadFace)}
            />
            <input
                ref={bodyInput}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => handlePick(e, uploadBody)}
            />

            <AnimatePresence>
                {aiError && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="px-3 py-2 rounded-md bg-red-50 border border-red-100"
                    >
                        <p className="text-xs font-inter text-red-700">{aiError}</p>
                    </motion.div>
                )}
                {quotaExhausted && !aiError && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="px-3 py-2 rounded-md bg-amber-50 border border-amber-100"
                    >
                        <p className="text-xs font-inter text-amber-800">
                            {usage?.kind === 'anon'
                                ? 'Free preview limit reached. Sign in to continue.'
                                : 'Daily preview limit reached. Resets in 24 hours.'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-2">
                <button
                    onClick={generateAiPreview}
                    disabled={!canGenerate || quotaExhausted}
                    className={`flex-1 inline-flex items-center justify-center gap-2 py-3 text-[11px] font-inter font-semibold tracking-[0.2em] uppercase rounded-md transition-colors duration-200 ${canGenerate && !quotaExhausted
                        ? 'bg-gray-900 text-white hover:bg-emerald-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating
                        </>
                    ) : anyUploading ? (
                        <>
                            <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                            Uploading
                        </>
                    ) : (
                        <>
                            <svg
                                className="w-3.5 h-3.5"
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
                            Generate AI Preview
                        </>
                    )}
                </button>
                {generatedImage && (
                    <button
                        onClick={clearAiPreview}
                        className="px-4 py-3 text-[11px] font-inter font-semibold tracking-[0.2em] uppercase border border-gray-200 rounded-md text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            <p className="text-[10px] font-inter text-gray-400 leading-relaxed">
                By uploading you consent to AI processing of your photos. Uploads are
                auto-deleted after 24 hours.
            </p>
        </div>
    );
};

function UploadCard({
    label,
    helper,
    image,
    status,
    onClear,
    onUploadClick,
}: {
    label: string;
    helper: string;
    image: string | null;
    status: UploadStatus;
    onClear: () => void;
    onUploadClick: () => void;
}) {
    const uploading = status === 'uploading';
    const failed = status === 'error';

    return (
        <div className="relative">
            {image ? (
                <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                    <img src={image} alt={label} className="w-full h-full object-cover" />
                    {uploading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                        </div>
                    )}
                    {failed && (
                        <div className="absolute inset-0 bg-red-500/15 flex items-center justify-center">
                            <span className="text-[10px] font-inter font-semibold tracking-wider uppercase text-red-700 bg-white px-2 py-1 rounded">
                                Retry
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                        onClick={onClear}
                        aria-label="Remove image"
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                        <svg
                            className="w-3.5 h-3.5 text-gray-900"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded text-[9px] font-inter font-semibold tracking-wider uppercase text-gray-900">
                        {label}
                    </span>
                </div>
            ) : (
                <button
                    onClick={onUploadClick}
                    className="relative aspect-square w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-900 bg-gray-50/60 hover:bg-white transition-colors flex flex-col items-center justify-center gap-2 p-3"
                >
                    <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                        <svg
                            className="w-4 h-4 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                        </svg>
                    </div>
                    <p className="text-[10px] font-inter font-semibold tracking-[0.2em] uppercase text-gray-900">
                        {label}
                    </p>
                    <p className="text-[10px] font-inter text-gray-500 text-center leading-tight">
                        {helper}
                    </p>
                </button>
            )}
        </div>
    );
}

export default AiTryOnUpload;
