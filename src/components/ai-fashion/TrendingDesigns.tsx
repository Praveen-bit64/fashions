'use client';

import { motion } from 'framer-motion';
import { TRENDING_DESIGNS } from './data/options';
import { useCustomizer } from './context/CustomizerContext';

const TrendingDesigns = () => {
    const { applyPreset } = useCustomizer();

    return (
        <div className="space-y-4">
            <div>
                <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-1.5">
                    Inspiration
                </p>
                <h3 className="font-delius-swash-caps text-xl text-gray-900 leading-tight">
                    Trending Designs
                </h3>
                <p className="text-xs font-inter text-gray-500 mt-1.5 leading-relaxed">
                    Start from a preset and refine to taste.
                </p>
            </div>

            <ul className="space-y-3">
                {TRENDING_DESIGNS.map((design, idx) => (
                    <motion.li
                        key={design.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.06 }}
                    >
                        <button
                            onClick={() => applyPreset(design)}
                            className="group w-full flex gap-3 p-2 rounded-xl border border-gray-100 hover:border-gray-900 hover:bg-gray-50/60 transition-colors text-left"
                        >
                            <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                                <img
                                    src={design.image}
                                    alt={design.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-sm font-inter font-semibold text-gray-900 truncate">
                                    {design.name}
                                </p>
                                <p className="text-[11px] font-inter text-gray-500 truncate">
                                    {design.description}
                                </p>
                                <div className="mt-1.5 flex items-center gap-1.5">
                                    <span className="text-[9px] font-inter font-semibold tracking-wider uppercase text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                                        {design.config.material}
                                    </span>
                                    <span className="text-[9px] font-inter font-semibold tracking-wider uppercase text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                                        {design.config.color}
                                    </span>
                                </div>
                            </div>
                            <svg
                                className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-900 self-center transition-colors"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
};

export default TrendingDesigns;
