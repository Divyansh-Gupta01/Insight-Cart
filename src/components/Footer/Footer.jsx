import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__col">
          <h4>About</h4>
          <ul>
            <li><Link to="/">Our story</Link></li>
            <li><Link to="/">Careers</Link></li>
            <li><Link to="/">Press</Link></li>
            <li><Link to="/">Insight Cart Wholesale</Link></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>Help</h4>
          <ul>
            <li><Link to="/">Payments</Link></li>
            <li><Link to="/">Shipping</Link></li>
            <li><Link to="/">Cancellation &amp; Returns</Link></li>
            <li><Link to="/">FAQ</Link></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>Policy</h4>
          <ul>
            <li><Link to="/">Return Policy</Link></li>
            <li><Link to="/">Terms of Use</Link></li>
            <li><Link to="/">Security</Link></li>
            <li><Link to="/">Privacy</Link></li>
          </ul>
        </div>
        <div className="footer__col footer__col--social">
          <h4>Stay in the loop</h4>
          <p>Deals, drops &amp; restocks — straight to your inbox.</p>
          <form className="footer__subscribe" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email" aria-label="Email for newsletter" required />
            <button type="submit">Join</button>
          </form>
          <div className="footer__social">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="YouTube">▶</a>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <p>&copy; {year} Insight Cart. All rights reserved.</p>
        <p>Made with care in India 🇮🇳</p>
      </div>
    </footer>
  );
};

export default Footer;
