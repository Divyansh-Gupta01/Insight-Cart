import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, selectUserStatus, selectUserError } from '../../redux/userSlice.js';
import { notify } from '../../utils/toast.js';
import '../Login/Login.css';

/**
 * Registration page — reuses Login's auth-card visual styling for consistency.
 */
const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [localError, setLocalError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector(selectUserStatus);
  const error = useSelector(selectUserError);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (form.password !== form.confirm) {
      setLocalError('Passwords do not match.');
      return;
    }
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      notify.success('Account created — welcome to Insight Cart!');
      navigate('/');
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="auth-card__logo">IC</span>
          <h1>Create your account</h1>
          <p>Join Insight Cart for faster checkout and exclusive deals</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input type="text" value={form.name} onChange={handleChange('name')} required placeholder="Jane Doe" />
          </label>
          <label>
            Email address
            <input type="email" value={form.email} onChange={handleChange('email')} required placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={handleChange('password')} required placeholder="••••••••" />
          </label>
          <label>
            Confirm password
            <input type="password" value={form.confirm} onChange={handleChange('confirm')} required placeholder="••••••••" />
          </label>

          {(localError || error) && <p className="auth-form__error">{localError || error}</p>}

          <button type="submit" className="auth-form__submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
