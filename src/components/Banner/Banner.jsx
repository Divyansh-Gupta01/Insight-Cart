import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Banner.css';

/**
 * Auto-advancing hero banner carousel. Pauses on hover/focus and
 * supports manual navigation via dots and arrow buttons.
 */
const Banner = ({ slides, interval = 4500 }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused) return undefined;
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
  }, [paused, next, interval]);

  return (
    <div
      className="banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-label="Promotional banner"
    >
      <div className="banner__track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((slide) => (
          <div className={`banner__slide`} style={{ background: slide.bg }} key={slide.id}>
            <div className="banner__content">
              <p className="banner__eyebrow">{slide.eyebrow}</p>
              <h2>{slide.title}</h2>
              <p className="banner__subtitle">{slide.subtitle}</p>
              <a href={slide.href} className="banner__cta">{slide.cta}</a>
            </div>
            <div className="banner__art" aria-hidden="true">{slide.emoji}</div>
          </div>
        ))}
      </div>

      <button className="banner__nav banner__nav--prev" onClick={prev} aria-label="Previous slide">‹</button>
      <button className="banner__nav banner__nav--next" onClick={next} aria-label="Next slide">›</button>

      <div className="banner__dots">
        {slides.map((s, i) => (
          <button
            key={s.id}
            className={i === index ? 'is-active' : ''}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
