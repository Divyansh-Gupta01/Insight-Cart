import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PriceTag from '../../components/PriceTag/PriceTag.jsx';
import {
  selectCartItems,
  selectCartSubtotal,
  removeFromCart,
  incrementQty,
  decrementQty,
} from '../../redux/cartSlice.js';
import { notify } from '../../utils/toast.js';
import './Cart.css';

/**
 * Cart page — line items with quantity controls, remove action,
 * and a sticky price summary with checkout CTA.
 */
const Cart = () => {
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const shipping = subtotal > 0 && subtotal < 500 ? 49 : 0;
  const discount = Math.round(subtotal * 0.05);
  const total = subtotal + shipping - discount;

  if (items.length === 0) {
    return (
      <div className="cart-empty container">
        <span className="cart-empty__icon" aria-hidden="true">🛒</span>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet. Let's fix that.</p>
        <Link to="/products" className="cart-empty__cta">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart container">
      <h1 className="cart__title">My Cart <span>({items.length} items)</span></h1>

      <div className="cart__layout">
        <div className="cart__items">
          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <Link to={`/product/${item.id}`} className="cart-item__img">
                <img src={item.image} alt={item.title} />
              </Link>
              <div className="cart-item__info">
                <Link to={`/product/${item.id}`} className="cart-item__title">{item.title}</Link>
                <p className="cart-item__category" style={{ textTransform: 'capitalize' }}>{item.category}</p>
                <PriceTag price={Math.round(item.price)} size="sm" />

                <div className="cart-item__row">
                  <div className="cart-item__qty">
                    <button onClick={() => dispatch(decrementQty(item.id))} aria-label="Decrease quantity">−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => dispatch(incrementQty(item.id))} aria-label="Increase quantity">+</button>
                  </div>
                  <button
                    type="button"
                    className="cart-item__remove"
                    onClick={() => {
                      dispatch(removeFromCart(item.id));
                      notify.info('Item removed from cart');
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="cart-item__total">
                ₹{Math.round(item.price * item.qty).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>

        <aside className="cart__summary">
          <h3>Price Details</h3>
          <div className="cart__summary-row">
            <span>Price ({items.length} items)</span>
            <span>₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
          </div>
          <div className="cart__summary-row">
            <span>Discount</span>
            <span className="cart__summary-discount">− ₹{discount.toLocaleString('en-IN')}</span>
          </div>
          <div className="cart__summary-row">
            <span>Delivery</span>
            <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
          </div>
          <div className="cart__summary-row cart__summary-row--total">
            <span>Total Amount</span>
            <span>₹{Math.round(total).toLocaleString('en-IN')}</span>
          </div>
          <button
            type="button"
            className="cart__checkout"
            onClick={() => {
              notify.success('Order placed! Thank you for shopping with Insight Cart.');
              navigate('/');
            }}
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
