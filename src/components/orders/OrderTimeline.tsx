import type { OrderStatus } from '@prisma/client';

type Step = { key: OrderStatus; label: string; description: string };

const HAPPY_PATH: Step[] = [
    { key: 'PENDING', label: 'Placed', description: 'We received your order' },
    {
        key: 'CONFIRMED',
        label: 'Confirmed',
        description: 'Payment confirmed, prep started',
    },
    {
        key: 'IN_PRODUCTION',
        label: 'In Production',
        description: 'Your piece is being tailored',
    },
    {
        key: 'READY_TO_SHIP',
        label: 'Ready to Ship',
        description: 'Stitched, packed, awaiting dispatch',
    },
    { key: 'SHIPPED', label: 'Shipped', description: 'On its way to you' },
    { key: 'DELIVERED', label: 'Delivered', description: 'Enjoy your piece' },
];

const STAGE_INDEX: Record<OrderStatus, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    IN_PRODUCTION: 2,
    READY_TO_SHIP: 3,
    SHIPPED: 4,
    DELIVERED: 5,
    CANCELLED: -1, // terminal
    RETURNED: -1, // terminal
};

const OrderTimeline = ({ status }: { status: OrderStatus }) => {
    // Terminal failure states get their own dedicated layout
    if (status === 'CANCELLED' || status === 'RETURNED') {
        return (
            <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center">
                <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-white border border-red-200 flex items-center justify-center">
                    <svg
                        className="w-5 h-5 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </div>
                <p className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-red-700 mb-1">
                    {status}
                </p>
                <p className="text-sm font-inter text-red-900">
                    {status === 'CANCELLED'
                        ? 'This order was cancelled and will not be fulfilled.'
                        : 'This order was returned. A refund is being processed.'}
                </p>
            </div>
        );
    }

    const currentIndex = STAGE_INDEX[status];

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
            {/* Desktop: horizontal */}
            <ol className="hidden md:flex items-start justify-between gap-2">
                {HAPPY_PATH.map((step, idx) => {
                    const isPast = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    return (
                        <li
                            key={step.key}
                            className="flex-1 relative flex flex-col items-center text-center"
                        >
                            {/* Connector line to previous */}
                            {idx > 0 && (
                                <span
                                    aria-hidden
                                    className={`absolute top-3.5 right-1/2 w-full h-px ${idx <= currentIndex ? 'bg-emerald-500' : 'bg-gray-200'
                                        }`}
                                />
                            )}
                            {/* Dot */}
                            <span
                                className={`relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center ${isPast
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : isCurrent
                                        ? 'bg-white border-gray-900 text-gray-900'
                                        : 'bg-white border-gray-200 text-gray-300'
                                    }`}
                            >
                                {isPast ? (
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                ) : (
                                    <span className="w-2 h-2 rounded-full bg-current" />
                                )}
                            </span>
                            <p
                                className={`mt-2 text-[10px] font-inter font-semibold tracking-widest uppercase ${isCurrent
                                    ? 'text-gray-900'
                                    : isPast
                                        ? 'text-emerald-700'
                                        : 'text-gray-400'
                                    }`}
                            >
                                {step.label}
                            </p>
                            <p
                                className={`mt-0.5 text-[10px] font-inter leading-tight max-w-[110px] ${isCurrent ? 'text-gray-600' : 'text-gray-400'
                                    }`}
                            >
                                {step.description}
                            </p>
                        </li>
                    );
                })}
            </ol>

            {/* Mobile: vertical */}
            <ol className="md:hidden space-y-4">
                {HAPPY_PATH.map((step, idx) => {
                    const isPast = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    return (
                        <li key={step.key} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <span
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isPast
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : isCurrent
                                            ? 'bg-white border-gray-900 text-gray-900'
                                            : 'bg-white border-gray-200 text-gray-300'
                                        }`}
                                >
                                    {isPast ? (
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    )}
                                </span>
                                {idx < HAPPY_PATH.length - 1 && (
                                    <span
                                        className={`w-px flex-1 mt-1 ${idx < currentIndex ? 'bg-emerald-500' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                            <div className="pb-1">
                                <p
                                    className={`text-[10px] font-inter font-semibold tracking-widest uppercase ${isCurrent
                                        ? 'text-gray-900'
                                        : isPast
                                            ? 'text-emerald-700'
                                            : 'text-gray-400'
                                        }`}
                                >
                                    {step.label}
                                </p>
                                <p
                                    className={`text-xs font-inter ${isCurrent ? 'text-gray-600' : 'text-gray-400'
                                        }`}
                                >
                                    {step.description}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default OrderTimeline;
