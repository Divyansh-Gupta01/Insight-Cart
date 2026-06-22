import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectUserStatus, selectUserError } from '../../redux/userSlice.js';
import { notify } from '../../utils/toast.js';
import './Login.css';

/**
 * Login page. Demoable without a backend (see userSlice's mocked thunk) —
 * swap the thunk implementation to call a real auth endpoint.
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector(selectUserStatus);
  const error = useSelector(selectUserError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      notify.success('Welcome back!');
      navigate('/');
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="auth-card__logo">IC</span>
          <h1>Login to Insight Cart</h1>
          <p>Get access to your orders, wishlist and recommendations</p>
        </div>

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
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </label>

          {error && <p className="auth-form__error">{error}</p>}

          <div className="auth-form__row">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="auth-form__submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className="auth-card__footer">
          New to Insight Cart? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
