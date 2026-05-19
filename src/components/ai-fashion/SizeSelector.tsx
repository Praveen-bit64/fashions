'use client';

import { SIZES } from './data/options';
import { useCustomizer } from './context/CustomizerContext';

const SizeSelector = () => {
    const { size, setSize } = useCustomizer();
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-900">
                    Size
                </h4>
                <button className="text-[11px] font-inter text-gray-500 hover:text-gray-900 underline-offset-2 hover:underline transition-colors">
                    Size guide
                </button>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
                {SIZES.map((s) => {
                    const active = size === s.id;
                    return (
                        <button
                            key={s.id}
                            onClick={() => setSize(s.id)}
                            aria-pressed={active}
                            className={`py-2.5 text-xs font-inter font-semibold rounded-md border transition-colors duration-150 ${active
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-900 border-gray-200 hover:border-gray-900'
                                }`}
                        >
                            {s.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SizeSelector;
