'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ui/ProductCard';
import Icons from '@/components/ui/Icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addToCart } from '@/redux/slices/cartSlice';
import { toggleWishlist } from '@/redux/slices/wishlistSlice';

type Product = {
    id: string;
    slug: string;
    title: string;
    brand: string;
    originalPrice: number;
    discountedPrice?: number;
    discountPercentage?: number;
    rating: number;
    reviewCount: number;
    image: string;
    images: string[];
    isNewArrival: boolean;
    isBestSeller: boolean;
    isOutOfStock: boolean;
    categoryName: string;
};

type PrismaProductPayload = {
    id: string;
    slug: string;
    title: string;
    brand: string;
    basePrice: number;
    discountPrice: number | null;
    rating: number;
    reviewCount: number;
    isNewArrival: boolean;
    isBestSeller: boolean;
    category: { id: string; name: string; slug: string };
    media: Array<{ url: string; position: number }>;
    variants: Array<{ stockQty: number }>;
};

function toProduct(p: PrismaProductPayload): Product {
    const media = p.media ?? [];
    const variants = p.variants ?? [];
    const sortedMedia = [...media].sort((a, b) => a.position - b.position);
    const imgs = sortedMedia.map((m) => m.url);
    const stockTotal = variants.reduce((s, v) => s + v.stockQty, 0);
    const isOutOfStock = variants.length > 0 && stockTotal === 0;
    const discountedPrice = p.discountPrice ?? undefined;
    const discountPercentage = discountedPrice
        ? Math.round(((p.basePrice - discountedPrice) / p.basePrice) * 100)
        : undefined;
    return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        brand: p.brand,
        originalPrice: p.basePrice,
        discountedPrice,
        discountPercentage,
        rating: p.rating,
        reviewCount: p.reviewCount,
        image: imgs[0] ?? '/feature-prod-1.jpg',
        images: imgs.slice(1),
        isNewArrival: p.isNewArrival,
        isBestSeller: p.isBestSeller,
        isOutOfStock,
        categoryName: p.category.name,
    };
}

const SORT_OPTIONS = [
    { value: 'featured', label: 'Featured' },
    { value: 'priceLow', label: 'Price: Low to High' },
    { value: 'priceHigh', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'discount', label: 'Biggest Discount' },
];

