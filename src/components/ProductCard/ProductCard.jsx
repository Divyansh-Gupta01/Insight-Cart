import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import RatingStars from '../RatingStars/RatingStars.jsx';
import PriceTag from '../PriceTag/PriceTag.jsx';
import { addToCart } from '../../redux/cartSlice.js';
import { toggleWishlist, selectIsWishlisted } from '../../redux/wishlistSlice.js';
import { notify } from '../../utils/toast.js';
import './ProductCard.css';

/**
 * Reusable product card used across Home, Listing, Wishlist & Related products.
 * Shows image, title, rating, price, wishlist toggle and a quick add-to-cart.
 */
const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const isWishlisted = useSelector(selectIsWishlisted(product.id));

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ ...product, qty: 1 }));
    notify.success(`${product.title.slice(0, 30)}… added to cart`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
    notify.info(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  // Original price simulated for the "discount" UI when not provided by the API
  const originalPrice = product.originalPrice || Math.round(product.price * 1.22);

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <button
        type="button"
        className={`product-card__wishlist ${isWishlisted ? 'is-active' : ''}`}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={handleWishlist}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-7.5-4.6-10-9C.5 8 2 4 6 4c2.2 0 3.7 1.2 4.5 2.4C11.3 5.2 12.8 4 15 4c4 0 5.5 4 4 8-2.5 4.4-10 9-10 9z" />
        </svg>
      </button>

      <div className="product-card__img-wrap">
        <img src={product.image} alt={product.title} loading="lazy" />
      </div>

      <div className="product-card__body">
        <h3 className="product-card__title" title={product.title}>{product.title}</h3>
        <RatingStars rating={product.rating} count={product.ratingCount} size="sm" />
        <PriceTag price={Math.round(product.price)} originalPrice={Math.round(originalPrice)} size="sm" />
        <button type="button" className="product-card__add" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
