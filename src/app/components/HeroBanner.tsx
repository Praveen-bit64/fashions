'use client'
import { motion } from "framer-motion";

const HeroBanner = () => {
    return (
        <section className="relative w-full h-[600px]  overflow-hidden">
            {/* Background Image */}
            <img
                src="/hero-bg.jpg"
                alt="Hero Banner"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-start max-w-7xl mx-auto px-6 lg:px-12">
                <div className="max-w-2xl animate-fadeIn">
                    <motion.h1
                        initial={{ opacity: 0, y: 70 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-lg font-montez">
                        Discover the Latest Fashion Trends
                    </motion.h1>
                    <p className="mt-4 text-lg md:text-xl text-white/80 leading-relaxed font-delius-swash-caps">
                        Upgrade your wardrobe with our exclusive new arrivals.
                        Elegant, modern, and designed just for you.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-8 flex gap-4 lg:flex-row flex-col">
                        <a
                            href="/shop"
                            className="bg-white text-neutral-900 px-6 py-3 rounded-lg font-semibold shadow hover:bg-neutral-100 transition-colors"
                        >
                            Shop Now
                        </a>
                        <a
                            href="/collections"
                            className="bg-transparent border border-white/40 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
                        >
                            Explore Collections
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroBanner;
