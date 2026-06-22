import { toast } from 'react-toastify';

/**
 * Thin wrapper around react-toastify so the rest of the app
 * never imports the library directly — keeps notification
 * styling/config centralized in one place.
 */
export const notify = {
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
  info: (msg) => toast.info(msg),
};
