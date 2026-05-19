'use client';

import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useCustomizer } from './context/CustomizerContext';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/slices/cartSlice';

const OrderSummary = ({ onAdded }: { onAdded?: () => void }) => {
    const {
        product,
        material,
        color,
        sleeve,
        neck,
        length,
        pattern,
        size,
        totalPremium,
        totalPrice,
    } = useCustomizer();

    const dispatch = useAppDispatch();

    const handleAddToBag = () => {
        dispatch(
            addToCart({
                id: `${product.id}-custom-${Date.now()}`,
                title: `${product.title} — Custom`,
                brand: product.brand,
                image: product.image,
                originalPrice: totalPrice,
                size,
                color,
                quantity: 1,
            })
        );
        toast.success('Custom design added to bag');
        onAdded?.();
    };

    const summary: Array<{ label: string; value: string }> = [
        { label: 'Material', value: material },
        { label: 'Color', value: color },
        { label: 'Sleeve', value: sleeve },
        { label: 'Neckline', value: neck },
        { label: 'Length', value: length },
        { label: 'Pattern', value: pattern },
        { label: 'Size', value: size },
    ];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                    Your Design
                </h3>
                <span className="text-[10px] font-inter font-semibold tracking-wider uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    Bespoke
                </span>
            </div>

            <dl className="space-y-2 mb-5">
                {summary.map((row) => (
                    <div
                        key={row.label}
                        className="flex items-center justify-between text-xs font-inter"
                    >
                        <dt className="text-gray-500 tracking-wider uppercase text-[10px]">
                            {row.label}
                        </dt>
                        <dd className="text-gray-900 font-medium capitalize">
                            {row.value.replace(/-/g, ' ')}
                        </dd>
                    </div>
                ))}
            </dl>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm font-inter">
                <div className="flex justify-between text-gray-500">
                    <span>Base price</span>
                    <span className="text-gray-900">
                        ₹{product.basePrice.toLocaleString()}
                    </span>
                </div>
                <div className="flex justify-between text-gray-500">
                    <span>Customization</span>
                    <span
                        className={
                            totalPremium > 0
                                ? 'text-emerald-700 font-semibold'
                                : 'text-gray-900'
                        }
                    >
                        {totalPremium > 0 ? `+₹${totalPremium.toLocaleString()}` : 'Included'}
                    </span>
                </div>
                <div className="h-px bg-gray-100 my-2" />
                <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-gray-900">
                        Total
                    </span>
                    <motion.span
                        key={totalPrice}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl font-inter font-semibold text-gray-900"
                    >
                        ₹{totalPrice.toLocaleString()}
                    </motion.span>
                </div>
            </div>

            <button
                onClick={handleAddToBag}
                className="mt-5 w-full py-3.5 bg-gray-900 text-white text-[11px] font-inter font-semibold tracking-[0.25em] uppercase rounded-md hover:bg-emerald-600 transition-colors duration-200"
            >
                Add Custom Design to Bag
            </button>
            <p className="mt-2 text-[10px] font-inter text-gray-400 text-center leading-relaxed">
                Custom pieces are made-to-order. Delivery in 10–14 days.
            </p>
        </div>
    );
};

export default OrderSummary;
