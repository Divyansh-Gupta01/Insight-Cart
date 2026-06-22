import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import RatingStars from '../../components/RatingStars/RatingStars.jsx';
import PriceTag from '../../components/PriceTag/PriceTag.jsx';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import { fetchProductById, fetchProducts } from '../../redux/productSlice.js';
import { addToCart } from '../../redux/cartSlice.js';
import { toggleWishlist, selectIsWishlisted } from '../../redux/wishlistSlice.js';
import { notify } from '../../utils/toast.js';
import './ProductDetails.css';

// Mocked review set — in a real app this would come from a reviews API
const MOCK_REVIEWS = [
  { id: 1, author: 'Aarav S.', rating: 5, text: 'Exactly as described, fast delivery and great packaging.' },
  { id: 2, author: 'Priya K.', rating: 4, text: 'Good value for money. Quality could be slightly better.' },
  { id: 3, author: 'Rohit M.', rating: 5, text: 'Exceeded my expectations — will buy again from Insight Cart.' },
];

/**
 * Product Details page — image gallery with hover-zoom, info panel,
 * add-to-cart / buy-now actions, reviews, and a related products rail.
 */
const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProduct: product, selectedStatus, list } = useSelector((state) => state.products);
  const isWishlisted = useSelector(selectIsWishlisted(Number(id)));
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState({ active: false, x: 0, y: 0 });
  const imgWrapRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProductById(id));
    if (list.length === 0) dispatch(fetchProducts());
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (selectedStatus === 'loading' || !product) {
    return <Loader fullPage label="Loading product…" />;
  }

  const originalPrice = Math.round(product.price * 1.22);
  const related = list.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6);

  const handleMouseMove = (e) => {
    const rect = imgWrapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x, y });
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, qty }));
    notify.success('Added to cart');
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate('/cart');
  };

  return (
    <div className="pdp container">
      <nav className="pdp__breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to={`/products?category=${product.category}`} style={{ textTransform: 'capitalize' }}>{product.category}</Link> / <span>{product.title.slice(0, 40)}</span>
      </nav>

      <div className="pdp__main">
        <div className="pdp__gallery">
          <div
            className="pdp__img-wrap"
            ref={imgWrapRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
          >
            <img src={product.image} alt={product.title} />
            {zoom.active && (
              <div
                className="pdp__zoom-pane"
                style={{
                  backgroundImage: `url(${product.image})`,
                  backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                }}
                aria-hidden="true"
              />
            )}
          </div>
          <div className="pdp__thumbs">
            {[product.image, product.image, product.image].map((src, i) => (
              <button type="button" key={i} className={i === 0 ? 'is-active' : ''}>
                <img src={src} alt={`${product.title} thumbnail ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp__info">
          <h1 className="pdp__title">{product.title}</h1>
          <div className="pdp__rating-row">
            <RatingStars rating={product.rating} count={product.ratingCount} />
            <span className="pdp__category">in <span style={{ textTransform: 'capitalize' }}>{product.category}</span></span>
          </div>

          <div className="pdp__price-block">
            <PriceTag price={Math.round(product.price)} originalPrice={originalPrice} size="lg" />
            <p className="pdp__tax-note">Inclusive of all taxes</p>
          </div>

          <ul className="pdp__highlights">
            <li>Free delivery in 2–4 business days</li>
            <li>7-day replacement policy</li>
            <li>1-year manufacturer warranty</li>
            <li>Cash on delivery available</li>
          </ul>

          <div className="pdp__qty-row">
            <span>Quantity</span>
            <div className="pdp__qty-control">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div className="pdp__actions">
            <button type="button" className="pdp__btn pdp__btn--cart" onClick={handleAddToCart}>
              🛒 Add to Cart
            </button>
            <button type="button" className="pdp__btn pdp__btn--buy" onClick={handleBuyNow}>
              ⚡ Buy Now
            </button>
            <button
              type="button"
              className={`pdp__btn pdp__btn--wishlist ${isWishlisted ? 'is-active' : ''}`}
              onClick={() => {
                dispatch(toggleWishlist(product));
                notify.info(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
              }}
            >
              {isWishlisted ? '♥ Wishlisted' : '♡ Wishlist'}
            </button>
          </div>

          <div className="pdp__description">
            <h3>Product Description</h3>
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      <section className="pdp__reviews">
        <h2>Ratings &amp; Reviews</h2>
        <div className="pdp__reviews-summary">
          <div className="pdp__reviews-score">
            <span>{product.rating.toFixed(1)}</span>
            <RatingStars rating={product.rating} size="sm" />
            <p>{product.ratingCount.toLocaleString()} ratings</p>
          </div>
        </div>
        <div className="pdp__reviews-list">
          {MOCK_REVIEWS.map((r) => (
            <div className="pdp__review" key={r.id}>
              <RatingStars rating={r.rating} size="sm" />
              <p className="pdp__review-text">{r.text}</p>
              <p className="pdp__review-author">— {r.author}</p>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="pdp__related">
          <h2>Related Products</h2>
          <div className="pdp__related-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
