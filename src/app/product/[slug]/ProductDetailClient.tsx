'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import ProductCard from '@/components/ui/ProductCard';
import ProductReviews, {
    type ApprovedReview,
    type UserReview,
} from '@/components/product/ProductReviews';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addToCart } from '@/redux/slices/cartSlice';
import { toggleWishlist } from '@/redux/slices/wishlistSlice';
import type { ProductView } from '@/lib/catalog';

type ReviewsViewer =
    | { state: 'guest' }
    | { state: 'cannot-review' }
    | { state: 'already-reviewed'; review: UserReview }
    | { state: 'can-review' };

const FashionCustomizerModal = dynamic(
    () => import('@/components/ai-fashion/FashionCustomizerModal'),
    { ssr: false }
);

const FALLBACK_COLORS: Array<{ name: string; hex: string }> = [
    { name: 'Olive', hex: '#4d7c0f' },
    { name: 'Charcoal', hex: '#111827' },
    { name: 'Ivory', hex: '#f5f5f4' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Indigo', hex: '#4338ca' },
];

const COLOR_HEX: Record<string, string> = {
    Black: '#000000',
    Charcoal: '#374151',
    Ivory: '#f5f5f4',
    White: '#ffffff',
    Olive: '#4d7c0f',
    Sage: '#86efac',
    Emerald: '#10b981',
    Blush: '#fce7f3',
    Rose: '#f43f5e',
    Burgundy: '#7f1d1d',
    Cobalt: '#1e40af',
    Indigo: '#4338ca',
    Lavender: '#c4b5fd',
    Mustard: '#ca8a04',
    Midnight: '#111827',
    'Royal Blue': '#1e40af',
    Default: '#9ca3af',
};

type AccordionItem = { key: string; title: string; body: string };

const DEFAULT_ACCORDION_BODY = {
    description:
        'Crafted from premium fabric with a tailored silhouette, this piece blends everyday comfort with refined finishing. Designed to layer effortlessly across seasons.',
    fabric:
        '100% premium cotton. Machine wash cold with similar colors. Tumble dry low. Warm iron if needed. Do not bleach.',
    shipping:
        'Free standard shipping on orders over ₹999. Express delivery available at checkout. Easy 30-day returns on unworn items with tags attached.',
};

const ProductDetailClient = ({
    product,
    related,
    approvedReviews,
    viewer,
}: {
    product: ProductView;
    related: ProductView[];
    approvedReviews: ApprovedReview[];
    viewer: ReviewsViewer;
}) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isWishlisted = useAppSelector((state) =>
        state.wishlist.items.some((i) => i.id === product.id)
    );

    const colorOptions = useMemo(() => {
        const fromVariants = Array.from(
            new Set(product.variants.map((v) => v.color))
        );
        if (fromVariants.length === 0) return FALLBACK_COLORS;
        return fromVariants.map((name) => ({
            name,
            hex: COLOR_HEX[name] ?? '#9ca3af',
        }));
    }, [product.variants]);

    const sizeOptions = useMemo(() => {
        const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
        return sizes.map((label) => {
            const stockTotal = product.variants
                .filter((v) => v.size === label)
                .reduce((sum, v) => sum + v.stockQty, 0);
            return {
                label,
                available: stockTotal > 0 || product.variants.length === 0,
            };
        });
    }, [product.variants]);

    const allImages = useMemo(
        () => [product.image, ...product.images].filter(Boolean),
        [product.image, product.images]
    );

    const accordion: AccordionItem[] = useMemo(
        () => [
            {
                key: 'description',
                title: 'Description',
                body: product.description ?? DEFAULT_ACCORDION_BODY.description,
            },
            {
                key: 'fabric',
                title: 'Fabric & Care',
                body: DEFAULT_ACCORDION_BODY.fabric,
            },
            {
                key: 'shipping',
                title: 'Shipping & Returns',
                body: DEFAULT_ACCORDION_BODY.shipping,
            },
        ],
        [product.description]
    );

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(
        colorOptions[0]?.name ?? 'Default'
    );
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [openAccordion, setOpenAccordion] = useState<string | null>('description');
    const [customizerOpen, setCustomizerOpen] = useState(false);

    const handleAddToCart = () => {
        if (product.isOutOfStock) return;
        if (sizeOptions.length > 0 && !selectedSize) {
            toast.error('Please select a size');
            return;
        }
        dispatch(
            addToCart({
                id: product.id,
                title: product.title,
                brand: product.brand,
                image: product.image,
                originalPrice: product.originalPrice,
                discountedPrice: product.discountedPrice,
                size: selectedSize ?? 'One Size',
                color: selectedColor,
                quantity,
            })
        );
        toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to bag`);
    };

    const handleWishlistToggle = () => {
        const wasWishlisted = isWishlisted;
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
        toast.success(
            wasWishlisted ? 'Removed from wishlist' : 'Added to wishlist'
        );
    };

    const displayPrice = product.discountedPrice ?? product.originalPrice;
    const savings = product.discountedPrice
        ? product.originalPrice - product.discountedPrice
        : 0;

    return (
        <div className="min-h-screen bg-white">
            <Toaster />

            {/* Non-published banner */}
            {product.status !== 'PUBLISHED' && (
                <div className="bg-amber-50 border-b border-amber-200">
                    <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-inter text-amber-900">
                        <span className="flex items-center gap-2">
                            <svg
                                className="w-4 h-4 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.8}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                />
                            </svg>
                            <span>
                                <strong className="font-semibold tracking-wide">
                                    {product.status}
                                </strong>
                                {' — '}This product is not visible to customers yet.
                            </span>
                        </span>
                        <a
                            href={`/admin/products/${product.id}`}
                            className="font-semibold tracking-widest uppercase underline-offset-2 hover:underline whitespace-nowrap"
                        >
                            Edit in Admin →
                        </a>
                    </div>
                </div>
            )}

            <nav className="max-w-7xl mx-auto px-4 pt-8 pb-2 flex items-center gap-2 text-[11px] font-inter font-medium tracking-wider uppercase text-gray-400">
                <button
                    onClick={() => router.push('/')}
                    className="hover:text-gray-900 transition-colors"
                >
                    Home
                </button>
                <span className="text-gray-300">/</span>
                <button
                    onClick={() => router.push('/products')}
                    className="hover:text-gray-900 transition-colors"
                >
                    Products
                </button>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900 normal-case tracking-normal font-inter truncate max-w-[200px] sm:max-w-none">
                    {product.title}
                </span>
            </nav>

            <section className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Gallery */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-7"
                    >
                        <div className="flex gap-4">
                            <div className="hidden sm:flex flex-col gap-3 w-20">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative aspect-square w-full overflow-hidden rounded-md border transition-all duration-200 ${selectedImage === idx
                                            ? 'border-gray-900 ring-1 ring-gray-900'
                                            : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={img}
                                            alt={`${product.title} view ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="relative flex-1 bg-gray-50 rounded-lg overflow-hidden aspect-[4/5]">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={selectedImage}
                                        src={allImages[selectedImage]}
                                        alt={product.title}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </AnimatePresence>

                                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
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
                                    {product.discountPercentage &&
                                        product.discountPercentage > 0 && (
                                            <span className="px-2.5 py-1 text-[10px] font-inter font-semibold tracking-wider uppercase rounded-sm text-emerald-700 bg-white border border-emerald-200">
                                                -{product.discountPercentage}%
                                            </span>
                                        )}
                                </div>

                                {allImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={() =>
                                                setSelectedImage(
                                                    (selectedImage - 1 + allImages.length) %
                                                    allImages.length
                                                )
                                            }
                                            aria-label="Previous image"
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                                        >
                                            <svg
                                                className="w-4 h-4 text-gray-900"
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
                                        <button
                                            onClick={() =>
                                                setSelectedImage(
                                                    (selectedImage + 1) % allImages.length
                                                )
                                            }
                                            aria-label="Next image"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                                        >
                                            <svg
                                                className="w-4 h-4 text-gray-900"
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
                                    </>
                                )}

                                {allImages.length > 1 && (
                                    <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                        {allImages.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(idx)}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${selectedImage === idx
                                                    ? 'w-6 bg-gray-900'
                                                    : 'w-1.5 bg-gray-400'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-5 lg:sticky lg:top-[120px] lg:self-start"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-emerald-600">
                                {product.brand}
                            </p>
                            <p className="text-[11px] font-inter text-gray-400 tracking-wider">
                                SKU: FW-{product.id.slice(0, 8).toUpperCase()}
                            </p>
                        </div>

                        <h1 className="font-delius-swash-caps text-3xl md:text-4xl lg:text-5xl text-gray-900 leading-tight mb-4">
                            {product.title}
                        </h1>

                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.floor(product.rating)
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
                            <span className="text-sm font-inter font-semibold text-gray-900">
                                {product.rating.toFixed(1)}
                            </span>
                            <span className="text-gray-300">·</span>
                            <a
                                href="#reviews"
                                className="text-sm font-inter text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline transition-colors"
                            >
                                {product.reviewCount.toLocaleString()} review
                                {product.reviewCount === 1 ? '' : 's'}
                            </a>
                        </div>

                        <div className="flex items-baseline gap-3 mb-8">
                            <span className="text-3xl font-inter font-semibold text-gray-900">
                                ₹{displayPrice.toLocaleString()}
                            </span>
                            {product.discountedPrice && (
                                <>
                                    <span className="text-base font-inter text-gray-400 line-through">
                                        ₹{product.originalPrice.toLocaleString()}
                                    </span>
                                    <span className="text-xs font-inter font-semibold text-emerald-600 uppercase tracking-wider">
                                        Save ₹{savings.toLocaleString()}
                                    </span>
                                </>
                            )}
                        </div>

                        {colorOptions.length > 0 && (
                            <div className="mb-7">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-[11px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-900">
                                        Color
                                    </h3>
                                    <span className="text-xs font-inter text-gray-500">
                                        {selectedColor}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {colorOptions.map((c) => {
                                        const active = selectedColor === c.name;
                                        return (
                                            <button
                                                key={c.name}
                                                onClick={() => setSelectedColor(c.name)}
                                                title={c.name}
                                                aria-label={c.name}
                                                style={{ backgroundColor: c.hex }}
                                                className={`w-9 h-9 rounded-full border transition-all duration-200 ${active
                                                    ? 'ring-2 ring-gray-900 ring-offset-2 border-white'
                                                    : 'border-gray-200 hover:ring-1 hover:ring-gray-400 hover:ring-offset-1'
                                                    }`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {sizeOptions.length > 0 && (
                            <div className="mb-7">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-[11px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-900">
                                        Size
                                    </h3>
                                    <button className="text-xs font-inter text-gray-500 hover:text-gray-900 underline-offset-2 hover:underline transition-colors">
                                        Size guide
                                    </button>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    {sizeOptions.map((s) => {
                                        const active = selectedSize === s.label;
                                        return (
                                            <button
                                                key={s.label}
                                                disabled={!s.available}
                                                onClick={() => setSelectedSize(s.label)}
                                                className={`relative py-3 text-xs font-inter font-semibold rounded-md border transition-all duration-200 ${!s.available
                                                    ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                                                    : active
                                                        ? 'border-gray-900 bg-gray-900 text-white'
                                                        : 'border-gray-200 text-gray-900 hover:border-gray-900'
                                                    }`}
                                            >
                                                {s.label}
                                                {!s.available && (
                                                    <span className="absolute inset-0 flex items-center justify-center">
                                                        <span className="w-full h-px bg-gray-300 rotate-[-20deg]" />
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex items-stretch gap-3 mb-4">
                            <div className="flex items-center border border-gray-200 rounded-md">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    aria-label="Decrease quantity"
                                    className="w-11 h-12 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                                >
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
                                            d="M20 12H4"
                                        />
                                    </svg>
                                </button>
                                <span className="w-10 text-center text-sm font-inter font-semibold text-gray-900">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    aria-label="Increase quantity"
                                    className="w-11 h-12 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                                >
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
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={product.isOutOfStock}
                                className={`flex-1 text-sm font-inter font-semibold tracking-widest uppercase rounded-md transition-colors duration-200 ${product.isOutOfStock
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-900 text-white hover:bg-emerald-600'
                                    }`}
                            >
                                {product.isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
                            </button>
                        </div>

                        <button
                            onClick={handleWishlistToggle}
                            className="w-full py-3 mb-8 text-sm font-inter font-semibold tracking-widest uppercase border border-gray-200 rounded-md text-gray-900 hover:border-gray-900 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <svg
                                className={`w-4 h-4 transition-colors ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-700'
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
                            {isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
                        </button>

                        {product.isCustomizable && (
                            <div className="relative mb-8">
                                <span
                                    aria-hidden
                                    className="absolute -inset-1 rounded-xl ai-glow pointer-events-none"
                                />
                                <button
                                    onClick={() => setCustomizerOpen(true)}
                                    className="group relative w-full py-3.5 rounded-xl overflow-hidden text-white ai-gradient transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg"
                                >
                                    <span
                                        aria-hidden
                                        className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
                                    />
                                    <span
                                        aria-hidden
                                        className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none"
                                    />
                                    <span className="relative flex items-center justify-center gap-2.5">
                                        <span className="relative w-5 h-5 ai-sparkle">
                                            <svg
                                                className="absolute inset-0 w-5 h-5 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M12 2.5l1.6 4.5 4.5 1.6-4.5 1.6L12 14.7l-1.6-4.5L5.9 8.6l4.5-1.6L12 2.5z" />
                                            </svg>
                                            <svg
                                                className="absolute -bottom-0.5 -right-1 w-2.5 h-2.5"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M12 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
                                            </svg>
                                            <svg
                                                className="absolute -top-0.5 -left-1 w-2 h-2"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M12 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
                                            </svg>
                                        </span>
                                        <span className="text-sm font-inter font-semibold tracking-[0.18em] uppercase">
                                            Customize with AI
                                        </span>
                                        <span className="text-[10px] font-inter font-bold tracking-[0.25em] uppercase text-white/95 bg-white/15 backdrop-blur-sm border border-white/25 px-2 py-0.5 rounded-full">
                                            Beta
                                        </span>
                                    </span>
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 py-5 border-y border-gray-100 mb-8">
                            {[
                                { label: 'Free shipping', sub: 'over ₹999', icon: TruckIcon },
                                {
                                    label: '30-day returns',
                                    sub: 'no questions',
                                    icon: ReturnIcon,
                                },
                                {
                                    label: 'Secure checkout',
                                    sub: 'SSL encrypted',
                                    icon: LockIcon,
                                },
                            ].map((t) => (
                                <div
                                    key={t.label}
                                    className="flex flex-col items-center text-center gap-1.5"
                                >
                                    <div className="text-gray-900">
                                        <t.icon />
                                    </div>
                                    <p className="text-[11px] font-inter font-semibold text-gray-900 leading-tight">
                                        {t.label}
                                    </p>
                                    <p className="text-[10px] font-inter text-gray-500">{t.sub}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100">
                            {accordion.map((acc) => {
                                const isOpen = openAccordion === acc.key;
                                return (
                                    <div key={acc.key} className="border-b border-gray-100">
                                        <button
                                            onClick={() =>
                                                setOpenAccordion(isOpen ? null : acc.key)
                                            }
                                            className="w-full py-4 flex items-center justify-between text-left group"
                                        >
                                            <span className="text-xs font-inter font-semibold tracking-[0.2em] uppercase text-gray-900 group-hover:text-emerald-600 transition-colors">
                                                {acc.title}
                                            </span>
                                            <svg
                                                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                                                    }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="pb-5 text-sm font-inter text-gray-600 leading-relaxed whitespace-pre-line">
                                                        {acc.body}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </section>

            <ProductReviews
                productId={product.id}
                productTitle={product.title}
                rating={product.rating}
                reviewCount={product.reviewCount}
                approvedReviews={approvedReviews}
                viewer={viewer}
            />

            {related.length > 0 && (
                <section className="bg-gray-50/50 border-t border-gray-100 py-16 lg:py-20">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-10">
                            <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-3">
                                Pair It With
                            </p>
                            <h2 className="font-delius-swash-caps text-3xl md:text-4xl text-gray-900 mb-3">
                                You May Also Like
                            </h2>
                            <div className="flex items-center justify-center gap-3">
                                <span className="h-px w-10 bg-gray-300" />
                                <span className="text-[11px] font-inter font-medium tracking-[0.25em] uppercase text-gray-500">
                                    Curated for you
                                </span>
                                <span className="h-px w-10 bg-gray-300" />
                            </div>
                        </div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            variants={{
                                hidden: {},
                                visible: { transition: { staggerChildren: 0.08 } },
                            }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {related.map((p) => (
                                <motion.div
                                    key={p.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: {
                                            opacity: 1,
                                            y: 0,
                                            transition: { duration: 0.5 },
                                        },
                                    }}
                                >
                                    <ProductCard
                                        id={p.id}
                                        title={p.title}
                                        brand={p.brand}
                                        originalPrice={p.originalPrice}
                                        discountedPrice={p.discountedPrice}
                                        discountPercentage={p.discountPercentage}
                                        rating={p.rating}
                                        reviewCount={p.reviewCount}
                                        image={p.image}
                                        images={p.images}
                                        isNewArrival={p.isNewArrival}
                                        isBestSeller={p.isBestSeller}
                                        isOutOfStock={p.isOutOfStock}
                                        onProductClick={() => router.push(`/product/${p.slug}`)}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            <FashionCustomizerModal
                open={customizerOpen}
                onClose={() => setCustomizerOpen(false)}
                product={{
                    id: product.id,
                    title: product.title,
                    brand: product.brand,
                    image: product.image,
                    basePrice: product.discountedPrice ?? product.originalPrice,
                }}
            />
        </div>
    );
};

const TruckIcon = () => (
    <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4h11v13H6m12 0h3v-5l-3-4h-4v9"
        />
    </svg>
);

const ReturnIcon = () => (
    <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10h11a5 5 0 110 10h-3M3 10l4-4M3 10l4 4"
        />
    </svg>
);

const LockIcon = () => (
    <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
    >
        <rect x="5" y="11" width="14" height="9" rx="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0v4" />
    </svg>
);

export default ProductDetailClient;
