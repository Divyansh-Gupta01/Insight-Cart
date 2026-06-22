import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar/Navbar.jsx';
import Footer from '../components/Footer/Footer.jsx';
import { selectTheme } from '../redux/uiSlice.js';

/**
 * Shared shell for all storefront pages: sticky navbar + footer,
 * with the active route rendered via <Outlet />.
 * Also syncs the chosen theme onto the <html> element for CSS variables.
 */
const MainLayout = () => {
  const theme = useSelector(selectTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
