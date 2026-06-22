import { createSlice } from '@reduxjs/toolkit';

const persisted = JSON.parse(localStorage.getItem('ic_wishlist') || '[]');
const persist = (items) => localStorage.setItem('ic_wishlist', JSON.stringify(items));

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: persisted },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.items.find((i) => i.id === product.id);
      if (exists) {
        state.items = state.items.filter((i) => i.id !== product.id);
      } else {
        state.items.push(product);
      }
      persist(state.items);
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      persist(state.items);
    },
  },
});

export const { toggleWishlist, removeFromWishlist } = wishlistSlice.actions;
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectIsWishlisted = (id) => (state) => state.wishlist.items.some((i) => i.id === id);

export default wishlistSlice.reducer;
