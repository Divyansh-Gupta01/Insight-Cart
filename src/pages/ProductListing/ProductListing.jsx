import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar.jsx';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import SkeletonCard from '../../components/SkeletonCard/SkeletonCard.jsx';
import Pagination from '../../components/Pagination/Pagination.jsx';
import useQueryParams from '../../hooks/useQueryParams.js';
import {
  fetchProducts,
  setSearchQuery,
  setCategoryFilter,
  setSortBy,
  selectVisibleProducts,
} from '../../redux/productSlice.js';
import './ProductListing.css';

const PAGE_SIZE = 12;

/**
 * Product Listing / search results page.
 * Reads `search` and `category` from the URL on load, keeps Redux in sync,
 * and renders a filterable, sortable, paginated grid.
 */
const ProductListing = () => {
  const dispatch = useDispatch();
  const query = useQueryParams();
  const { status, filters } = useSelector((state) => state.products);
  const products = useSelector(selectVisibleProducts);
  const [page, setPage] = useState(1);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts());
  }, [status, dispatch]);

  useEffect(() => {
    const search = query.get('search') || '';
    const category = query.get('category') || 'all';
    dispatch(setSearchQuery(search));
    dispatch(setCategoryFilter(category));
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.toString()]);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paginated = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isLoading = status === 'loading' || status === 'idle';

  return (
    <div className="listing container">
      <div className="listing__toolbar">
        <h1 className="listing__title">
          {filters.category !== 'all' ? <span style={{ textTransform: 'capitalize' }}>{filters.category}</span> : 'All Products'}
          <span className="listing__count"> ({products.length} items)</span>
        </h1>

        <div className="listing__toolbar-right">
          <button
            type="button"
            className="listing__filter-toggle"
            onClick={() => setShowFiltersMobile((s) => !s)}
          >
            Filters
          </button>
          <label className="listing__sort">
            Sort by:
            <select value={filters.sortBy} onChange={(e) => dispatch(setSortBy(e.target.value))}>
              <option value="relevance">Relevance</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </label>
        </div>
      </div>

      <div className="listing__body">
        <div className={`listing__sidebar ${showFiltersMobile ? 'is-open' : ''}`}>
          <FilterSidebar />
        </div>

        <div className="listing__results">
          {!isLoading && products.length === 0 ? (
            <div className="listing__empty">
              <h3>No products match your filters</h3>
              <p>Try adjusting or clearing your filters.</p>
            </div>
          ) : (
            <>
              <div className="listing__grid">
                {isLoading
                  ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
                  : paginated.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination
                currentPage={page}
                totalItems={products.length}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
