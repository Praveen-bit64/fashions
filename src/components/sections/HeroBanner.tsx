'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' as const },
    },
};

const stats = [
    { value: '500+', label: 'Brands' },
    { value: '50K+', label: 'Pieces' },
    { value: 'Free', label: 'Shipping' },
];

type HeroBannerProps = {
    eyebrow?: string;
    titleLine1?: string;
    titleLine2?: string;
    subtitle?: string;
    backgroundImage?: string;
    primaryCtaLabel?: string;
    primaryCtaHref?: string;
    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;
};

const DEFAULTS: Required<HeroBannerProps> = {
    eyebrow: 'The Spring Edit',
    titleLine1: 'Discover the latest',
    titleLine2: 'fashion trends.',
    subtitle:
        "Upgrade your wardrobe with this season's exclusive new arrivals — elegant, modern, and designed for the way you live.",
    backgroundImage: '/hero-bg.png',
    primaryCtaLabel: 'Shop Now',
    primaryCtaHref: '/products',
    secondaryCtaLabel: 'Explore Collections',
    secondaryCtaHref: '/products',
};

const HeroBanner = (props: HeroBannerProps = {}) => {
    const router = useRouter();
    const content = { ...DEFAULTS, ...props };

    return (
        <section className="relative w-full min-h-[620px] h-[88vh] max-h-[820px] overflow-hidden bg-gray-950">
            {/* Background */}
            <img
                src={content.backgroundImage}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover scale-105"
            />

            {/* Editorial gradient — dark left, fading right */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12">
                <motion.div
                    className="max-w-2xl"
                    variants={container}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Eyebrow */}
                    <motion.div variants={item} className="flex items-center gap-3">
                        <span className="h-px w-10 bg-emerald-400/70" />
                        <span className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-300">
                            {content.eyebrow}
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={item}
                        className="mt-6 font-inter text-white leading-[1.02]"
                    >
                        <span className="block text-5xl md:text-6xl lg:text-[80px] font-light tracking-[-0.01em] text-white/90">
                            {content.titleLine1}
                        </span>
                        <span className="block text-5xl md:text-6xl lg:text-[80px] font-bold tracking-[-0.025em] mt-1">
                            {content.titleLine2}
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        variants={item}
                        className="mt-6 text-base md:text-lg font-inter text-white/75 leading-relaxed max-w-lg"
                    >
                        {content.subtitle}
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={item}
                        className="mt-10 flex flex-col sm:flex-row gap-3"
                    >
                        <button
                            onClick={() => router.push(content.primaryCtaHref)}
                            className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-3.5 rounded-md text-[11px] font-inter font-semibold tracking-[0.3em] uppercase hover:bg-emerald-500 hover:text-white transition-colors"
                        >
                            {content.primaryCtaLabel}
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={() => router.push(content.secondaryCtaHref)}
                            className="inline-flex items-center justify-center bg-transparent border border-white/40 text-white px-8 py-3.5 rounded-md text-[11px] font-inter font-semibold tracking-[0.3em] uppercase hover:border-white hover:bg-white/10 transition-colors backdrop-blur-sm"
                        >
                            {content.secondaryCtaLabel}
                        </button>
                    </motion.div>

                    {/* Stats with hairline dividers */}
                    <motion.div
                        variants={item}
                        className="mt-14 flex items-center gap-6 lg:gap-10"
                    >
                        {stats.map((stat, i) => (
                            <div key={stat.label} className="flex items-center gap-6 lg:gap-10">
                                {i !== 0 && (
                                    <span className="h-10 w-px bg-white/20" aria-hidden />
                                )}
                                <div>
                                    <p className="font-delius-swash-caps text-3xl text-white leading-none">
                                        {stat.value}
                                    </p>
                                    <p className="text-[10px] font-inter font-medium text-white/55 mt-1.5 tracking-[0.3em] uppercase">
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
            >
                <span className="text-[9px] font-inter font-medium tracking-[0.4em] uppercase">
                    Scroll
                </span>
                <motion.span
                    className="block w-px h-8 bg-white/30 origin-top"
                    animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 1, 0.3] }}
                    transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: 'easeInOut',
                    }}
                />
            </motion.div>
        </section>
    );
};

export default HeroBanner;
