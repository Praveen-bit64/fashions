'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import MediaUploader, { type MediaItem } from './MediaUploader';
import VariantEditor, { type VariantInput } from './VariantEditor';

export type ProductFormCategory = { id: string; name: string };

export type ProductFormInitial = {
    id?: string;
    slug: string;
    title: string;
    brand: string;
    description: string;
    categoryId: string;
    basePrice: number;
    discountPrice: number | null;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    isCustomizable: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
    media: MediaItem[];
    variants: VariantInput[];
};

const DEFAULTS: ProductFormInitial = {
    slug: '',
    title: '',
    brand: '',
    description: '',
    categoryId: '',
    basePrice: 0,
    discountPrice: null,
    status: 'DRAFT',
    isCustomizable: true,
    isNewArrival: false,
    isBestSeller: false,
    media: [],
    variants: [],
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

const ProductForm = ({
    mode,
    initial,
    categories,
}: {
    mode: 'create' | 'edit';
    initial?: ProductFormInitial;
    categories: ProductFormCategory[];
}) => {
    const router = useRouter();
    const [values, setValues] = useState<ProductFormInitial>(
        initial ?? DEFAULTS
    );
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(
        mode === 'edit'
    );

    const set = <K extends keyof ProductFormInitial>(
        k: K,
        v: ProductFormInitial[K]
    ) => setValues((p) => ({ ...p, [k]: v }));

    const handleTitleChange = (v: string) => {
        set('title', v);
        if (!slugManuallyEdited) set('slug', slugify(v));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!values.title.trim() || !values.slug.trim()) {
            toast.error('Title and slug are required');
            return;
        }
        if (!values.brand.trim()) {
            toast.error('Brand is required');
            return;
        }
        if (!values.categoryId) {
            toast.error('Choose a category');
            return;
        }
        if (values.basePrice <= 0) {
            toast.error('Base price must be greater than 0');
            return;
        }

        setSubmitting(true);
        try {
            const url =
                mode === 'create'
                    ? '/api/v1/products'
                    : `/api/v1/products/${initial?.id}`;
            const method = mode === 'create' ? 'POST' : 'PATCH';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: values.slug,
                    title: values.title,
                    brand: values.brand,
                    description: values.description || null,
                    categoryId: values.categoryId,
                    basePrice: values.basePrice,
                    discountPrice: values.discountPrice,
                    status: values.status,
                    isCustomizable: values.isCustomizable,
                    isNewArrival: values.isNewArrival,
                    isBestSeller: values.isBestSeller,
                    media: values.media,
                    variants: values.variants,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Save failed');
            }

            toast.success(
                mode === 'create' ? 'Product created' : 'Product updated'
            );
            router.push('/admin/products');
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Save failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!initial?.id) return;
        if (
            !confirm(
                'Archive this product? It will be hidden from the storefront immediately.'
            )
        )
            return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/v1/products/${initial.id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Delete failed');
            }
            toast.success('Product archived');
            router.push('/admin/products');
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Delete failed');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Toaster />
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card title="Basics">
                            <Field
                                label="Title"
                                value={values.title}
                                onChange={handleTitleChange}
                                placeholder="Essential Western Denim Shirt"
                            />
                            <Field
                                label="Slug"
                                value={values.slug}
                                onChange={(v) => {
                                    set('slug', v);
                                    setSlugManuallyEdited(true);
                                }}
                                placeholder="essential-western-denim-shirt"
                                help="URL-safe identifier. Lowercase letters, numbers, dashes only."
                            />
                            <Field
                                label="Brand"
                                value={values.brand}
                                onChange={(v) => set('brand', v)}
                                placeholder="DENIM CO"
                            />
                            <div>
                                <span className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-600 mb-1.5 block">
                                    Description
                                </span>
                                <textarea
                                    value={values.description}
                                    onChange={(e) => set('description', e.target.value)}
                                    rows={5}
                                    placeholder="Product details, fabric care, fit notes…"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm font-inter text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 transition-colors resize-y"
                                />
                            </div>
                        </Card>

                        <Card title="Images">
                            <MediaUploader
                                media={values.media}
                                onChange={(next) => set('media', next)}
                            />
                        </Card>

                        <Card title="Variants">
                            <VariantEditor
                                productSlug={values.slug}
                                variants={values.variants}
                                onChange={(next) => set('variants', next)}
                            />
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card title="Status">
                            <div>
                                <span className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-600 mb-1.5 block">
                                    Visibility
                                </span>
                                <select
                                    value={values.status}
                                    onChange={(e) =>
                                        set(
                                            'status',
                                            e.target
                                                .value as ProductFormInitial['status']
                                        )
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm font-inter text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                                >
                                    <option value="DRAFT">Draft (hidden)</option>
                                    <option value="PUBLISHED">Published (live)</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                            </div>

                            <Toggle
                                label="Customizable with AI"
                                checked={values.isCustomizable}
                                onChange={(v) => set('isCustomizable', v)}
                            />
                            <Toggle
                                label="Mark as New Arrival"
                                checked={values.isNewArrival}
                                onChange={(v) => set('isNewArrival', v)}
                            />
                            <Toggle
                                label="Mark as Bestseller"
                                checked={values.isBestSeller}
                                onChange={(v) => set('isBestSeller', v)}
                            />
                        </Card>

                        <Card title="Pricing">
                            <Field
                                label="Base price (₹)"
                                type="number"
                                value={String(values.basePrice || '')}
                                onChange={(v) => set('basePrice', Number(v) || 0)}
                                help="Customer-facing price in INR. Decimals not supported (whole rupees)."
                            />
                            <Field
                                label="Discounted price (₹, optional)"
                                type="number"
                                value={
                                    values.discountPrice === null
                                        ? ''
                                        : String(values.discountPrice)
                                }
                                onChange={(v) =>
                                    set('discountPrice', v === '' ? null : Number(v) || null)
                                }
                                help="Leave empty if no discount."
                            />
                        </Card>

                        <Card title="Category">
                            <select
                                value={values.categoryId}
                                onChange={(e) => set('categoryId', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm font-inter text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                            >
                                <option value="">Select a category…</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {categories.length === 0 && (
                                <p className="text-[11px] font-inter text-amber-700 bg-amber-50 border border-amber-100 rounded p-2 mt-2">
                                    No categories yet.{' '}
                                    <a
                                        href="/admin/categories"
                                        className="font-semibold underline"
                                    >
                                        Create one first
                                    </a>
                                    .
                                </p>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Sticky action bar */}
                <div className="sticky bottom-0 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 bg-white/95 backdrop-blur-md border-t border-gray-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.push('/admin/products')}
                            className="px-5 py-2.5 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase border border-gray-200 rounded-md text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                        {mode === 'edit' && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-5 py-2.5 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                {deleting ? 'Archiving…' : 'Archive'}
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`inline-flex items-center gap-2 px-7 py-2.5 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase rounded-md transition-colors ${submitting
                            ? 'bg-gray-100 text-gray-400 cursor-wait'
                            : 'bg-gray-900 text-white hover:bg-emerald-600'
                            }`}
                    >
                        {submitting ? (
                            <>
                                <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                Saving
                            </>
                        ) : mode === 'create' ? (
                            'Create Product'
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </form>
        </>
    );
};

/* ─── Sub-components ──────────────────────────────────────────── */

function Card({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <header className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                    {title}
                </h2>
            </header>
            <div className="p-6 space-y-4">{children}</div>
        </section>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    help,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    help?: string;
}) {
    return (
        <label className="block">
            <span className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-600 mb-1.5 block">
                {label}
            </span>
            <input
                type={type}
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

function Toggle({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-sm font-inter text-gray-900">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                role="switch"
                aria-checked={checked}
                className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
        </label>
    );
}

export default ProductForm;
