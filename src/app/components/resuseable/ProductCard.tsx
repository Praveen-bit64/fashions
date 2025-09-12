'use client';
import { useState } from "react";
import Icons from "./Icons";

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
    isWishlisted?: boolean;
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
    isWishlisted = false,
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
    const [isHovered, setIsHovered] = useState(false);
    const [showSizeGuide, setShowSizeGuide] = useState(false);

    const allImages = [image, ...images];
    const displayPrice = discountedPrice || originalPrice;
    const savings = discountedPrice ? originalPrice - discountedPrice : 0;

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onWishlistToggle?.(id);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
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

    return (
        <div
            className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer transform hover:-translate-y-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleProductClick}
            style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            }}
        >
            {/* Product Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
                {/* Main Product Image */}
                <div className="relative w-full h-full">
                    <img
                        src={allImages[currentImageIndex]}
                        alt={title}
                        className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-110 group-hover:rotate-1"
                    />

                    {/* Elegant Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                </div>

                {/* Premium Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {isNewArrival && (
                        <span className="px-3 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-md text-emerald-900 bg-emerald-100 border border-emerald-200 shadow-sm">
                            ✨ New Arrival
                        </span>
                    )}

                    {isBestSeller && (
                        <span className="px-3 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-md text-amber-900 bg-amber-100 border border-amber-200 shadow-sm">
                            👑 Bestseller
                        </span>
                    )}

                    {isLimitedEdition && (
                        <span className="px-3 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-md text-purple-900 bg-purple-100 border border-purple-200 shadow-sm">
                            💎 Limited Edition
                        </span>
                    )}

                    {isSale && (
                        <span className="px-3 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-md text-red-900 bg-red-100 border border-red-200 shadow-sm">
                            🔥 Sale
                        </span>
                    )}

                    {discountPercentage && discountPercentage > 0 && (
                        <span className="px-3 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-md text-teal-900 bg-teal-100 border border-teal-200 shadow-sm">
                            {discountPercentage}% Off
                        </span>
                    )}
                </div>


                {/* Premium Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-3">
                    {/* Wishlist Button */}
                    <button
                        onClick={handleWishlistClick}
                        className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 transition-all duration-300 border border-white/20"
                    >
                        <svg
                            className={`w-5 h-5 transition-all duration-500 ${isWishlisted
                                ? "text-red-500 fill-current scale-110 animate-pulse"
                                : "text-gray-600 hover:text-red-500"
                                }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                    </button>

                    {/* Quick View Button */}
                    <button
                        onClick={handleQuickView}
                        className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 transition-all duration-300 border border-white/20 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                </div>

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 text-center shadow-2xl border border-white/20">
                            <div className="w-12 h-12 mx-auto mb-3 text-gray-400">
                                <Icons name="hourglassEmpty" size={40} color="gray" />
                            </div>
                            <span className="text-sm font-inter font-bold text-gray-900">
                                OUT OF STOCK
                            </span>
                        </div>
                    </div>
                )}

                {/* Elegant Image Navigation */}
                {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {allImages.slice(0, 4).map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex(index);
                                }}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${currentImageIndex === index
                                    ? "bg-white scale-150 shadow-lg"
                                    : "bg-white/60 hover:bg-white/80 hover:scale-125"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Premium Quick Actions Panel */}
                {isHovered && !isOutOfStock && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/20">
                            <div className="flex gap-2">
                                {sizeVariants.slice(0, 3).map((size) => (
                                    <button
                                        key={size}
                                        className="w-7 h-7 text-xs font-inter font-bold text-gray-700 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-900 hover:to-black hover:text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                                {sizeVariants.length > 3 && (
                                    <button className="w-7 h-7 text-xs font-inter font-bold text-gray-700 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-900 hover:to-black hover:text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md">
                                        +{sizeVariants.length - 3}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Product Information */}
            <div className="p-5 space-y-4">
                {/* Brand with Premium Styling */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        <p className="text-xs font-inter font-bold text-gray-600 uppercase tracking-widest">
                            {brand}
                        </p>
                    </div>
                    {freeShipping && (
                        <span className="text-xs font-inter font-bold text-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-1.5 rounded-full border border-emerald-200">
                            🚚 Free Shipping
                        </span>
                    )}
                </div>

                {/* Product Title with Enhanced Typography */}
                <h3 className="text-sm font-inter font-semibold text-gray-900 line-clamp-2 leading-relaxed hover:text-gray-700 transition-colors">
                    {title}
                </h3>

                {/* Premium Rating Display */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-4 h-4 transition-all duration-300 ${i < Math.floor(rating)
                                        ? "text-yellow-400 drop-shadow-sm"
                                        : "text-gray-200"
                                        }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-sm font-inter font-bold text-gray-800">
                            {rating.toFixed(1)}
                        </span>
                    </div>
                    <span className="text-xs font-inter text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        {reviewCount.toLocaleString()} reviews
                    </span>
                </div>

                {/* Premium Price Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-inter font-black text-gray-900">
                            ₹{displayPrice.toLocaleString()}
                        </span>
                        {discountedPrice && (
                            <>
                                <span className="text-sm font-inter text-gray-500 line-through">
                                    ₹{originalPrice.toLocaleString()}
                                </span>
                                <span className="text-xs font-inter font-bold text-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-1 rounded-full border border-emerald-200">
                                    Save ₹{savings.toLocaleString()}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Delivery Info with Icon */}
                    <div className="flex items-center gap-2 text-xs font-inter text-gray-600 bg-gray-50 rounded-full px-3 py-1.5 w-fit">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Delivers in {deliveryTime}</span>
                    </div>
                </div>

                {/* Color Variants with Enhanced Styling */}
                {colorVariants.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-inter text-gray-500 font-medium">Colors:</span>
                        <div className="flex gap-1.5">
                            {colorVariants.slice(0, 5).map((color, index) => (
                                <div
                                    key={index}
                                    className="w-5 h-5 rounded-full border-2 border-white shadow-md hover:scale-125 transition-transform duration-200"
                                    style={{ backgroundColor: color }}
                                    title={`Color variant ${index + 1}`}
                                />
                            ))}
                            {colorVariants.length > 5 && (
                                <span className="text-xs font-inter text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    +{colorVariants.length - 5}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Premium Action Buttons - Now Always Visible */}
                <div className="space-y-3 pt-3">
                    {/* Add to Cart Button - Always Visible */}
                    {!isOutOfStock && (
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-3.5 rounded-xl text-sm font-inter font-black hover:from-gray-800 hover:via-gray-900 hover:to-black transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 border border-gray-800"
                            style={{
                                background: 'linear-gradient(135deg, #1f2937 0%, #000000 50%, #1f2937 100%)',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                            }}
                        >
                            <Icons name="cart" size={20} color="white" className="mr-2 inline-block " /> ADD TO BAG
                        </button>
                    )}

                    {/* Size Guide Button */}
                    {sizeVariants.length > 0 && (
                        <button
                            onClick={handleSizeGuide}
                            className="w-full text-xs font-inter text-gray-600 hover:text-gray-900 transition-colors py-2 hover:bg-gray-50 rounded-lg"
                        >
                            📏 Size Guide
                        </button>
                    )}
                </div>
            </div>

            {/* Premium Size Guide Modal */}
            {showSizeGuide && (
                <div className="absolute inset-0 bg-white/98 backdrop-blur-md z-10 p-6 rounded-2xl border border-gray-100 shadow-2xl">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-inter font-bold text-gray-900">Size Guide</h4>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSizeGuide(false);
                                }}
                                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {sizeVariants.map((size) => (
                                <button
                                    key={size}
                                    className="p-3 text-sm font-inter font-semibold border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white rounded-xl transition-all duration-300"
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