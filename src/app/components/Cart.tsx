"use client";
import { useState } from "react";
import Icons from "./resuseable/Icons";

interface CartItem {
    id: string;
    title: string;
    brand: string;
    image: string;
    originalPrice: number;
    discountedPrice?: number;
    size: string;
    color: string;
    quantity: number;
    isWishlisted?: boolean;
}

const Cart = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: "1",
            title: "Premium Cotton T-Shirt",
            brand: "Fashion Brand",
            image: "/feature-prod-1.jpg",
            originalPrice: 2999,
            discountedPrice: 1999,
            size: "M",
            color: "Navy Blue",
            quantity: 2,
            isWishlisted: false,
        },
        {
            id: "2",
            title: "Designer Jeans",
            brand: "Style Co.",
            image: "/feature-prod-2.jpg",
            originalPrice: 4999,
            discountedPrice: 3499,
            size: "L",
            color: "Dark Blue",
            quantity: 1,
            isWishlisted: true,
        },
    ]);

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCartItems((items) =>
            items.map((item) =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const removeItem = (id: string) => {
        setCartItems((items) => items.filter((item) => item.id !== id));
    };

    const subtotal = cartItems.reduce((sum, item) => {
        const price = item.discountedPrice || item.originalPrice;
        return sum + price * item.quantity;
    }, 0);

    return (
        <div
            className={`fixed top-0 right-0 h-full w-full sm:w-[400px] lg:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 z-[999] ${isOpen ? "translate-x-0" : "translate-x-full"
                }`}
        >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                >
                    <Icons
                        name="close"
                        size={24}
                        color="black"
                        className="cursor-pointer"
                    />
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-col h-[calc(90%-150px)] overflow-y-auto p-4 gap-4">
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Icons name="cart" size={60} color="gray" />
                        <p className="mt-4 text-lg font-semibold text-gray-600">
                            Your cart is empty
                        </p>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex bg-gray-50 rounded-xl p-4 gap-4 hover:shadow-md transition"
                        >
                            {/* Image */}
                            <div className="relative w-24 h-28 rounded-md overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                                {item.discountedPrice && (
                                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-bold">
                                        {Math.round(
                                            ((item.originalPrice - item.discountedPrice) /
                                                item.originalPrice) *
                                            100
                                        )}
                                        % OFF
                                    </span>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-base font-bold">{item.title}</h3>
                                    <p className="text-sm text-gray-500">{item.brand}</p>
                                    <p className="text-sm text-gray-500">
                                        Size: {item.size} | {item.color}
                                    </p>
                                </div>

                                {/* Price & Quantity */}
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-gray-900">
                                            ₹{(item.discountedPrice || item.originalPrice).toLocaleString()}
                                        </span>
                                        {item.discountedPrice && (
                                            <span className="text-sm line-through text-gray-400">
                                                ₹{item.originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                                        >
                                            <Icons name="minus" size={14} color="black" />
                                        </button>
                                        <span className="px-2">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                                        >
                                            <Icons name="plus" size={14} color="black" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Icons name="trash" size={18} color="red" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
                <div className="border-t p-6 bg-white shadow-inner">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-xl font-bold">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 rounded-lg hover:shadow-xl transition">
                        Checkout
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cart;
