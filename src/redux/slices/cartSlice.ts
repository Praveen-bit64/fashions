import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
    id: string;
    title: string;
    brand: string;
    image: string;
    originalPrice: number;
    discountedPrice?: number;
    size: string;
    color: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
};

const lineKey = (item: Pick<CartItem, 'id' | 'size' | 'color'>) =>
    `${item.id}::${item.size}::${item.color}`;

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
        },
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const incoming = action.payload;
            const existing = state.items.find(
                (i) => lineKey(i) === lineKey(incoming)
            );
            if (existing) {
                existing.quantity += incoming.quantity;
            } else {
                state.items.push(incoming);
            }
        },
        updateQuantity: (
            state,
            action: PayloadAction<{ key: string; quantity: number }>
        ) => {
            const { key, quantity } = action.payload;
            const item = state.items.find((i) => lineKey(i) === key);
            if (item) {
                if (quantity < 1) {
                    state.items = state.items.filter((i) => lineKey(i) !== key);
                } else {
                    item.quantity = quantity;
                }
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((i) => lineKey(i) !== action.payload);
        },
        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const {
    hydrateCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
} = cartSlice.actions;

export { lineKey };
export default cartSlice.reducer;
