'use client';

import type { SimpleOption } from './data/options';

type Props = {
    label: string;
    options: SimpleOption[];
    value: string;
    onChange: (id: string) => void;
    columns?: 2 | 3 | 4;
};

const colMap = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
};

const OptionGrid = ({ label, options, value, onChange, columns = 3 }: Props) => {
    const active = options.find((o) => o.id === value);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-900">
                    {label}
                </h4>
                <span className="text-xs font-inter text-gray-500">
                    {active?.label}
                    {active?.premium ? (
                        <span className="text-emerald-600 ml-1.5 font-semibold">
                            +₹{active.premium}
                        </span>
                    ) : null}
                </span>
            </div>
            <div className={`grid ${colMap[columns]} gap-2`}>
                {options.map((o) => {
                    const isActive = o.id === value;
                    return (
                        <button
                            key={o.id}
                            onClick={() => onChange(o.id)}
                            aria-pressed={isActive}
                            className={`relative py-2.5 px-2 text-xs font-inter font-semibold rounded-md border transition-colors duration-150 ${isActive
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-900 border-gray-200 hover:border-gray-900'
                                }`}
                        >
                            {o.label}
                            {o.premium && o.premium > 0 ? (
                                <span
                                    className={`absolute top-0.5 right-1 text-[9px] font-semibold ${isActive ? 'text-white/80' : 'text-emerald-600'
                                        }`}
                                >
                                    +
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default OptionGrid;
