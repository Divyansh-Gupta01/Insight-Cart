import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCategoryFilter,
  setPriceFilter,
  setRatingFilter,
  resetFilters,
  selectAllCategories,
} from '../../redux/productSlice.js';
import './FilterSidebar.css';

const PRICE_BUCKETS = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹2,000', min: 500, max: 2000 },
  { label: '₹2,000 – ₹10,000', min: 2000, max: 10000 },
  { label: '₹10,000 – ₹50,000', min: 10000, max: 50000 },
  { label: 'Above ₹50,000', min: 50000, max: 200000 },
];

const RATING_OPTIONS = [4, 3, 2, 1];

/**
 * Filters sidebar for the Product Listing page: category, price range, rating.
 * Reads/writes filter state directly from the products Redux slice.
 */
const FilterSidebar = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);
  const filters = useSelector((state) => state.products.filters);

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar__header">
        <h3>Filters</h3>
        <button type="button" onClick={() => dispatch(resetFilters())}>Clear all</button>
      </div>

      <fieldset className="filter-sidebar__group">
        <legend>Category</legend>
        <label className="filter-sidebar__option">
          <input
            type="radio"
            name="category"
            checked={filters.category === 'all'}
            onChange={() => dispatch(setCategoryFilter('all'))}
          />
          All categories
        </label>
        {categories.map((cat) => (
          <label className="filter-sidebar__option" key={cat}>
            <input
              type="radio"
              name="category"
              checked={filters.category === cat}
              onChange={() => dispatch(setCategoryFilter(cat))}
            />
            <span style={{ textTransform: 'capitalize' }}>{cat}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="filter-sidebar__group">
        <legend>Price</legend>
        {PRICE_BUCKETS.map((bucket) => (
          <label className="filter-sidebar__option" key={bucket.label}>
            <input
              type="radio"
              name="price"
              checked={filters.minPrice === bucket.min && filters.maxPrice === bucket.max}
              onChange={() => dispatch(setPriceFilter({ min: bucket.min, max: bucket.max }))}
            />
            {bucket.label}
          </label>
        ))}
      </fieldset>

      <fieldset className="filter-sidebar__group">
        <legend>Customer ratings</legend>
        {RATING_OPTIONS.map((r) => (
          <label className="filter-sidebar__option" key={r}>
            <input
              type="radio"
              name="rating"
              checked={filters.minRating === r}
              onChange={() => dispatch(setRatingFilter(r))}
            />
            {r}★ &amp; above
          </label>
        ))}
      </fieldset>
    </aside>
  );
};

export default FilterSidebar;
