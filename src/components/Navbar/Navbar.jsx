import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import SearchBar from '../SearchBar/SearchBar.jsx';
import { selectCartCount } from '../../redux/cartSlice.js';
import { selectWishlistItems } from '../../redux/wishlistSlice.js';
import { selectCurrentUser, logout } from '../../redux/userSlice.js';
import { toggleTheme, selectTheme } from '../../redux/uiSlice.js';
import './Navbar.css';

/**
 * Sticky top navigation bar — logo, search, theme toggle, account, wishlist, cart.
 * Collapses into a hamburger-driven mobile menu under 768px.
 */
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useSelector(selectCartCount);
  const wishlistItems = useSelector(selectWishlistItems);
  const user = useSelector(selectCurrentUser);
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <button
          className="navbar__hamburger"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span /> <span /> <span />
        </button>

        <Link to="/" className="navbar__logo" aria-label="Insight Cart home">
          <span className="navbar__logo-mark">IC</span>
          <span className="navbar__logo-text">
            Insight<strong>Cart</strong>
          </span>
        </Link>

        <div className="navbar__search-desktop">
          <SearchBar />
        </div>

        <nav className={`navbar__actions ${menuOpen ? 'is-open' : ''}`} aria-label="Primary">
          <div className="navbar__search-mobile">
            <SearchBar />
          </div>

          <button
            type="button"
            className="navbar__icon-btn"
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div className="navbar__account">
              <span className="navbar__greeting">Hi, {user.name}</span>
              <button type="button" className="navbar__link-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="navbar__link">
              Login
            </NavLink>
          )}

          <NavLink to="/wishlist" className="navbar__link navbar__icon-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7.5-4.6-10-9C.5 8 2 4 6 4c2.2 0 3.7 1.2 4.5 2.4C11.3 5.2 12.8 4 15 4c4 0 5.5 4 4 8-2.5 4.4-10 9-10 9z" />
            </svg>
            <span>Wishlist</span>
            {wishlistItems.length > 0 && <span className="navbar__badge">{wishlistItems.length}</span>}
          </NavLink>

          <NavLink to="/cart" className="navbar__link navbar__icon-link navbar__cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            <span>Cart</span>
            {cartCount > 0 && <span className="navbar__badge">{cartCount}</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
