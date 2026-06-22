import React from 'react';
import './SkeletonCard.css';

/**
 * Placeholder shimmer card shown while product data is loading,
 * shaped to match ProductCard's layout to avoid layout shift.
 */
const SkeletonCard = () => (
  <div className="skeleton-card" aria-hidden="true">
    <div className="skeleton-card__img shimmer" />
    <div className="skeleton-card__line shimmer" style={{ width: '85%' }} />
    <div className="skeleton-card__line shimmer" style={{ width: '55%' }} />
    <div className="skeleton-card__line shimmer" style={{ width: '40%' }} />
  </div>
);

export default SkeletonCard;
