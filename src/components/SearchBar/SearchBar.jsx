import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './SearchBar.css';

/**
 * SearchBar with lightweight client-side suggestions drawn from the
 * already-loaded product catalog (titles + categories).
 */
const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const products = useSelector((state) => state.products.list);

  const suggestions =
    query.trim().length > 1
      ? products.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
      : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const submitSearch = (term) => {
    const value = term ?? query;
    if (!value.trim()) return;
    navigate(`/products?search=${encodeURIComponent(value.trim())}`);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submitSearch();
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="search-bar" ref={wrapperRef} role="search">
      <input
        type="text"
        placeholder="Search for products, brands and more"
        value={query}
        aria-label="Search products"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      <button type="button" className="search-bar__btn" aria-label="Search" onClick={() => submitSearch()}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {open && suggestions.length > 0 && (
        <ul className="search-bar__suggestions">
          {suggestions.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => submitSearch(p.title)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>{p.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
