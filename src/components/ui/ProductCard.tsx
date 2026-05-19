'use client';
import { useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addToCart } from "@/redux/slices/cartSlice";
import { toggleWishlist } from "@/redux/slices/wishlistSlice";

interface ProductCardProps {
    id: string;
    title: string;
    brand: string;
    originalPrice: number;
    discountedPrice?: number;
    discountPercentage?: number;
    rating: number;
    reviewCount: number;
    image: string;
    images?: string[];
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    isOutOfStock?: boolean;
    isLimitedEdition?: boolean;
    isSale?: boolean;
    sizeVariants?: string[];
    colorVariants?: string[];
    deliveryTime?: string;
    freeShipping?: boolean;
    onWishlistToggle?: (id: string) => void;
    onAddToCart?: (id: string) => void;
    onProductClick?: (id: string) => void;
    onQuickView?: (id: string) => void;
    onSizeGuide?: (id: string) => void;
}

const ProductCard = ({
    id,
    title,
    brand,
    originalPrice,
    discountedPrice,
    discountPercentage,
    rating,
    reviewCount,
    image,
    images = [],
    isNewArrival = false,
    isBestSeller = false,
    isOutOfStock = false,
    isLimitedEdition = false,
    isSale = false,
    sizeVariants = [],
    colorVariants = [],
    deliveryTime = "3-5 days",
    freeShipping = true,
    onWishlistToggle,
    onAddToCart,
    onProductClick,
    onQuickView,
    onSizeGuide
}: ProductCardProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showSizeGuide, setShowSizeGuide] = useState(false);

    const dispatch = useAppDispatch();
    const isWishlisted = useAppSelector((state) =>
        state.wishlist.items.some((i) => i.id === id)
    );

    const allImages = [image, ...images];
    const displayPrice = discountedPrice || originalPrice;
    const savings = discountedPrice ? originalPrice - discountedPrice : 0;

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const wasWishlisted = isWishlisted;
        dispatch(
            toggleWishlist({
                id,
                title,
                brand,
                image,
                originalPrice,
                discountedPrice,
                rating,
                inStock: !isOutOfStock,
            })
        );
        toast.success(wasWishlisted ? "Removed from wishlist" : "Added to wishlist");
        onWishlistToggle?.(id);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isOutOfStock) return;
        dispatch(
            addToCart({
                id,
                title,
                brand,
                image,
                originalPrice,
                discountedPrice,
                size: sizeVariants[0] ?? "M",
                color: colorVariants[0] ?? "Default",
                quantity: 1,
            })
        );
        toast.success("Added to bag");
        onAddToCart?.(id);
    };

    const handleProductClick = () => {
        onProductClick?.(id);
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.stopPropagation();
        onQuickView?.(id);
    };

    const handleSizeGuide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowSizeGuide(!showSizeGuide);
        onSizeGuide?.(id);
    };

    const hoverImage =
        allImages.length > 1
            ? allImages[(currentImageIndex + 1) % allImages.length]
            : null;

    return (
        <div
            className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-gray-200 transition-shadow duration-300 cursor-pointer"
            onClick={handleProductClick}
        >
            {/* Product Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                {/* Primary Image */}
                <img
                    src={allImages[currentImageIndex]}
                    alt={title}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${hoverImage ? 'group-hover:opacity-0' : ''
                        } ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
                />

                {/* Hover Crossfade Image */}
                {hoverImage && !isOutOfStock && (
                    <img
                        src={hoverImage}
                        alt={title}
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
                    />
                )}

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {isNewArrival && (
                        <span className="px-2.5 py-1 text-[10px] font-inter font-semibold tracking-wider uppercase rounded-sm text-white bg-gray-900">
                            New
                        </span>
                    )}

                    {isBestSeller && (
                        <span className="px-2.5 py-1 text-[10px] font-inter font-semibold tracking-wider uppercase rounded-sm text-white bg-amber-600">
                            Bestseller
                        </span>
                    )}

                    {isLimitedEdition && (
                        <span className="px-2.5 py-1 text-[10px] font-inter font-semibold tracking-wider uppercase rounded-sm text-white bg-purple-600">
                            Limited
                        </span>
                    )}

                    {isSale && (
                        <span className="px-2.5 py-1 text-[10px] font-inter font-semibold tracking-wider uppercase rounded-sm text-white bg-red-600">
                            Sale
                        </span>
                    )}

                    {discountPercentage && discountPercentage > 0 && !isOutOfStock && (
                        <span className="px-2.5 py-1 text-[10px] font-inter font-semibold tracking-wider uppercase rounded-sm text-emerald-700 bg-white border border-emerald-200">
                            -{discountPercentage}%
                        </span>
                    )}

                    {isOutOfStock && (
                        <span className="px-2.5 py-1 text-[10px] font-inter font-semibold tracking-wider uppercase rounded-sm text-white bg-gray-700">
                            Sold Out
                        </span>
                    )}
                </div>

                {/* Wishlist */}
                <button
                    onClick={handleWishlistClick}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors duration-200 z-10"
                >
                    <svg
                        className={`w-[18px] h-[18px] transition-colors duration-200 ${isWishlisted
                            ? 'text-red-500 fill-current'
                            : 'text-gray-700 hover:text-red-500'
                            }`}
                        viewBox="0 0 24 24"
                        fill={isWishlisted ? 'currentColor' : 'none'}
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                </button>

                {/* Out of Stock Stamp */}
                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="border border-gray-900 bg-white/80 backdrop-blur-[2px] px-5 py-2">
                            <span className="text-[11px] font-inter font-bold tracking-[0.3em] uppercase text-gray-900">
                                Sold Out
                            </span>
                        </div>
                    </div>
                )}

                {/* Image dots — hidden on hover so they don't collide with Quick Add */}
                {allImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 opacity-90 group-hover:opacity-0 transition-opacity duration-300">
                        {allImages.slice(0, 4).map((_, index) => (
                            <span
                                key={index}
                                className={`w-1.5 h-1.5 rounded-full ${currentImageIndex === index
                                    ? 'bg-white'
                                    : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Slide-up Action */}
                {isOutOfStock ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toast.success("We'll notify you when it's back");
                        }}
                        className="absolute left-0 right-0 bottom-0 bg-white border-t border-gray-200 text-gray-900 py-3 text-xs font-inter font-semibold tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hover:bg-gray-900 hover:text-white"
                    >
                        Notify When Back
                    </button>
                ) : (
                    <button
                        onClick={handleAddToCart}
                        className="absolute left-0 right-0 bottom-0 bg-gray-900 text-white py-3 text-xs font-inter font-semibold tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hover:bg-emerald-600"
                    >
                        + Quick Add
                    </button>
                )}
            </div>

            {/* Product Information */}
            <div className="p-4 space-y-3">
                {/* Brand */}
                <div className="flex items-center justify-between">
                    <p className="text-[11px] font-inter font-semibold text-gray-500 uppercase tracking-[0.15em]">
                        {brand}
                    </p>
                    {freeShipping && (
                        <span className="text-[10px] font-inter font-medium text-emerald-700 uppercase tracking-wider">
                            Free Shipping
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-inter font-medium text-gray-900 line-clamp-1 leading-snug">
                    {title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className={`w-3.5 h-3.5 ${i < Math.floor(rating)
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
                        {rating.toFixed(1)} ({reviewCount.toLocaleString()})
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                    <span className="text-base font-inter font-semibold text-gray-900">
                        ₹{displayPrice.toLocaleString()}
                    </span>
                    {discountedPrice && (
                        <>
                            <span className="text-xs font-inter text-gray-400 line-through">
                                ₹{originalPrice.toLocaleString()}
                            </span>
                            <span className="text-xs font-inter font-semibold text-emerald-600">
                                Save ₹{savings.toLocaleString()}
                            </span>
                        </>
                    )}
                </div>

                {/* Color Variants */}
                {colorVariants.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                        {colorVariants.slice(0, 5).map((color, index) => (
                            <div
                                key={index}
                                className="w-4 h-4 rounded-full border border-gray-200 hover:ring-2 hover:ring-gray-900 hover:ring-offset-1 transition-all duration-200"
                                style={{ backgroundColor: color }}
                                title={`Color variant ${index + 1}`}
                            />
                        ))}
                        {colorVariants.length > 5 && (
                            <span className="text-[10px] font-inter text-gray-500 ml-1">
                                +{colorVariants.length - 5}
                            </span>
                        )}
                    </div>
                )}

                {/* Size Guide Link (only if sizes provided) */}
                {sizeVariants.length > 0 && (
                    <button
                        onClick={handleSizeGuide}
                        className="text-xs font-inter text-gray-500 hover:text-gray-900 transition-colors underline-offset-2 hover:underline"
                    >
                        Size guide
                    </button>
                )}
            </div>

            {/* Size Guide Modal */}
            {showSizeGuide && (
                <div className="absolute inset-0 bg-white/98 backdrop-blur-md z-20 p-6 rounded-2xl">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-inter font-semibold tracking-wider uppercase text-gray-900">
                                Size Guide
                            </h4>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSizeGuide(false);
                                }}
                                aria-label="Close size guide"
                                className="w-7 h-7 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
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
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {sizeVariants.map((size) => (
                                <button
                                    key={size}
                                    onClick={(e) => e.stopPropagation()}
                                    className="py-2 text-xs font-inter font-semibold border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white rounded-md transition-colors duration-200"
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCard;