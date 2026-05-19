'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    help?: string;
    aspect?: 'square' | 'video' | '4/5' | '16/9' | '3/4';
};

const ASPECT_CLASS: Record<NonNullable<Props['aspect']>, string> = {
    square: 'aspect-square',
    video: 'aspect-video',
    '4/5': 'aspect-[4/5]',
    '16/9': 'aspect-[16/9]',
    '3/4': 'aspect-[3/4]',
};

const ImageUploader = ({
    value,
    onChange,
    label,
    help,
    aspect = '16/9',
}: Props) => {
    const input = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file: File) => {
        setUploading(true);
        try {
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
            onChange(data.data.url);
            toast.success('Image uploaded');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
            if (input.current) input.current.value = '';
        }
    };

    return (
        <div>
            {label && (
                <p className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-600 mb-1.5">
                    {label}
                </p>
            )}

            <div
                className={`relative w-full ${ASPECT_CLASS[aspect]} rounded-lg overflow-hidden border ${value ? 'border-gray-200' : 'border-dashed border-gray-300'
                    } bg-gray-50 group`}
            >
                {value ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={value}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                        {/* Action overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3 gap-2">
                            <button
                                type="button"
                                onClick={() => input.current?.click()}
                                disabled={uploading}
                                className="px-3 py-1.5 text-[10px] font-inter font-semibold tracking-widest uppercase bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                {uploading ? 'Uploading…' : 'Change'}
                            </button>
                            <button
                                type="button"
                                onClick={() => onChange('')}
                                disabled={uploading}
                                className="px-3 py-1.5 text-[10px] font-inter font-semibold tracking-widest uppercase bg-white text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                Remove
                            </button>
                        </div>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => input.current?.click()}
                        disabled={uploading}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 hover:bg-gray-100/40 transition-colors"
                    >
                        {uploading ? (
                            <span className="w-7 h-7 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                        ) : (
                            <>
                                <div className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-gray-700"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 16l4-4a3 3 0 014 0l5 5M14 14l1-1a3 3 0 014 0l3 3M5 6h14M12 3v6"
                                        />
                                    </svg>
                                </div>
                                <p className="text-[11px] font-inter font-semibold tracking-widest uppercase text-gray-700">
                                    Upload Image
                                </p>
                                <p className="text-[10px] font-inter text-gray-500">
                                    JPEG / PNG / WEBP, up to 12 MB
                                </p>
                            </>
                        )}
                    </button>
                )}
            </div>

            {help && (
                <p className="text-[10px] font-inter text-gray-400 mt-1.5">{help}</p>
            )}

            <input
                ref={input}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFile(file);
                }}
            />
        </div>
    );
};

export default ImageUploader;
