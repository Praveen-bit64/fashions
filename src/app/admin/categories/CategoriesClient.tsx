'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

type Category = {
    id: string;
    slug: string;
    name: string;
    productCount: number;
};

function slugify(s: string): string {
    return s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const CategoriesClient = ({ initial }: { initial: Category[] }) => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    const handleNameChange = (v: string) => {
        setName(v);
        if (!slugManuallyEdited) setSlug(slugify(v));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !slug.trim()) {
            toast.error('Name and slug are required');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/v1/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Create failed');
            }
            toast.success(`Category "${name}" created`);
            setName('');
            setSlug('');
            setSlugManuallyEdited(false);
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Create failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Toaster />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create form */}
                <div className="lg:col-span-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm h-fit">
                    <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900 mb-5">
                        Add Category
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field
                            label="Name"
                            value={name}
                            onChange={handleNameChange}
                            placeholder="Dresses"
                        />
                        <Field
                            label="Slug"
                            value={slug}
                            onChange={(v) => {
                                setSlug(v);
                                setSlugManuallyEdited(true);
                            }}
                            placeholder="dresses"
                            help="Used in URLs. Lowercase, dashes only."
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full py-3 text-[11px] font-inter font-semibold tracking-[0.3em] uppercase rounded-md transition-colors ${submitting
                                ? 'bg-gray-100 text-gray-400 cursor-wait'
                                : 'bg-gray-900 text-white hover:bg-emerald-600'
                                }`}
                        >
                            {submitting ? 'Creating…' : 'Create Category'}
                        </button>
                    </form>
                </div>

                {/* Existing list */}
                <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                            Existing Categories
                        </h2>
                        <span className="text-xs font-inter text-gray-500">
                            {initial.length} total
                        </span>
                    </div>
                    {initial.length === 0 ? (
                        <div className="px-6 py-10 text-center text-sm font-inter text-gray-500">
                            No categories yet. Create your first one on the left.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {initial.map((c) => (
                                <li
                                    key={c.id}
                                    className="flex items-center justify-between px-6 py-4"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-inter font-semibold text-gray-900">
                                            {c.name}
                                        </p>
                                        <p className="text-[11px] font-inter text-gray-500">
                                            /{c.slug}
                                        </p>
                                    </div>
                                    <span className="text-xs font-inter text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                                        {c.productCount} products
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
};

function Field({
    label,
    value,
    onChange,
    placeholder,
    help,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    help?: string;
}) {
    return (
        <label className="block">
            <span className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-600 mb-1.5 block">
                {label}
            </span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm font-inter text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
            />
            {help && (
                <span className="text-[10px] font-inter text-gray-400 mt-1 block">
                    {help}
                </span>
            )}
        </label>
    );
}

export default CategoriesClient;
