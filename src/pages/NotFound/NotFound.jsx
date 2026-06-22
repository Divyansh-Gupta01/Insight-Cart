import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => (
  <div className="not-found container">
    <h1>404</h1>
    <p>This page wandered off the shelf.</p>
    <Link to="/">Back to Home</Link>
  </div>
);

export default NotFound;
