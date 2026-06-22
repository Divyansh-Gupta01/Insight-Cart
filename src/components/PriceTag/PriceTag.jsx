import React from 'react';
import './PriceTag.css';

const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

/**
 * Displays current price, an optional struck-through original price,
 * and the computed discount percentage — mirrors common marketplace UX.
 */
const PriceTag = ({ price, originalPrice, size = 'md' }) => {
  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return (
    <span className={`price-tag price-tag--${size}`}>
      <span className="price-tag__current">{formatINR(price)}</span>
      {originalPrice && originalPrice > price && (
        <span className="price-tag__original">{formatINR(originalPrice)}</span>
      )}
      {discount && <span className="price-tag__discount">{discount}% off</span>}
    </span>
  );
};

export default PriceTag;
