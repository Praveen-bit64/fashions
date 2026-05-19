'use client';

export type VariantInput = {
    id?: string;
    sku: string;
    size: string;
    color: string;
    priceDelta: number;
    stockQty: number;
};

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const VariantEditor = ({
    productSlug,
    variants,
    onChange,
}: {
    productSlug: string;
    variants: VariantInput[];
    onChange: (next: VariantInput[]) => void;
}) => {
    const addRow = () => {
        onChange([
            ...variants,
            {
                sku: '',
                size: '',
                color: '',
                priceDelta: 0,
                stockQty: 0,
            },
        ]);
    };

    const removeRow = (i: number) => {
        const next = [...variants];
        next.splice(i, 1);
        onChange(next);
    };

    const updateRow = (i: number, patch: Partial<VariantInput>) => {
        const next = [...variants];
        next[i] = { ...next[i], ...patch };
        onChange(next);
    };

    const generateSku = (i: number) => {
        const v = variants[i];
        const prefix =
            (productSlug || 'PRD').toUpperCase().replace(/-/g, '').slice(0, 6) ||
            'PRD';
        const size = (v.size || 'X').toUpperCase().slice(0, 3);
        const color = (v.color || 'XXX').toUpperCase().slice(0, 3);
        const id = String(i + 1).padStart(2, '0');
        updateRow(i, { sku: `${prefix}-${size}-${color}-${id}` });
    };

    const seedCommonSizes = () => {
        if (variants.length > 0) return;
        const seeded: VariantInput[] = COMMON_SIZES.map((s, i) => ({
            sku: '',
            size: s,
            color: 'Default',
            priceDelta: 0,
            stockQty: 0,
        }));
        onChange(seeded);
        // Pre-fill SKUs after a tick so they reference the new slug
        setTimeout(() => {
            const updated = seeded.map((v, i) => {
                const prefix =
                    (productSlug || 'PRD')
                        .toUpperCase()
                        .replace(/-/g, '')
                        .slice(0, 6) || 'PRD';
                return {
                    ...v,
                    sku: `${prefix}-${v.size}-${v.color
                        .toUpperCase()
                        .slice(0, 3)}-${String(i + 1).padStart(2, '0')}`,
                };
            });
            onChange(updated);
        }, 0);
    };

    return (
        <div>
            {variants.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center bg-gray-50/60">
                    <p className="text-sm font-inter text-gray-600 mb-3">
                        No variants yet. Add sizes/colors that customers can pick from.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={addRow}
                            className="px-4 py-2 text-[11px] font-inter font-semibold tracking-widest uppercase border border-gray-200 rounded-md hover:border-gray-900 transition-colors"
                        >
                            + Add Variant
                        </button>
                        <button
                            type="button"
                            onClick={seedCommonSizes}
                            className="px-4 py-2 text-[11px] font-inter font-semibold tracking-widest uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors"
                        >
                            Add XS – XXL
                        </button>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {['Size', 'Color', 'SKU', 'Price ±', 'Stock', ''].map(
                                    (label) => (
                                        <th
                                            key={label}
                                            className="px-3 py-2 text-left text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-500"
                                        >
                                            {label}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {variants.map((v, i) => (
                                <tr key={i} className="border-b border-gray-50">
                                    <td className="px-3 py-2">
                                        <input
                                            value={v.size}
                                            onChange={(e) => updateRow(i, { size: e.target.value })}
                                            placeholder="M"
                                            className="w-20 px-2 py-1.5 text-sm font-inter border border-gray-200 rounded-md focus:outline-none focus:border-gray-900"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            value={v.color}
                                            onChange={(e) =>
                                                updateRow(i, { color: e.target.value })
                                            }
                                            placeholder="Olive"
                                            className="w-28 px-2 py-1.5 text-sm font-inter border border-gray-200 rounded-md focus:outline-none focus:border-gray-900"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-1">
                                            <input
                                                value={v.sku}
                                                onChange={(e) =>
                                                    updateRow(i, { sku: e.target.value })
                                                }
                                                placeholder="SKU-M-OL-01"
                                                className="w-44 px-2 py-1.5 text-xs font-mono border border-gray-200 rounded-md focus:outline-none focus:border-gray-900"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => generateSku(i)}
                                                title="Auto-generate SKU"
                                                className="text-[10px] font-inter text-gray-500 hover:text-gray-900 px-1.5"
                                            >
                                                Auto
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            value={v.priceDelta}
                                            onChange={(e) =>
                                                updateRow(i, {
                                                    priceDelta: Number(e.target.value),
                                                })
                                            }
                                            className="w-24 px-2 py-1.5 text-sm font-inter border border-gray-200 rounded-md focus:outline-none focus:border-gray-900"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            value={v.stockQty}
                                            onChange={(e) =>
                                                updateRow(i, {
                                                    stockQty: Number(e.target.value),
                                                })
                                            }
                                            min={0}
                                            className="w-20 px-2 py-1.5 text-sm font-inter border border-gray-200 rounded-md focus:outline-none focus:border-gray-900"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            type="button"
                                            onClick={() => removeRow(i)}
                                            aria-label="Remove variant"
                                            className="w-7 h-7 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                                        >
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
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                                                />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        type="button"
                        onClick={addRow}
                        className="mt-3 px-4 py-2 text-[11px] font-inter font-semibold tracking-widest uppercase border border-gray-200 rounded-md hover:border-gray-900 transition-colors"
                    >
                        + Add Variant
                    </button>
                </div>
            )}
        </div>
    );
};

export default VariantEditor;
