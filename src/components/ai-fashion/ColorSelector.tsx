'use client';

import { COLORS } from './data/options';
import { useCustomizer } from './context/CustomizerContext';

const isLightColor = (hex: string) => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 > 200;
};

const ColorSelector = () => {
    const { color, setColor } = useCustomizer();
    const selected = COLORS.find((c) => c.name === color);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-900">
                    Color
                </h4>
                <span className="text-xs font-inter text-gray-500">
                    {selected?.name}
                    {selected?.premium ? (
                        <span className="text-emerald-600 ml-1.5 font-semibold">
                            +₹{selected.premium}
                        </span>
                    ) : null}
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => {
                    const active = color === c.name;
                    const light = isLightColor(c.hex);
                    return (
                        <button
                            key={c.name}
                            onClick={() => setColor(c.name)}
                            title={c.name}
                            aria-label={c.name}
                            aria-pressed={active}
                            style={{ backgroundColor: c.hex }}
                            className={`relative w-9 h-9 rounded-full transition-all duration-200 ${light ? 'border border-gray-200' : ''
                                } ${active
                                    ? 'ring-2 ring-gray-900 ring-offset-2 scale-110'
                                    : 'hover:ring-1 hover:ring-gray-400 hover:ring-offset-1'
                                }`}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ColorSelector;
