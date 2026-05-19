"use client";
import Icons from "../ui/Icons";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
    removeFromWishlist,
    clearWishlist,
    type WishlistItem,
} from "@/redux/slices/wishlistSlice";
import { addToCart } from "@/redux/slices/cartSlice";

const Whishlist = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const dispatch = useAppDispatch();
    const wishlistItems = useAppSelector((state) => state.wishlist.items);

    const handleRemove = (id: string) => {
        dispatch(removeFromWishlist(id));
        toast.success("Removed from wishlist");
    };

    const handleAddToCart = (item: WishlistItem) => {
        dispatch(
            addToCart({
                id: item.id,
                title: item.title,
                brand: item.brand,
                image: item.image,
                originalPrice: item.originalPrice,
                discountedPrice: item.discountedPrice,
                size: "M",
                color: "Default",
                quantity: 1,
            })
        );
        toast.success("Added to bag");
    };

    const handleMoveAllToCart = () => {
        const inStock = wishlistItems.filter((i) => i.inStock);
        inStock.forEach((item) => {
            dispatch(
                addToCart({
                    id: item.id,
                    title: item.title,
                    brand: item.brand,
                    image: item.image,
                    originalPrice: item.originalPrice,
                    discountedPrice: item.discountedPrice,
                    size: "M",
                    color: "Default",
                    quantity: 1,
                })
            );
        });
        if (inStock.length > 0) {
            toast.success(`${inStock.length} item${inStock.length > 1 ? "s" : ""} added to bag`);
        }
    };

    const handleClear = () => {
        dispatch(clearWishlist());
        toast.success("Wishlist cleared");
    };

    const inStockCount = wishlistItems.filter((i) => i.inStock).length;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[999] flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-rose-50 rounded-full flex items-center justify-center">
                            <Icons name="heart" size={18} color="#e11d48" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">My Wishlist</h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {wishlistItems.length > 0 && (
                            <button
                                onClick={handleClear}
                                className="text-[11px] font-inter font-medium tracking-wider uppercase text-gray-500 hover:text-red-600 px-2 py-1 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <Icons name="close" size={20} color="#111" />
                        </button>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">
                    {wishlistItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center">
                                <Icons name="heart" size={36} color="#fda4af" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-800">Your wishlist is empty</p>
                                <p className="text-sm text-gray-400 mt-1">Save items you love here</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 flex flex-col gap-3">
                            {wishlistItems.map((item) => {
                                const discount = item.discountedPrice
                                    ? Math.round(
                                        ((item.originalPrice - item.discountedPrice) /
                                            item.originalPrice) *
                                        100
                                    )
                                    : 0;

                                return (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:border-rose-100 hover:shadow-sm transition-all duration-200"
                                    >
                                        {/* Image */}
                                        <div className="relative w-24 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className={`w-full h-full object-cover transition-transform duration-300 ${item.inStock ? "hover:scale-105" : "opacity-60"
                                                    }`}
                                            />
                                            {discount > 0 && item.inStock && (
                                                <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                                                    -{discount}%
                                                </span>
                                            )}
                                            {!item.inStock && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                                                    <span className="text-white text-[10px] font-bold tracking-wide">
                                                        OUT OF STOCK
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between min-w-0">
                                            <div>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(item.id)}
                                                        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                        title="Remove from wishlist"
                                                    >
                                                        <Icons name="heart" size={15} color="#f43f5e" />
                                                    </button>
                                                </div>

                                                {item.rating && (
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <span className="text-xs text-amber-500 font-semibold">
                                                            ★ {item.rating}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Price & Action */}
                                            <div className="mt-3 flex items-center justify-between">
                                                <div>
                                                    <span className="text-base font-bold text-gray-900">
                                                        ₹{(item.discountedPrice || item.originalPrice).toLocaleString()}
                                                    </span>
                                                    {item.discountedPrice && (
                                                        <span className="text-xs line-through text-gray-400 ml-1.5">
                                                            ₹{item.originalPrice.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    disabled={!item.inStock}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${item.inStock
                                                        ? "bg-gray-900 text-white hover:bg-gray-700 active:scale-95"
                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        }`}
                                                >
                                                    <Icons
                                                        name="cart"
                                                        size={13}
                                                        color={item.inStock ? "white" : "#9ca3af"}
                                                    />
                                                    {item.inStock ? "Add to Bag" : "Unavailable"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {wishlistItems.length > 0 && (
                    <div className="border-t border-gray-100 px-5 pt-4 pb-6 bg-white space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{inStockCount} of {wishlistItems.length} items available</span>
                            {inStockCount > 0 && (
                                <span className="text-emerald-600 font-medium">Ready to buy</span>
                            )}
                        </div>

                        <button
                            onClick={handleMoveAllToCart}
                            disabled={inStockCount === 0}
                            className={`w-full font-semibold py-3.5 rounded-2xl transition-all text-sm tracking-wide flex items-center justify-center gap-2 ${inStockCount > 0
                                ? "bg-gray-900 hover:bg-gray-700 active:scale-[0.98] text-white"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            <Icons name="cart" size={16} color={inStockCount > 0 ? "white" : "#9ca3af"} />
                            Move All to Bag
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Whishlist;
