"use client";
import { useRouter } from "next/navigation";
import Icons from "../ui/Icons";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
    updateQuantity,
    removeFromCart,
    clearCart,
    lineKey,
} from "@/redux/slices/cartSlice";

const Cart = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector((state) => state.cart.items);
    const user = useAppSelector((state) => state.auth.user);

    const handleCheckout = () => {
        onClose();
        router.push("/checkout");
    };

    const handleUpdateQuantity = (key: string, newQuantity: number) => {
        dispatch(updateQuantity({ key, quantity: newQuantity }));
    };

    const handleRemoveItem = (key: string) => {
        dispatch(removeFromCart(key));
        toast.success("Removed from bag");
    };

    const handleClear = () => {
        dispatch(clearCart());
        toast.success("Bag cleared");
    };

    const subtotal = cartItems.reduce(
        (sum, item) =>
            sum + (item.discountedPrice || item.originalPrice) * item.quantity,
        0
    );

    const totalSavings = cartItems.reduce((sum, item) => {
        if (!item.discountedPrice) return sum;
        return sum + (item.originalPrice - item.discountedPrice) * item.quantity;
    }, 0);

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                            {user ? `${user.name}'s Bag` : "Shopping Bag"}
                        </h2>
                        {itemCount > 0 && (
                            <span className="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                {itemCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {cartItems.length > 0 && (
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
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                <Icons name="cart" size={36} color="#9ca3af" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-800">Your bag is empty</p>
                                <p className="text-sm text-gray-400 mt-1">Add items to get started</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 flex flex-col gap-3">
                            {cartItems.map((item) => {
                                const key = lineKey(item);
                                const discount = item.discountedPrice
                                    ? Math.round(
                                        ((item.originalPrice - item.discountedPrice) /
                                            item.originalPrice) *
                                        100
                                    )
                                    : 0;

                                return (
                                    <div
                                        key={key}
                                        className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                                    >
                                        {/* Image */}
                                        <div className="relative w-24 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {discount > 0 && (
                                                <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                                                    -{discount}%
                                                </span>
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
                                                        onClick={() => handleRemoveItem(key)}
                                                        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                    >
                                                        <Icons name="trash" size={15} color="#f43f5e" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                                                        {item.size}
                                                    </span>
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                                                        {item.color}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Price & Quantity */}
                                            <div className="flex items-center justify-between mt-3">
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

                                                {/* Quantity stepper */}
                                                <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(key, item.quantity - 1)}
                                                        className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Icons name="minus" size={14} color="#111" />
                                                    </button>
                                                    <span className="text-sm font-semibold w-6 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(key, item.quantity + 1)}
                                                        className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Icons name="plus" size={14} color="#111" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="border-t border-gray-100 px-5 pt-4 pb-6 bg-white space-y-3">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal ({itemCount} items)</span>
                                <span className="font-medium text-gray-800">
                                    ₹{(subtotal + totalSavings).toLocaleString()}
                                </span>
                            </div>
                            {totalSavings > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-emerald-600">Discount</span>
                                    <span className="font-medium text-emerald-600">
                                        -₹{totalSavings.toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-500">
                                <span>Delivery</span>
                                <span className="font-medium text-emerald-600">Free</span>
                            </div>
                            <div className="h-px bg-gray-100 my-1" />
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="text-xl font-bold text-gray-900">
                                    ₹{subtotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {totalSavings > 0 && (
                            <div className="bg-emerald-50 text-emerald-700 text-xs font-medium text-center py-2 rounded-xl">
                                You're saving ₹{totalSavings.toLocaleString()} on this order
                            </div>
                        )}

                        <button
                            onClick={handleCheckout}
                            className="w-full bg-gray-900 hover:bg-gray-700 active:scale-[0.98] text-white font-semibold py-3.5 rounded-2xl transition-all text-sm tracking-wide"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Cart;
