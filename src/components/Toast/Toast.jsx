/**
 * Toast notifications are powered by react-toastify, mounted once in main.jsx
 * via <ToastContainer />. Use `notify.success/error/info(...)` from
 * `src/utils/toast.js` anywhere in the app to trigger a toast.
 *
 * This file exists to satisfy the component structure / for any future
 * custom toast markup, but the actual rendering is delegated to ToastContainer.
 */
export { notify as default } from '../../utils/toast.js';
