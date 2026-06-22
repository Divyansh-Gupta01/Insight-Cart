import React from 'react';
import './RatingStars.css';

/**
 * Renders a Flipkart-style rating pill (e.g. "4.3 ★") plus optional review count.
 */
const RatingStars = ({ rating = 0, count, size = 'md' }) => {
  const rounded = Math.round(rating * 10) / 10;
  return (
    <span className={`rating-stars rating-stars--${size}`}>
      <span className="rating-stars__pill" aria-label={`Rated ${rounded} out of 5`}>
        {rounded}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.1 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.9 5.6 21.4l1.5-7.1L1.7 9.4l7.2-.8z" />
        </svg>
      </span>
      {typeof count === 'number' && <span className="rating-stars__count">({count.toLocaleString()})</span>}
    </span>
  );
};

export default RatingStars;
