import axios from 'axios';

/**
 * Centralized Axios instance.
 * Base URL is read from an environment variable so the same build
 * can point at different backends (dev / staging / prod).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://fakestoreapi.com',
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ic_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Centralized error normalization
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
