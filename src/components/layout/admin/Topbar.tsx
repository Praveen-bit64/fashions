'use client';

import Link from 'next/link';

const Topbar = ({ userName }: { userName: string }) => {
    return (
        <header className="sticky top-0 z-30 h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-4">
                {/* Mobile brand */}
                <Link href="/admin" className="lg:hidden">
                    <span className="font-inter font-semibold text-base tracking-[0.35em] text-gray-900">
                        FASHION
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <Link
                    href="/"
                    className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM15 12H3M9 8l-4 4 4 4"
                        />
                    </svg>
                    View Storefront
                </Link>

                <button
                    aria-label="Notifications"
                    className="relative w-9 h-9 rounded-full text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.59 1.41L4 17h5m6 0a3 3 0 11-6 0"
                        />
                    </svg>
                </button>

                <div className="hidden sm:flex flex-col items-end leading-tight">
                    <p className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-400">
                        Signed in
                    </p>
                    <p className="text-xs font-inter font-semibold text-gray-900">
                        {userName}
                    </p>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
