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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex justify-center items-center p-2 sm:p-4 top-20">
            <div
                className="relative w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden bg-neutral-900/90 border border-white/10"
                style={{
                    backgroundImage: "url(/fashion-offer-ban.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow cursor-pointer z-10"
                    aria-label="Close offer"
                >
                    <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-700 cursor-pointer"
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
                <div className="relative flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12 bg-gradient-to-r from-black/70 via-black/20 to-black/30">
                    <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg text-center">
                        {/* Welcome Badge */}
                        <div className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-white/10 text-white text-xs sm:text-sm font-medium uppercase tracking-wider rounded-full mb-4 sm:mb-6">
                            Welcome Offer
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 sm:mb-2 tracking-tight">
                            Enjoy Up To
                        </h1>
                        <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-4 sm:mb-6">
                            60% OFF
                        </div>

                        {/* Description */}
                        <p className="text-white/80 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed px-2">
                            On your first purchase. A limited-time exclusive for new
                            customers.
                        </p>

                        {/* Promo Code */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                            <span className="bg-white text-neutral-900 px-4 py-2 sm:px-5 sm:py-2 rounded-md font-semibold tracking-wide text-base sm:text-lg shadow">
                                {promoCode}
                            </span>
                            <button
                                onClick={copyPromoCode}
                                className="p-2 rounded-md border border-white/30 hover:bg-white/10 transition-colors"
                            >
                                <svg
                                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                                onClick={handleClaimOffer}
                                className="flex-1 bg-white text-neutral-900 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors shadow text-sm sm:text-base"
                            >
                                Claim Offer
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="flex-1 bg-transparent text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium border border-white/30 hover:bg-white/10 transition-colors text-sm sm:text-base"
                            >
                                Maybe Later
                            </button>
                        </div>

                        {/* Terms */}
                        <p className="text-xs sm:text-sm text-white/60 mt-4 sm:mt-6 px-2">
                            *Valid only for first-time customers. Terms & conditions apply.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeOfferBan;
