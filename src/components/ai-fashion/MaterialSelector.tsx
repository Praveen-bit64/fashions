'use client';

import { MATERIALS } from './data/options';
import { useCustomizer } from './context/CustomizerContext';

const MaterialSelector = () => {
    const { material, setMaterial } = useCustomizer();

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-900">
                    Material
                </h4>
                <span className="text-xs font-inter text-gray-500">{material}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {MATERIALS.map((m) => {
                    const active = material === m.name;
                    return (
                        <button
                            key={m.name}
                            onClick={() => setMaterial(m.name)}
                            aria-pressed={active}
                            className={`group relative text-left p-3 border rounded-xl transition-all duration-200 ${active
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-200 hover:border-gray-900 bg-white text-gray-900'
                                }`}
                        >
                            <p className="text-xs font-inter font-semibold tracking-wider uppercase">
                                {m.name}
                            </p>
                            <p
                                className={`text-[10px] font-inter mt-0.5 leading-snug ${active ? 'text-white/70' : 'text-gray-500'
                                    }`}
                            >
                                {m.description}
                            </p>
                            {m.premium > 0 && (
                                <span
                                    className={`absolute top-2 right-2 text-[9px] font-inter font-semibold tracking-wider uppercase ${active ? 'text-white/80' : 'text-emerald-600'
                                        }`}
                                >
                                    +₹{m.premium}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MaterialSelector;
