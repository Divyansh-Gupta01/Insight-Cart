import { createSlice } from '@reduxjs/toolkit';

const savedTheme = localStorage.getItem('ic_theme') || 'light';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: savedTheme,
    mobileMenuOpen: false,
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('ic_theme', state.theme);
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
  },
});

export const { toggleTheme, setMobileMenuOpen } = uiSlice.actions;
export const selectTheme = (state) => state.ui.theme;
export default uiSlice.reducer;
