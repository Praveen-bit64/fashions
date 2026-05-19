'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Cart from '../features/Cart';
import Modal from '../ui/Modal';
import UserForm from '../features/UserForm';
import Whishlist from '../features/Whishlist';
import { useAppSelector } from '@/redux/hooks';

type MenuItem = { name: string; href: string };

const MENU: MenuItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
];

const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const cartCount = useAppSelector((state) =>
        state.cart.items.reduce((sum, i) => sum + i.quantity, 0)
    );
    const wishlistCount = useAppSelector((state) => state.wishlist.items.length);
    const currentUser = useAppSelector((state) => state.auth.user);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSideBar, setIsSideBar] = useState(false);
    const [toggleUserForm, setToggleUserForm] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);

    // Auto-open the sign-in modal when redirected from a protected route
    // (`?callbackUrl=…` from NextAuth) or linked with `?signin=1`.
    const wantsSignIn =
        searchParams.get('signin') === '1' || searchParams.has('callbackUrl');
    const callbackUrl = searchParams.get('callbackUrl');

    useEffect(() => {
        if (wantsSignIn && !currentUser) {
            setToggleUserForm(true);
        }
    }, [wantsSignIn, currentUser]);

    // Strips signin / callbackUrl query params without reloading.
    const clearAuthQuery = () => {
        if (!wantsSignIn) return;
        const params = new URLSearchParams(searchParams.toString());
        params.delete('signin');
        params.delete('callbackUrl');
        const next = params.toString();
        router.replace(`${pathname}${next ? `?${next}` : ''}`, { scroll: false });
    };

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        const current = pathname.toLowerCase();
        if (href === '/products') {
            return current === '/products' || current.startsWith('/product/');
        }
        return current === href || current.startsWith(href + '/');
    };

    const handleUserIconClick = () => {
        if (currentUser) {
            router.push('/profile');
        } else {
            setToggleUserForm(true);
        }
    };

    const setModalStatusCallback = ({ isOpen }: { isOpen: boolean }) => {
        setToggleUserForm(isOpen);
        if (!isOpen) clearAuthQuery();
    };

    const goTo = (href: string) => {
        router.push(href);
        setIsSideBar(false);
    };

    return (
        <>
            <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-[9999]">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 h-[72px] flex items-center justify-between gap-6">
                    {/* Logo */}
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 group"
                        aria-label="Fashion home"
                    >
                        <span className="font-inter font-semibold text-lg sm:text-xl tracking-[0.35em] text-gray-900 group-hover:text-emerald-600 transition-colors">
                            FASHION
                        </span>
                    </button>

                    {/* Desktop nav */}
                    <nav className="hidden lg:block flex-1">
                        <ul className="flex items-center justify-center gap-10">
                            {MENU.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <li key={item.name} className="relative">
                                        <button
                                            onClick={() => goTo(item.href)}
                                            className={`relative py-2 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase transition-colors ${active
                                                ? 'text-gray-900'
                                                : 'text-gray-500 hover:text-gray-900'
                                                }`}
                                        >
                                            {item.name}
                                            {active && (
                                                <motion.span
                                                    layoutId="nav-underline"
                                                    className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gray-900"
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 320,
                                                        damping: 28,
                                                    }}
                                                />
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Search */}
                        <IconButton
                            label="Search"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <SearchIcon />
                        </IconButton>

                        {/* User */}
                        <IconButton
                            label={currentUser ? 'Profile' : 'Sign in'}
                            onClick={handleUserIconClick}
                        >
                            <UserIcon />
                            {currentUser && (
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                        </IconButton>

                        {/* Wishlist */}
                        <IconButton
                            label="Wishlist"
                            onClick={() => setIsWishlistOpen(true)}
                        >
                            <HeartIcon />
                            {wishlistCount > 0 && <Badge count={wishlistCount} />}
                        </IconButton>

                        {/* Cart */}
                        <IconButton
                            label="Bag"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <BagIcon />
                            {cartCount > 0 && <Badge count={cartCount} />}
                        </IconButton>

                        {/* Mobile menu */}
                        <IconButton
                            label="Menu"
                            onClick={() => setIsSideBar(true)}
                            className="lg:hidden"
                        >
                            <MenuIcon />
                        </IconButton>
                    </div>
                </div>

                {/* Search overlay */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-sm"
                        >
                            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5">
                                <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                                    <SearchIcon className="text-gray-500" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search products, brands, categories…"
                                        className="flex-1 bg-transparent text-sm font-inter text-gray-900 placeholder:text-gray-400 outline-none"
                                    />
                                    <button
                                        onClick={() => setIsSearchOpen(false)}
                                        className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-400">
                                        Trending
                                    </span>
                                    {['Denim', 'Linen Dresses', 'Sneakers', 'Leather Jackets'].map(
                                        (term) => (
                                            <button
                                                key={term}
                                                onClick={() => {
                                                    setIsSearchOpen(false);
                                                    router.push('/products');
                                                }}
                                                className="px-3 py-1.5 text-xs font-inter text-gray-700 border border-gray-200 rounded-full hover:border-gray-900 hover:text-gray-900 transition-colors"
                                            >
                                                {term}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Mobile drawer */}
            <AnimatePresence>
                {isSideBar && (
                    <div className="lg:hidden fixed inset-0 z-[9998]">
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSideBar(false)}
                            aria-label="Close menu"
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
                        />
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                <span className="font-inter font-semibold text-base tracking-[0.35em] text-gray-900">
                                    FASHION
                                </span>
                                <button
                                    onClick={() => setIsSideBar(false)}
                                    aria-label="Close"
                                    className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <ul className="flex-1 py-4">
                                {MENU.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <li key={item.name}>
                                            <button
                                                onClick={() => goTo(item.href)}
                                                className={`relative w-full text-left px-6 py-4 text-sm font-inter tracking-[0.25em] uppercase transition-colors ${active
                                                    ? 'text-gray-900 font-semibold'
                                                    : 'text-gray-500 hover:text-gray-900'
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 transition-all duration-200 ${active ? 'h-6 bg-gray-900' : 'h-0 bg-transparent'
                                                        }`}
                                                />
                                                {item.name}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="border-t border-gray-100 p-6 space-y-3">
                                <button
                                    onClick={() => {
                                        handleUserIconClick();
                                        setIsSideBar(false);
                                    }}
                                    className="w-full inline-flex items-center justify-center gap-2 py-3 text-[11px] font-inter font-semibold tracking-[0.3em] uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors"
                                >
                                    {currentUser ? 'My Profile' : 'Sign In / Register'}
                                </button>
                                {currentUser && (
                                    <p className="text-center text-[11px] font-inter text-gray-500">
                                        Signed in as{' '}
                                        <span className="text-gray-900 font-semibold">
                                            {currentUser.name}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>

            {/* Drawers */}
            {isCartOpen && (
                <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            )}
            {isWishlistOpen && (
                <Whishlist
                    isOpen={isWishlistOpen}
                    onClose={() => setIsWishlistOpen(false)}
                />
            )}

            {/* Auth modal */}
            <Modal
                className="w-full md:w-[90%] lg:w-[860px] h-auto max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
                setModalStatusCallback={(isOpen: boolean) =>
                    setModalStatusCallback({ isOpen })
                }
                isOpen={toggleUserForm}
            >
                <UserForm
                    setModalStatusCallback={(isOpen: boolean) =>
                        setModalStatusCallback({ isOpen })
                    }
                    callbackUrl={callbackUrl}
                />
            </Modal>
        </>
    );
};

/* ─── Icon button wrapper ─────────────────────────────────────── */

function IconButton({
    onClick,
    label,
    children,
    className = '',
}: {
    onClick: () => void;
    label: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            title={label}
            className={`relative w-10 h-10 flex items-center justify-center rounded-full text-gray-900 hover:bg-gray-100 transition-colors ${className}`}
        >
            {children}
        </button>
    );
}

function Badge({ count }: { count: number }) {
    return (
        <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-emerald-500 text-white text-[9px] font-inter font-semibold rounded-full flex items-center justify-center leading-none">
            {count > 99 ? '99+' : count}
        </span>
    );
}

/* ─── Inline outline icons (Lucide-style stroke 1.8) ──────────── */

function SearchIcon({ className = '' }: { className?: string }) {
    return (
        <svg
            className={`w-5 h-5 ${className}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
        >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
        >
            <circle cx="12" cy="8" r="4" />
            <path strokeLinecap="round" d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
    );
}

function HeartIcon() {
    return (
        <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
        </svg>
    );
}

function BagIcon() {
    return (
        <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 7h12l-1.2 12.1A2 2 0 0114.81 21H9.19a2 2 0 01-1.99-1.9L6 7z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 7V5a3 3 0 116 0v2"
            />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}

export default Header;
