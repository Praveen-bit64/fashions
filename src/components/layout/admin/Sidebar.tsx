'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

type NavItem = { label: string; href: string; icon: React.ReactNode };

const NAV: { section: string; items: NavItem[] }[] = [
    {
        section: 'Overview',
        items: [
            {
                label: 'Dashboard',
                href: '/admin',
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="9" rx="1" />
                        <rect x="14" y="3" width="7" height="5" rx="1" />
                        <rect x="14" y="12" width="7" height="9" rx="1" />
                        <rect x="3" y="16" width="7" height="5" rx="1" />
                    </svg>
                ),
            },
        ],
    },
    {
        section: 'Catalog',
        items: [
            {
                label: 'Products',
                href: '/admin/products',
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7L12 3 4 7v10l8 4 8-4V7z" />
                        <path strokeLinecap="round" d="M12 12l8-5M12 12v9M12 12L4 7" />
                    </svg>
                ),
            },
            {
                label: 'Categories',
                href: '/admin/categories',
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h7v7H3zM14 7h7v4h-7zM14 14h7v6h-7zM3 17h7v3H3z" />
                    </svg>
                ),
            },
        ],
    },
    {
        section: 'Operations',
        items: [
            {
                label: 'Orders',
                href: '/admin/orders',
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3 3 8-8M3 12l3 3 8-8" />
                    </svg>
                ),
            },
            {
                label: 'Tailoring',
                href: '/admin/tailoring',
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <circle cx="12" cy="6" r="2.5" />
                        <path strokeLinecap="round" d="M12 8.5v7M9 21l3-5.5L15 21" />
                    </svg>
                ),
            },
            {
                label: 'Customers',
                href: '/admin/customers',
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <circle cx="9" cy="8" r="3.5" />
                        <path strokeLinecap="round" d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 11a3 3 0 100-6 3 3 0 000 6zM15 14h2c2.2 0 4 1.8 4 4" />
                    </svg>
                ),
            },
        ],
    },
    {
        section: 'Engagement',
        items: [
            {
                label: 'AI',
                href: '/admin/ai',
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2 5 5 1-3.5 3.5L17 17l-5-3-5 3 1.5-5.5L5 8l5-1 2-5z" />
                    </svg>
                ),
            },
            {
                label: 'CMS',
                href: '/admin/cms',
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path strokeLinecap="round" d="M3 9h18M9 4v16" />
                    </svg>
                ),
            },
            {
                label: 'Coupons',
                href: '/admin/coupons',
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 010 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 010-4z" />
                        <path strokeLinecap="round" d="M9 5v14" />
                    </svg>
                ),
            },
            {
                label: 'Reviews',
                href: '/admin/reviews',
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.5 3l2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3 9.1l5.9-.8L11.5 3z" />
                    </svg>
                ),
            },
        ],
    },
    {
        section: 'System',
        items: [
            {
                label: 'Settings',
                href: '/admin/settings',
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8L4.2 7a2 2 0 012.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" />
                    </svg>
                ),
            },
        ],
    },
];

const Sidebar = ({
    userName,
    userRole,
}: {
    userName: string;
    userRole: string;
}) => {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-gray-100">
            {/* Brand */}
            <Link
                href="/admin"
                className="flex items-center gap-2 px-6 h-[72px] border-b border-gray-100"
            >
                <span className="font-inter font-semibold text-lg tracking-[0.35em] text-gray-900">
                    FASHION
                </span>
                <span className="ml-1 text-[9px] font-inter font-bold tracking-[0.25em] uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                    Admin
                </span>
            </Link>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-5 px-3">
                {NAV.map((group) => (
                    <div key={group.section} className="mb-6">
                        <p className="px-3 mb-2 text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-400">
                            {group.section}
                        </p>
                        <ul className="space-y-0.5">
                            {group.items.map((item) => {
                                const active =
                                    item.href === '/admin'
                                        ? pathname === '/admin'
                                        : pathname.startsWith(item.href);
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-inter transition-colors ${active
                                                ? 'bg-gray-50 text-gray-900 font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            {active && (
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gray-900 rounded-full" />
                                            )}
                                            <span
                                                className={
                                                    active ? 'text-gray-900' : 'text-gray-400'
                                                }
                                            >
                                                {item.icon}
                                            </span>
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* User card */}
            <div className="border-t border-gray-100 p-4">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-inter font-semibold tracking-wider">
                        {userName
                            .split(' ')
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-inter font-semibold text-gray-900 truncate">
                            {userName}
                        </p>
                        <p className="text-[10px] font-inter font-medium tracking-wider uppercase text-gray-500 truncate">
                            {userRole.replace(/_/g, ' ').toLowerCase()}
                        </p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        title="Sign out"
                        aria-label="Sign out"
                        className="w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-600 flex items-center justify-center transition-colors"
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
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
