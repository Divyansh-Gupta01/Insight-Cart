# Insight Cart

A production-ready, Flipkart-inspired e-commerce storefront built with React, Redux Toolkit, and React Router.

## Tech Stack
- React 18 + Vite
- React Router DOM v6
- Redux Toolkit (cart, products, wishlist, user, ui slices)
- Axios (centralized instance in `src/services/api.js`)
- Plain CSS (component-scoped `.css` files) following a shared design-token system in `src/index.css`
- `react-toastify` for toast notifications

## Getting Started
```bash
npm install
cp .env.example .env   # optional — defaults to fakestoreapi.com
npm run dev
```

Build for production:
```bash
npm run build
npm run preview
```

## Folder Structure
```
src/
├── assets/             Images & icons
├── components/          Reusable UI building blocks (Navbar, ProductCard, etc.)
├── pages/                One folder per route/page
├── redux/                Redux Toolkit slices + store
├── services/             Axios instance
├── routes/               Central route table (code-split, lazy-loaded)
├── layouts/               MainLayout (navbar + footer shell)
├── hooks/                  Custom hooks
└── utils/                   Helpers (toast wrapper, static category data)
```

## Features
- Sticky responsive navbar with search, suggestions, wishlist/cart badges, dark mode toggle, mobile menu
- Home: hero carousel, category strip, trending/featured rails, best offers grid
- Product Listing: category/price/rating filters, sorting, pagination, skeleton loaders
- Product Details: zoomable gallery, ratings & reviews, add-to-cart/buy-now, related products
- Cart: quantity controls, remove item, price summary, checkout
- Wishlist: move-to-cart, remove
- Auth: Login, Register, Forgot Password (mocked thunks — swap with real API calls)
- Dark mode (persisted to localStorage), toast notifications, lazy-loaded routes (code splitting)

## Connecting a Real Backend
1. Set `VITE_API_BASE_URL` in `.env` to your API's base URL.
2. Update `src/redux/productSlice.js` and `src/redux/userSlice.js` to match your API's response shape.
3. Remove the mocked `setTimeout` logic in `userSlice.js`'s thunks once a real auth endpoint is wired up.

## Color Palette
| Token | Hex |
|---|---|
| Primary | `#2874F0` |
| Secondary | `#172337` |
| Accent | `#FF9F00` |
| Background | `#F1F3F6` |
| White | `#FFFFFF` |
