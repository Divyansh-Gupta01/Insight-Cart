import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryCard.css';

/**
 * Round-icon category tile used in the Home page category strip.
 */
const CategoryCard = ({ category }) => (
  <Link to={`/products?category=${encodeURIComponent(category.slug)}`} className="category-card">
    <span className="category-card__icon" aria-hidden="true">{category.emoji}</span>
    <span className="category-card__label">{category.label}</span>
  </Link>
);

export default CategoryCard;
