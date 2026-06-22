import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import RatingStars from '../../components/RatingStars/RatingStars.jsx';
import PriceTag from '../../components/PriceTag/PriceTag.jsx';
import { selectWishlistItems, removeFromWishlist } from '../../redux/wishlistSlice.js';
import { addToCart } from '../../redux/cartSlice.js';
import { notify } from '../../utils/toast.js';
import './Wishlist.css';

/**
 * Wishlist page — saved products with a "Move to Cart" action
 * (adds to cart and removes from wishlist) and a standalone remove option.
 */
const Wishlist = () => {
  const items = useSelector(selectWishlistItems);
  const dispatch = useDispatch();

  const moveToCart = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
    dispatch(removeFromWishlist(product.id));
    notify.success('Moved to cart');
  };

  if (items.length === 0) {
    return (
      <div className="wishlist-empty container">
        <span className="wishlist-empty__icon" aria-hidden="true">♡</span>
        <h2>Your wishlist is empty</h2>
        <p>Save items you love so you can find them easily later.</p>
        <Link to="/products" className="wishlist-empty__cta">Discover Products</Link>
      </div>
    );
  }

  return (
    <div className="wishlist container">
      <h1 className="wishlist__title">My Wishlist <span>({items.length} items)</span></h1>
      <div className="wishlist__grid">
        {items.map((item) => (
          <div className="wishlist-card" key={item.id}>
            <button
              type="button"
              className="wishlist-card__remove"
              aria-label="Remove from wishlist"
              onClick={() => dispatch(removeFromWishlist(item.id))}
            >
              ✕
            </button>
            <Link to={`/product/${item.id}`} className="wishlist-card__img">
              <img src={item.image} alt={item.title} />
            </Link>
            <div className="wishlist-card__body">
              <Link to={`/product/${item.id}`} className="wishlist-card__title">{item.title}</Link>
              <RatingStars rating={item.rating} count={item.ratingCount} size="sm" />
              <PriceTag price={Math.round(item.price)} size="sm" />
              <button type="button" className="wishlist-card__move" onClick={() => moveToCart(item)}>
                Move to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
