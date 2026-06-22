import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import Loader from '../components/Loader/Loader.jsx';

// Code-split every page so the initial bundle stays small
const Home = lazy(() => import('../pages/Home/Home.jsx'));
const ProductListing = lazy(() => import('../pages/ProductListing/ProductListing.jsx'));
const ProductDetails = lazy(() => import('../pages/ProductDetails/ProductDetails.jsx'));
const Cart = lazy(() => import('../pages/Cart/Cart.jsx'));
const Wishlist = lazy(() => import('../pages/Wishlist/Wishlist.jsx'));
const Login = lazy(() => import('../pages/Login/Login.jsx'));
const Register = lazy(() => import('../pages/Register/Register.jsx'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword/ForgotPassword.jsx'));
const NotFound = lazy(() => import('../pages/NotFound/NotFound.jsx'));

/**
 * Central route table. All page components are lazy-loaded (code splitting);
 * MainLayout supplies the persistent navbar/footer shell via <Outlet />.
 */
const AppRoutes = () => (
  <Suspense fallback={<Loader fullPage label="Loading Insight Cart…" />}>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </Suspense>
);

export default AppRoutes;
