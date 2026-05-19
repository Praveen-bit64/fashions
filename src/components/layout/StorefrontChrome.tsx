'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WelcomeOfferBan from '@/components/sections/WelcomeOfferBan';

/**
 * Wraps storefront pages with Header, WelcomeOfferBan and Footer.
 * Skips them for any /admin/* route so the admin owns its own chrome.
 */
const StorefrontChrome = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin') ?? false;
    const isAuth =
        pathname?.startsWith('/sign-in') ||
        pathname?.startsWith('/sign-up') ||
        pathname?.startsWith('/forgot-password');

    if (isAdmin || isAuth) return <>{children}</>;

    return (
        <>
            <WelcomeOfferBan />
            <Header />
            {children}
            <Footer />
        </>
    );
};

export default StorefrontChrome;
