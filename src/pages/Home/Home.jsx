import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Banner from '../../components/Banner/Banner.jsx';
import CategoryCard from '../../components/CategoryCard/CategoryCard.jsx';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import SkeletonCard from '../../components/SkeletonCard/SkeletonCard.jsx';
import { fetchProducts } from '../../redux/productSlice.js';
import { CATEGORY_META } from '../../utils/categories.js';
import './Home.css';

const SLIDES = [
  {
    id: 1,
    eyebrow: 'Big Billion Days',
    title: 'Up to 70% off on Electronics',
    subtitle: 'Top brands, unbeatable prices — only this week.',
    cta: 'Shop now',
    href: '/products?category=electronics',
    bg: 'linear-gradient(135deg, #2874F0, #1a4fb0)',
    emoji: '🎧',
  },
  {
    id: 2,
    eyebrow: 'New Arrival',
    title: 'Fashion that fits your story',
    subtitle: 'Fresh styles for men & women, dropped weekly.',
    cta: 'Explore fashion',
    href: '/products?category=men%27s+clothing',
    bg: 'linear-gradient(135deg, #172337, #2a3a5c)',
    emoji: '👗',
  },
  {
    id: 3,
    eyebrow: 'Festive Offer',
    title: 'Jewellery starting ₹499',
    subtitle: 'Handpicked pieces for every occasion.',
    cta: 'View collection',
    href: '/products?category=jewelery',
    bg: 'linear-gradient(135deg, #FF9F00, #cc7d00)',
    emoji: '💍',
  },
];

/**
 * Home page — hero carousel, category strip, trending/featured rails,
 * and a best-offers grid. Fetches the catalog once on mount.
 */
const Home = () => {
  const dispatch = useDispatch();
  const { list, status } = useSelector((state) => state.products);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts());
  }, [status, dispatch]);

  const trending = [...list].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 6);
  const featured = [...list].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const bestOffers = [...list].slice().reverse().slice(0, 8);

  const isLoading = status === 'loading' || status === 'idle';

  return (
    <div className="home container">
      <section className="home__hero">
        <Banner slides={SLIDES} />
      </section>

      <section className="home__section" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="home__heading">Shop by Category</h2>
        <div className="home__categories">
          {CATEGORY_META.map((cat) => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      </section>

      <ProductRail
        title="Trending Now"
        subtitle="What everyone's adding to cart"
        products={trending}
        isLoading={isLoading}
        viewAllHref="/products"
      />

      <ProductRail
        title="Featured Products"
        subtitle="Top-rated picks, curated for you"
        products={featured}
        isLoading={isLoading}
        viewAllHref="/products"
      />

      <section className="home__section" aria-labelledby="offers-heading">
        <div className="home__section-header">
          <div>
            <h2 id="offers-heading" className="home__heading">Best Offers</h2>
            <p className="home__subheading">Deals too good to scroll past</p>
          </div>
          <Link to="/products" className="home__view-all">View all →</Link>
        </div>
        <div className="home__grid">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : bestOffers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
};

const ProductRail = ({ title, subtitle, products, isLoading, viewAllHref }) => (
  <section className="home__section">
    <div className="home__section-header">
      <div>
        <h2 className="home__heading">{title}</h2>
        <p className="home__subheading">{subtitle}</p>
      </div>
      <Link to={viewAllHref} className="home__view-all">View all →</Link>
    </div>
    <div className="home__rail">
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        : products.map((p) => (
            <div className="home__rail-item" key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
    </div>
  </section>
);

export default Home;
