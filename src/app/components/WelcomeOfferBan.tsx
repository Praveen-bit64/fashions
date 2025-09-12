"use client";
import { useState, useEffect } from "react";

const WelcomeOfferBan = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [promoCode, setPromoCode] = useState("WELCOME60");

    useEffect(() => {
        const hasSeenOffer = localStorage.getItem("welcomeOfferDismissed");
        if (!hasSeenOffer) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("welcomeOfferDismissed", "true");
    };

    const handleClaimOffer = () => {
        navigator.clipboard.writeText(promoCode);
        console.log("Offer claimed with code:", promoCode);
        handleDismiss();
    };

    const copyPromoCode = () => {
        navigator.clipboard.writeText(promoCode);
        console.log("Promo code copied to clipboard!");
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
            <div
                className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden bg-neutral-900/90 border border-white/10"
                style={{
                    backgroundImage: "url(/fashion-offer-ban.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow cursor-pointer z-10"
                    aria-label="Close offer"
                >
                    <svg
                        className="w-4 h-4 text-neutral-700 cursor-pointer"
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

                {/* Content */}
                <div className="relative flex items-center justify-center px-8 py-12 bg-gradient-to-r from-black/70 via-black/20 to-black/30">
                    <div className="max-w-lg text-center">
                        {/* Welcome Badge */}
                        <div className="inline-block px-4 py-1.5 bg-white/10 text-white text-xs font-medium uppercase tracking-wider rounded-full mb-6">
                            Welcome Offer
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                            Enjoy Up To
                        </h1>
                        <div className="text-6xl font-extrabold text-white mb-6">
                            60% OFF
                        </div>

                        {/* Description */}
                        <p className="text-white/80 mb-8 text-base leading-relaxed">
                            On your first purchase. A limited-time exclusive for new
                            customers.
                        </p>

                        {/* Promo Code */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <span className="bg-white text-neutral-900 px-5 py-2 rounded-md font-semibold tracking-wide text-lg shadow">
                                {promoCode}
                            </span>
                            <button
                                onClick={copyPromoCode}
                                className="p-2 rounded-md border border-white/30 hover:bg-white/10 transition-colors"
                            >
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 
                    12h8a2 2 0 002-2v-8a2 2 0 
                    00-2-2h-8a2 2 0 00-2 2v8a2 
                    2 0 002 2z"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleClaimOffer}
                                className="flex-1 bg-white text-neutral-900 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors shadow"
                            >
                                Claim Offer
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="flex-1 bg-transparent text-white px-6 py-3 rounded-lg font-medium border border-white/30 hover:bg-white/10 transition-colors"
                            >
                                Maybe Later
                            </button>
                        </div>

                        {/* Terms */}
                        <p className="text-xs text-white/60 mt-6">
                            *Valid only for first-time customers. Terms & conditions apply.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeOfferBan;
