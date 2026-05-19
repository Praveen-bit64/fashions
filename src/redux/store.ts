import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/authSlice"
import cartReducer from "@/redux/slices/cartSlice"
import wishlistReducer from "@/redux/slices/wishlistSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
