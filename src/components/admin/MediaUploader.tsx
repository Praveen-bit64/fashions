'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

export type MediaItem = {
    url: string;
    publicId?: string | null;
    alt?: string | null;
};

const MediaUploader = ({
    media,
    onChange,
}: {
    media: MediaItem[];
    onChange: (next: MediaItem[]) => void;
}) => {
    const input = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFiles = async (files: FileList) => {
        if (!files.length) return;
        setUploading(true);
        try {
            const next = [...media];
            for (const file of Array.from(files)) {
                const fd = new FormData();
                fd.append('file', file);
                const res = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: fd,
                });
                const data = await res.json();
                if (!res.ok || !data.ok) {
                    throw new Error(data?.error?.message ?? 'Upload failed');
                }
                next.push({
                    url: data.data.url,
                    publicId: data.data.publicId,
                });
            }
            onChange(next);
            toast.success(`Uploaded ${files.length} image${files.length > 1 ? 's' : ''}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
            if (input.current) input.current.value = '';
        }
    };

    const remove = (i: number) => {
        const next = [...media];
        next.splice(i, 1);
        onChange(next);
    };

    const move = (i: number, dir: -1 | 1) => {
        const j = i + dir;
        if (j < 0 || j >= media.length) return;
        const next = [...media];
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next);
    };

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {media.map((m, i) => (
                    <div
                        key={`${m.url}-${i}`}
                        className="relative aspect-[4/5] rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={m.url}
                            alt={m.alt ?? `Image ${i + 1}`}
                            className="w-full h-full object-cover"
                        />

                        {i === 0 && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-gray-900 text-white text-[9px] font-inter font-semibold tracking-widest uppercase rounded-sm">
                                Primary
                            </span>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => move(i, -1)}
                                    disabled={i === 0}
                                    aria-label="Move left"
                                    className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-gray-900 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => move(i, 1)}
                                    disabled={i === media.length - 1}
                                    aria-label="Move right"
                                    className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-gray-900 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => remove(i)}
                                aria-label="Remove"
                                className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-red-600 hover:bg-white transition-colors"
                            >
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
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}

                {/* Upload tile */}
                <button
                    type="button"
                    onClick={() => input.current?.click()}
                    disabled={uploading}
                    className={`relative aspect-[4/5] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${uploading
                        ? 'border-gray-200 bg-gray-50 cursor-wait'
                        : 'border-gray-200 hover:border-gray-900 bg-gray-50/60 hover:bg-white'
                        }`}
                >
                    {uploading ? (
                        <span className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                                <svg
                                    className="w-4 h-4 text-gray-700"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 5v14M5 12h14"
                                    />
                                </svg>
                            </div>
                            <p className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-900">
                                Add Image
                            </p>
                        </>
                    )}
                </button>
            </div>

            <input
                ref={input}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />

            <p className="text-[11px] font-inter text-gray-500 mt-3">
                Up to 12 MB per image · JPEG/PNG/WEBP · First image is the primary
                product image
            </p>
        </div>
    );
};

export default MediaUploader;
