import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { notify } from '../../utils/toast.js';
import '../Login/Login.css';

/**
 * Forgot Password page — collects an email and simulates sending a reset link.
 * Wire `handleSubmit` to a real password-reset endpoint when available.
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    notify.success('Reset link sent — check your inbox.');
  };

  return (
    <div className="auth-page container">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="auth-card__logo">IC</span>
          <h1>Reset your password</h1>
          <p>Enter your email and we'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="auth-form" style={{ textAlign: 'center', gap: 10 }}>
            <p>A password reset link has been sent to <strong>{email}</strong>.</p>
            <Link to="/login" className="auth-form__submit" style={{ display: 'inline-block', lineHeight: '44px', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </label>
            <button type="submit" className="auth-form__submit">Send Reset Link</button>
          </form>
        )}

        <p className="auth-card__footer">
          Remembered your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
