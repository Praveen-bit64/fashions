'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { SessionProvider, useSession } from 'next-auth/react';
import { store } from '@/redux/store';
import { hydrateCart } from '@/redux/slices/cartSlice';
import { hydrateWishlist } from '@/redux/slices/wishlistSlice';
import { setUser, clearUser, setLoading } from '@/redux/slices/authSlice';

const CART_KEY = 'fashion::cart';
const WISHLIST_KEY = 'fashion::wishlist';

const PersistenceBridge = () => {
    useEffect(() => {
        try {
            const cartRaw = localStorage.getItem(CART_KEY);
            const wishlistRaw = localStorage.getItem(WISHLIST_KEY);
            if (cartRaw) store.dispatch(hydrateCart(JSON.parse(cartRaw)));
            if (wishlistRaw)
                store.dispatch(hydrateWishlist(JSON.parse(wishlistRaw)));
        } catch {
            /* ignore */
        }

        const unsub = store.subscribe(() => {
            const state = store.getState();
            try {
                localStorage.setItem(CART_KEY, JSON.stringify(state.cart.items));
                localStorage.setItem(
                    WISHLIST_KEY,
                    JSON.stringify(state.wishlist.items)
                );
            } catch {
                /* ignore */
            }
        });
        return unsub;
    }, []);

    return null;
};

/**
 * Mirrors the NextAuth session into the existing Redux auth slice so all the
 * legacy components (Header, Cart drawer, Profile page, etc.) keep working
 * without rewiring.
 */
const AuthBridge = () => {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') {
            store.dispatch(setLoading(true));
            return;
        }
        if (session?.user) {
            store.dispatch(
                setUser({
                    id: session.user.id,
                    name: session.user.name ?? '',
                    email: session.user.email ?? '',
                })
            );
        } else {
            store.dispatch(clearUser());
        }
    }, [session, status]);

    return null;
};

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            <Provider store={store}>
                <PersistenceBridge />
                <AuthBridge />
                {children}
            </Provider>
        </SessionProvider>
    );
};

export default Providers;