const CATEGORIES = ['All', 'Shirts', 'T-Shirts', 'Jackets', 'Pants', 'Footwear'];
const COLORS = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#ffffff' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Olive', value: '#4d7c0f' },
    { name: 'Purple', value: '#7c3aed' },
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const ProductsPage = () => {
    const router = useRouter();
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/v1/products?status=PUBLISHED&take=100');
                const data = await res.json();
                if (!cancelled && res.ok && data.ok) {
                    const mapped = (data.data.items as PrismaProductPayload[]).map(toProduct);
                    setAllProducts(mapped);
                }
            } finally {
                if (!cancelled) setProductsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const brands = useMemo(
        () => Array.from(new Set(allProducts.map((p) => p.brand))),
        [allProducts]
    );

    const priceFloor = useMemo(
        () =>
            allProducts.length
                ? Math.min(
                    ...allProducts.map((p) => p.discountedPrice ?? p.originalPrice)
                )
                : 0,
        [allProducts]
    );
    const priceCeil = useMemo(
        () =>
            allProducts.length
                ? Math.max(...allProducts.map((p) => p.originalPrice))
                : 10000,
        [allProducts]
    );

    // When products load, expand the max price filter to the catalogue ceiling
    useEffect(() => {
        if (allProducts.length > 0) setMaxPrice(priceCeil);
    }, [priceCeil, allProducts.length]);

    const [category, setCategory] = useState('All');
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [minRating, setMinRating] = useState(0);
    const [maxPrice, setMaxPrice] = useState(priceCeil);
    const [sort, setSort] = useState('featured');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const toggleFromList = (
        value: string,
        list: string[],
        setter: (next: string[]) => void
    ) => {
        setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    };

    const resetFilters = () => {
        setCategory('All');
        setSelectedBrands([]);
        setSelectedColors([]);
        setSelectedSizes([]);
        setMinRating(0);
        setMaxPrice(priceCeil);
        setSort('featured');
    };

    const filtered = useMemo(() => {
        let list = [...allProducts];

        if (selectedBrands.length > 0) {
            list = list.filter((p) => selectedBrands.includes(p.brand));
        }
        if (minRating > 0) {
            list = list.filter((p) => p.rating >= minRating);
        }
        list = list.filter(
            (p) => (p.discountedPrice ?? p.originalPrice) <= maxPrice
        );

        switch (sort) {
            case 'priceLow':
                list.sort(
                    (a, b) =>
                        (a.discountedPrice ?? a.originalPrice) -
                        (b.discountedPrice ?? b.originalPrice)
                );
                break;
            case 'priceHigh':
                list.sort(
                    (a, b) =>
                        (b.discountedPrice ?? b.originalPrice) -
                        (a.discountedPrice ?? a.originalPrice)
                );
                break;
            case 'rating':
                list.sort((a, b) => b.rating - a.rating);
                break;
            case 'discount':
                list.sort(
                    (a, b) => (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0)
                );
                break;
            default:
                break;
        }

        return list;
    }, [allProducts, selectedBrands, minRating, maxPrice, sort]);

    const activeFilterCount =
        (category !== 'All' ? 1 : 0) +
        selectedBrands.length +
        selectedColors.length +
        selectedSizes.length +
        (minRating > 0 ? 1 : 0) +
        (maxPrice < priceCeil ? 1 : 0);

    const handleWishlistToggle = (id: string) => {
        console.log('Wishlist toggled for product:', id);
    };

    const handleAddToCart = (id: string) => {
        console.log('Added to cart:', id);
    };

    const handleProductClick = (id: string) => {
        const p = allProducts.find((x) => x.id === id);
        if (p) router.push(`/product/${p.slug}`);
    };

    const PER_PAGE = 9;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

    const sectionLabel =
        'text-[11px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-900';

    const isLightColor = (hex: string) => {
        const c = hex.replace('#', '');
        const r = parseInt(c.substring(0, 2), 16);
        const g = parseInt(c.substring(2, 4), 16);
        const b = parseInt(c.substring(4, 6), 16);
        return (r * 0.299 + g * 0.587 + b * 0.114) > 200;
    };

    const Filters = (
        <div className="divide-y divide-gray-100">
            {/* Category */}
            <div className="pb-6">
                <h4 className={`${sectionLabel} mb-4`}>Category</h4>
                <ul className="space-y-0.5 -ml-3">
                    {CATEGORIES.map((c) => {
                        const active = category === c;
                        return (
                            <li key={c}>
                                <button
                                    onClick={() => setCategory(c)}
                                    className={`relative w-full text-left pl-3 pr-3 py-2 text-sm font-inter transition-colors duration-200 ${active
                                        ? 'text-gray-900 font-semibold'
                                        : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    <span
                                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 transition-all duration-200 ${active
                                            ? 'h-4 bg-gray-900'
                                            : 'h-0 bg-transparent'
                                            }`}
                                    />
                                    {c}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Price */}
            <div className="py-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className={sectionLabel}>Price</h4>
                    <span className="text-xs font-inter font-semibold text-gray-900">
                        ₹{maxPrice.toLocaleString()}
                    </span>
                </div>
                <input
                    type="range"
                    min={priceFloor}
                    max={priceCeil}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-gray-900 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] font-inter text-gray-400 tracking-wider mt-2">
                    <span>₹{priceFloor.toLocaleString()}</span>
                    <span>₹{priceCeil.toLocaleString()}</span>
                </div>
            </div>

            {/* Brand */}
            <div className="py-6">
                <h4 className={`${sectionLabel} mb-4`}>Brand</h4>
                <ul className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {brands.map((b) => {
                        const checked = selectedBrands.includes(b);
                        return (
                            <li key={b}>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <span
                                        className={`w-[15px] h-[15px] rounded-sm border flex items-center justify-center transition-colors duration-150 ${checked
                                            ? 'bg-gray-900 border-gray-900'
                                            : 'border-gray-300 group-hover:border-gray-900'
                                            }`}
                                    >
                                        {checked && (
                                            <svg
                                                className="w-2.5 h-2.5 text-white"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.704 5.29a1 1 0 010 1.42l-7.997 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.42L8 12.585l7.29-7.295a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={checked}
                                        onChange={() =>
                                            toggleFromList(b, selectedBrands, setSelectedBrands)
                                        }
                                    />
                                    <span
                                        className={`text-sm font-inter transition-colors ${checked
                                            ? 'text-gray-900 font-medium'
                                            : 'text-gray-600 group-hover:text-gray-900'
                                            }`}
                                    >
                                        {b}
                                    </span>
                                </label>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Sizes */}
            <div className="py-6">
                <h4 className={`${sectionLabel} mb-4`}>Size</h4>
                <div className="grid grid-cols-3 gap-1.5">
                    {SIZES.map((s) => {
                        const active = selectedSizes.includes(s);
                        return (
                            <button
                                key={s}
                                onClick={() =>
                                    toggleFromList(s, selectedSizes, setSelectedSizes)
                                }
                                className={`py-2 text-xs font-inter font-semibold rounded-sm border transition-colors duration-150 ${active
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900'
                                    }`}
                            >
                                {s}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Colors */}
            <div className="py-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className={sectionLabel}>Color</h4>
                    {selectedColors.length > 0 && (
                        <span className="text-[11px] font-inter text-gray-500">
                            {selectedColors.join(', ')}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => {
                        const active = selectedColors.includes(c.name);
                        const light = isLightColor(c.value);
                        return (
                            <button
                                key={c.name}
                                onClick={() =>
                                    toggleFromList(c.name, selectedColors, setSelectedColors)
                                }
                                title={c.name}
                                aria-label={c.name}
                                aria-pressed={active}
                                style={{ backgroundColor: c.value }}
                                className={`relative w-7 h-7 rounded-full transition-all duration-200 ${light ? 'border border-gray-200' : ''
                                    } ${active
                                        ? 'ring-1 ring-gray-900 ring-offset-2'
                                        : 'hover:ring-1 hover:ring-gray-400 hover:ring-offset-2'
                                    }`}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Rating */}
            <div className="py-6">
                <h4 className={`${sectionLabel} mb-4`}>Rating</h4>
                <ul className="space-y-1 -ml-3">
                    {[4, 3, 2, 1].map((r) => {
                        const active = minRating === r;
                        return (
                            <li key={r}>
                                <button
                                    onClick={() => setMinRating(r)}
                                    className={`relative w-full flex items-center justify-between pl-3 pr-2 py-1.5 text-sm transition-colors duration-200 ${active ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <span
                                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 transition-all duration-200 ${active ? 'h-4 bg-gray-900' : 'h-0 bg-transparent'
                                            }`}
                                    />
                                    <span className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-3.5 h-3.5 ${i < r ? 'text-yellow-400' : 'text-gray-200'
                                                    }`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </span>
                                    <span
                                        className={`text-[11px] font-inter tracking-wider uppercase ${active ? 'font-semibold' : ''
                                            }`}
                                    >
                                        & up
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                    {minRating > 0 && (
                        <li>
                            <button
                                onClick={() => setMinRating(0)}
                                className="pl-3 py-1.5 text-[11px] font-inter text-gray-500 tracking-wider uppercase hover:text-gray-900 transition-colors"
                            >
                                Clear rating
                            </button>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100">
            <Toaster />

            {/* Page Header */}
            <section className="relative bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 pt-10 pb-14 lg:pt-12 lg:pb-20">
                    {/* Breadcrumb */}
                    <motion.nav
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center gap-2 text-[11px] font-inter font-medium tracking-wider uppercase text-gray-400 mb-12"
                    >
                        <button
                            onClick={() => router.push('/')}
                            className="hover:text-gray-900 transition-colors"
                        >
                            Home
                        </button>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-900">Products</span>
                    </motion.nav>

                    {/* Editorial Title Block */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-5">
                            The Collection
                        </p>

                        <h1 className="font-delius-swash-caps text-5xl md:text-6xl lg:text-7xl text-gray-900 leading-[1.05] mb-6">
                            All Products
                        </h1>

                        <div className="flex items-center justify-center gap-4 mb-6">
                            <span className="h-px w-12 bg-gray-300" />
                            <span className="text-[11px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-500">
                                {allProducts.length} Pieces
                            </span>
                            <span className="h-px w-12 bg-gray-300" />
                        </div>

                        <p className="font-inter text-base text-gray-600 leading-relaxed max-w-xl mx-auto">
                            Hand-picked styles built for every season — refined fits, premium
                            fabrics, and pieces designed to last.
                        </p>
                    </motion.div>
                </div>

                {/* Trust Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="border-t border-gray-100 bg-gray-50/50"
                >
                    <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
                        {[
                            {
                                label: 'Free Shipping',
                                sub: 'on orders over ₹999',
                                icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h11v13H6m12 0h3v-5l-3-4h-4v9" />
                                    </svg>
                                ),
                            },
                            {
                                label: 'Easy Returns',
                                sub: '30-day return policy',
                                icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h11a5 5 0 110 10h-3M3 10l4-4M3 10l4 4" />
                                    </svg>
                                ),
                            },
                            {
                                label: 'Cash on Delivery',
                                sub: 'pay when you receive',
                                icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <rect x="3" y="6" width="18" height="13" rx="2" />
                                        <path strokeLinecap="round" d="M3 10h18" />
                                        <path strokeLinecap="round" d="M7 15h3" />
                                    </svg>
                                ),
                            },
                            {
                                label: 'Secure Checkout',
                                sub: 'SSL-encrypted payments',
                                icon: (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <rect x="5" y="11" width="14" height="9" rx="1.5" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0v4" />
                                    </svg>
                                ),
                            },
                        ].map((t) => (
                            <div
                                key={t.label}
                                className="flex items-center gap-3 justify-center md:justify-start"
                            >
                                <div className="text-gray-900 flex-shrink-0">{t.icon}</div>
                                <div className="leading-tight">
                                    <p className="text-xs font-inter font-semibold text-gray-900">
                                        {t.label}
                                    </p>
                                    <p className="text-[11px] font-inter text-gray-500 hidden sm:block">
                                        {t.sub}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-4 py-10">
                <div className="grid grid-cols-12 gap-8">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden lg:block col-span-3">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="sticky top-[120px]"
                        >
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                                <h3 className="text-xs font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                                    Refine
                                </h3>
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={resetFilters}
                                        className="text-[11px] font-inter font-medium tracking-wider uppercase text-gray-500 hover:text-red-600 transition-colors"
                                    >
                                        Clear ({activeFilterCount})
                                    </button>
                                )}
                            </div>
                            {Filters}
                        </motion.div>
                    </aside>

                    {/* Products Section */}
                    <div className="col-span-12 lg:col-span-9">
                        {/* Toolbar */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 mb-6 border-b border-gray-200 sticky top-[100px] z-20 bg-slate-100/85 backdrop-blur-md -mx-4 px-4 pt-3"
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsFiltersOpen(true)}
                                    className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 border border-gray-300 text-gray-900 text-[11px] font-inter font-semibold tracking-widest uppercase hover:border-gray-900 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12M10 18h4" />
                                    </svg>
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <span className="bg-gray-900 text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                                <p className="text-xs font-inter text-gray-500 tracking-wider">
                                    <span className="font-semibold text-gray-900">
                                        {filtered.length}
                                    </span>
                                    {' '}of {allProducts.length} products
                                </p>
                            </div>

                            <div className="flex items-center gap-5">
                                {/* Sort */}
                                <SortDropdown
                                    value={sort}
                                    onChange={setSort}
                                    options={SORT_OPTIONS}
                                />

                                {/* View Toggle */}
                                <div className="hidden sm:flex items-center gap-1">
                                    <button
                                        onClick={() => setView('grid')}
                                        title="Grid view"
                                        aria-pressed={view === 'grid'}
                                        className={`p-1.5 transition-colors duration-200 ${view === 'grid'
                                            ? 'text-gray-900'
                                            : 'text-gray-300 hover:text-gray-600'
                                            }`}
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setView('list')}
                                        title="List view"
                                        aria-pressed={view === 'list'}
                                        className={`p-1.5 transition-colors duration-200 ${view === 'list'
                                            ? 'text-gray-900'
                                            : 'text-gray-300 hover:text-gray-600'
                                            }`}
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Active filter chips */}
                        {activeFilterCount > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                {category !== 'All' && (
                                    <Chip label={category} onClear={() => setCategory('All')} />
                                )}
                                {selectedBrands.map((b) => (
                                    <Chip
                                        key={b}
                                        label={b}
                                        onClear={() =>
                                            toggleFromList(b, selectedBrands, setSelectedBrands)
                                        }
                                    />
                                ))}
                                {selectedSizes.map((s) => (
                                    <Chip
                                        key={s}
                                        label={`Size: ${s}`}
                                        onClear={() =>
                                            toggleFromList(s, selectedSizes, setSelectedSizes)
                                        }
                                    />
                                ))}
                                {selectedColors.map((c) => (
                                    <Chip
                                        key={c}
                                        label={c}
                                        onClear={() =>
                                            toggleFromList(c, selectedColors, setSelectedColors)
                                        }
                                    />
                                ))}
                                {minRating > 0 && (
                                    <Chip
                                        label={`${minRating}+ stars`}
                                        onClear={() => setMinRating(0)}
                                    />
                                )}
                                {maxPrice < priceCeil && (
                                    <Chip
                                        label={`Under ₹${maxPrice.toLocaleString()}`}
                                        onClear={() => setMaxPrice(priceCeil)}
                                    />
                                )}
                                <button
                                    onClick={resetFilters}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-inter font-semibold text-gray-600 hover:text-red-600 transition-colors"
                                >
                                    <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                                        />
                                    </svg>
                                    Clear all
                                </button>
                            </div>
                        )}

                        {/* Products Grid / List */}
                        {filtered.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <Icons name="search" size={28} color="#10b981" />
                                </div>
                                <h3 className="font-delius-swash-caps text-2xl text-gray-900 mb-2">
                                    No products found
                                </h3>
                                <p className="text-sm font-inter text-gray-600 max-w-sm mx-auto mb-6">
                                    Try clearing some filters or browse a different category.
                                </p>
                                <button
                                    onClick={resetFilters}
                                    className="bg-gray-900 text-white px-6 py-3 rounded-md font-inter font-semibold hover:bg-emerald-600 transition-all duration-300"
                                >
                                    Reset Filters
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`${view}-${sort}-${filtered.length}`}
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: {},
                                    visible: { transition: { staggerChildren: 0.08 } },
                                }}
                                className={
                                    view === 'grid'
                                        ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                                        : 'flex flex-col gap-6'
                                }
                            >
                                {filtered.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 24 },
                                            visible: {
                                                opacity: 1,
                                                y: 0,
                                                transition: { duration: 0.5, ease: 'easeOut' },
                                            },
                                        }}
                                    >
                                        {view === 'grid' ? (
                                            <ProductCard
                                                id={product.id}
                                                title={product.title}
                                                brand={product.brand}
                                                originalPrice={product.originalPrice}
                                                discountedPrice={product.discountedPrice}
                                                discountPercentage={product.discountPercentage}
                                                rating={product.rating}
                                                reviewCount={product.reviewCount}
                                                image={product.image}
                                                images={product.images}
                                                isNewArrival={product.isNewArrival}
                                                isBestSeller={product.isBestSeller}
                                                isOutOfStock={product.isOutOfStock}
                                                onWishlistToggle={handleWishlistToggle}
                                                onAddToCart={handleAddToCart}
                                                onProductClick={handleProductClick}
                                            />
                                        ) : (
                                            <ProductListItem
                                                product={product}
                                                onClick={() => handleProductClick(product.id)}
                                            />
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-12">
                                <button className="w-10 h-10 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-emerald-400 transition-all duration-200 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                    (n) => (
                                        <button
                                            key={n}
                                            className={`w-10 h-10 rounded-md text-sm font-inter font-semibold transition-all duration-200 ${n === 1
                                                ? 'bg-gray-900 text-white shadow-md'
                                                : 'border border-gray-200 bg-white text-gray-700 hover:border-emerald-400 hover:text-emerald-600'
                                                }`}
                                        >
                                            {n}
                                        </button>
                                    )
                                )}
                                <button className="w-10 h-10 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-emerald-400 transition-all duration-200 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Mobile filter drawer */}
            {isFiltersOpen && (
                <div className="lg:hidden fixed inset-0 z-[9998] flex">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsFiltersOpen(false)}
                    />
                    <div className="relative ml-auto w-[85%] max-w-sm h-full bg-white shadow-2xl border-l-2 border-emerald-500 animate-slideIn overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 flex items-center justify-between px-5 py-4 z-10">
                            <h3 className="font-delius-swash-caps font-bold text-xl text-gray-900">
                                Filters
                            </h3>
                            <Icons
                                name="close"
                                size={28}
                                color="red"
                                className="cursor-pointer hover:rotate-90 transition-transform duration-300 p-1 rounded-full hover:bg-red-50"
                                onClick={() => setIsFiltersOpen(false)}
                            />
                        </div>
                        <div className="p-5">{Filters}</div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
                            <button
                                onClick={() => setIsFiltersOpen(false)}
                                className="w-full bg-gray-900 text-white py-3 rounded-md font-inter font-semibold hover:bg-emerald-600 transition-all duration-300"
                            >
                                Show {filtered.length} results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Chip = ({ label, onClear }: { label: string; onClear: () => void }) => (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 text-xs font-inter font-semibold rounded-full shadow-sm">
        {label}
        <button
            onClick={onClear}
            className="w-4 h-4 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors"
        >
            <svg
                className="w-2.5 h-2.5 text-emerald-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        </button>
    </span>
);

function ProductListItem({
    product,
    onClick,
}: {
    product: Product;
    onClick: () => void;
}) {
    const dispatch = useAppDispatch();
    const isWishlisted = useAppSelector((state) =>
        state.wishlist.items.some((i) => i.id === product.id)
    );

    const displayPrice = product.discountedPrice ?? product.originalPrice;
    const savings = product.discountedPrice
        ? product.originalPrice - product.discountedPrice
        : 0;

    const stop = (e: React.MouseEvent) => e.stopPropagation();

    const handleAdd = (e: React.MouseEvent) => {
        stop(e);
        if (product.isOutOfStock) return;
        dispatch(
            addToCart({
                id: product.id,
                title: product.title,
                brand: product.brand,
                image: product.image,
                originalPrice: product.originalPrice,
                discountedPrice: product.discountedPrice,
                size: 'M',
                color: 'Default',
                quantity: 1,
            })
        );
        toast.success('Added to bag');
    };

    const handleWishlist = (e: React.MouseEvent) => {
        stop(e);
        const wasIn = isWishlisted;
        dispatch(
            toggleWishlist({
                id: product.id,
                title: product.title,
                brand: product.brand,
                image: product.image,
                originalPrice: product.originalPrice,
                discountedPrice: product.discountedPrice,
                rating: product.rating,
                inStock: !product.isOutOfStock,
            })
        );
        toast.success(wasIn ? 'Removed from wishlist' : 'Added to wishlist');
    };

    return (
        <div
            onClick={onClick}
            className="group flex bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
            {/* Image */}
            <div className="relative w-44 sm:w-56 md:w-64 flex-shrink-0 bg-gray-50 overflow-hidden">
                <img
                    src={product.image}
                    alt={product.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${product.isOutOfStock ? 'opacity-60 grayscale' : ''
                        }`}
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.isNewArrival && (
                        <span className="px-2.5 py-1 text-[10px] font-inter font-semibold tracking-wider uppercase rounded-sm text-white bg-gray-900">
                            New
                        </span>
                    )}
                    {product.isBestSeller && (
                        <span className="px-2.5 py-1 text-[10px] font-inter font-semibold tracking-wider uppercase rounded-sm text-white bg-amber-600">
                            Bestseller
                        </span>
                    )}
                    {product.discountPercentage && product.discountPercentage > 0 && !product.isOutOfStock && (
                        <span className="px-2.5 py-1 text-[10px] font-inter font-semibold tracking-wider uppercase rounded-sm text-emerald-700 bg-white border border-emerald-200">
                            -{product.discountPercentage}%
                        </span>
                    )}
                    {product.isOutOfStock && (
                        <span className="px-2.5 py-1 text-[10px] font-inter font-semibold tracking-wider uppercase rounded-sm text-white bg-gray-700">
                            Sold Out
                        </span>
                    )}
                </div>

                {/* Out of Stock Stamp */}
                {product.isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="border border-gray-900 bg-white/80 backdrop-blur-[2px] px-4 py-1.5">
                            <span className="text-[11px] font-inter font-bold tracking-[0.3em] uppercase text-gray-900">
                                Sold Out
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between min-w-0">
                {/* Left details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-[11px] font-inter font-semibold tracking-[0.25em] uppercase text-emerald-600">
                            {product.brand}
                        </p>
                        <button
                            onClick={handleWishlist}
                            aria-label={
                                isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
                            }
                            className="flex-shrink-0 w-9 h-9 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors sm:hidden"
                        >
                            <svg
                                className={`w-4 h-4 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-700'
                                    }`}
                                viewBox="0 0 24 24"
                                fill={isWishlisted ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                strokeWidth={1.8}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        </button>
                    </div>

                    <h3 className="mt-2 font-delius-swash-caps text-xl md:text-2xl text-gray-900 leading-tight line-clamp-2">
                        {product.title}
                    </h3>

                    <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-3.5 h-3.5 ${i < Math.floor(product.rating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-200'
                                        }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-xs font-inter text-gray-500">
                            {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()})
                        </span>
                    </div>

                    {/* Price */}
                    <div className="mt-4 flex items-baseline gap-2.5">
                        <span className="text-xl font-inter font-semibold text-gray-900">
                            ₹{displayPrice.toLocaleString()}
                        </span>
                        {product.discountedPrice && (
                            <>
                                <span className="text-sm font-inter text-gray-400 line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                </span>
                                <span className="text-[11px] font-inter font-semibold text-emerald-600 uppercase tracking-wider">
                                    Save ₹{savings.toLocaleString()}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Meta row */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-inter font-medium tracking-wider uppercase text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.8}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h11v13H6m12 0h3v-5l-3-4h-4v9" />
                            </svg>
                            Free Shipping
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.8}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h11a5 5 0 110 10h-3M3 10l4-4M3 10l4 4" />
                            </svg>
                            30-Day Returns
                        </span>
                    </div>
                </div>

                {/* Right actions */}
                <div className="flex sm:flex-col items-stretch gap-2 sm:w-44 sm:justify-end">
                    <button
                        onClick={handleAdd}
                        disabled={product.isOutOfStock}
                        className={`flex-1 sm:flex-none py-3 text-[11px] font-inter font-semibold tracking-widest uppercase rounded-md transition-colors duration-200 ${product.isOutOfStock
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-900 text-white hover:bg-emerald-600'
                            }`}
                    >
                        {product.isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                    </button>
                    <button
                        onClick={handleWishlist}
                        aria-label={
                            isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
                        }
                        className="hidden sm:inline-flex py-3 text-[11px] font-inter font-semibold tracking-widest uppercase border border-gray-200 rounded-md text-gray-900 hover:border-gray-900 transition-colors duration-200 items-center justify-center gap-2"
                    >
                        <svg
                            className={`w-3.5 h-3.5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-700'
                                }`}
                            viewBox="0 0 24 24"
                            fill={isWishlisted ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth={1.8}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                        {isWishlisted ? 'Saved' : 'Wishlist'}
                    </button>
                </div>
            </div>
        </div>
    );
}

type SortOption = { value: string; label: string };

function SortDropdown({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (v: string) => void;
    options: SortOption[];
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const current = options.find((o) => o.value === value) ?? options[0];

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="group inline-flex items-center gap-2 py-1.5 cursor-pointer"
            >
                <span className="hidden md:inline-block text-[11px] font-inter font-medium tracking-widest uppercase text-gray-500">
                    Sort by
                </span>
                <span className="text-xs font-inter font-semibold tracking-wider uppercase text-gray-900 border-b border-transparent group-hover:border-gray-900 transition-colors">
                    {current.label}
                </span>
                <svg
                    className={`w-3 h-3 text-gray-700 transition-transform duration-200 ${open ? 'rotate-180' : ''
                        }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-3 w-60 bg-white border border-gray-200 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] z-30 overflow-hidden"
                        role="listbox"
                    >
                        <div className="px-4 pt-4 pb-2 border-b border-gray-100">
                            <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-400">
                                Sort by
                            </p>
                        </div>
                        <ul className="py-2">
                            {options.map((o) => {
                                const active = o.value === value;
                                return (
                                    <li key={o.value}>
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={active}
                                            onClick={() => {
                                                onChange(o.value);
                                                setOpen(false);
                                            }}
                                            className={`relative w-full text-left pl-6 pr-4 py-2.5 text-xs font-inter tracking-wider uppercase transition-colors duration-150 ${active
                                                ? 'text-gray-900 font-semibold bg-gray-50'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span
                                                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 transition-all duration-200 ${active
                                                    ? 'h-5 bg-gray-900'
                                                    : 'h-0 bg-transparent'
                                                    }`}
                                            />
                                            <span className="flex items-center justify-between">
                                                {o.label}
                                                {active && (
                                                    <svg
                                                        className="w-3.5 h-3.5 text-gray-900"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth={2.5}
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                )}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductsPage;
