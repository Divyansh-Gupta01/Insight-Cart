import React from 'react';
import './Loader.css';

/**
 * Full-section spinner loader for async data fetches.
 */
const Loader = ({ label = 'Loading…', fullPage = false }) => (
  <div className={`loader ${fullPage ? 'loader--full' : ''}`} role="status" aria-live="polite">
    <span className="loader__spinner" />
    <span className="loader__label">{label}</span>
  </div>
);

export default Loader;
