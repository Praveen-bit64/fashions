import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WishlistItem {
    id: string;
    title: string;
    brand: string;
    image: string;
    originalPrice: number;
    discountedPrice?: number;
    rating?: number;
    inStock: boolean;
}

interface WishlistState {
    items: WishlistItem[];
}

const initialState: WishlistState = {
    items: [],
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        hydrateWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
            state.items = action.payload;
        },
        addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
            if (!state.items.some((i) => i.id === action.payload.id)) {
                state.items.push(action.payload);
            }
        },
        removeFromWishlist: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((i) => i.id !== action.payload);
        },
        toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
            const exists = state.items.some((i) => i.id === action.payload.id);
            if (exists) {
                state.items = state.items.filter((i) => i.id !== action.payload.id);
            } else {
                state.items.push(action.payload);
            }
        },
        clearWishlist: (state) => {
            state.items = [];
        },
    },
});

export const {
    hydrateWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
