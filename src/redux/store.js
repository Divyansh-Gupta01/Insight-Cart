import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice.js';
import productReducer from './productSlice.js';
import userReducer from './userSlice.js';
import wishlistReducer from './wishlistSlice.js';
import uiReducer from './uiSlice.js';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
    user: userReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
  },
});
