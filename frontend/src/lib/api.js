import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

// Automatically attach store owner authorization token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ci_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchCurrentUser = () => api.get(`/me`).then((r) => r.data);

export const register = (username, email, password, store_name) =>
  api
    .post(`/register`, {
      username,
      email,
      password,
      store_name,
    })
    .then((r) => r.data);

export const login = (username, password, remember_me, demo = false) =>
  api
    .post(`/login`, {
      username,
      password,
      remember_me,
      demo,
    })
    .then((r) => r.data);

export const loadSampleDataset = () =>
  api.post(`/dataset/load-sample`).then((r) => r.data);

export const streamPosSales = (sales, apiKey) =>
  api
    .post(`/pos/stream-sales`, sales, {
      headers: apiKey ? { "X-API-Key": apiKey } : {},
    })
    .then((r) => r.data);

export const fetchInsights = (start_date, end_date) =>
  api
    .get(`/insights`, { params: { start_date, end_date } })
    .then((r) => r.data);

export const fetchInventory = (status = "all") =>
  api.get(`/inventory`, { params: { status } }).then((r) => r.data);

export const fetchForecast = (days = 7, start_date, end_date, product = null) =>
  api
    .get(`/forecast`, { params: { days, start_date, end_date, product } })
    .then((r) => r.data);

export const fetchCategories = () => api.get(`/categories`).then((r) => r.data);

export const fetchDatasetStatus = () =>
  api.get(`/dataset/status`).then((r) => r.data);

export const resetDataset = () =>
  api.post(`/dataset/reset`).then((r) => r.data);

export const listSchedules = () => api.get(`/schedules`).then((r) => r.data);

export const createSchedule = (payload) =>
  api.post(`/schedules`, payload).then((r) => r.data);

export const deleteSchedule = (id) =>
  api.delete(`/schedules/${id}`).then((r) => r.data);

export const runScheduleNow = (id) =>
  api.post(`/schedules/${id}/run-now`).then((r) => r.data);

export const listDeliveries = (limit = 20) =>
  api.get(`/deliveries`, { params: { limit } }).then((r) => r.data);

export const sendReportEmail = (payload) =>
  api.post(`/reports/send-email`, payload).then((r) => r.data);

export const downloadReport = (section = "all") => {
  const token = localStorage.getItem("ci_token") || "";
  const base = section && section !== "all"
    ? `${API}/report/pdf?section=${encodeURIComponent(section)}`
    : `${API}/report/pdf`;
  const url = token ? `${base}${base.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}` : base;
  window.open(url, "_blank");
};

export const uploadDataset = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api
    .post(`/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};

export const requestPasswordResetOTP = (email) =>
  api.post(`/auth/forgot-password`, { email }).then((r) => r.data);

export const verifyPasswordResetOTP = (email, otp) =>
  api.post(`/auth/verify-otp`, { email, otp }).then((r) => r.data);

export const resetPasswordWithToken = (reset_token, new_password) =>
  api.post(`/auth/reset-password`, { reset_token, new_password }).then((r) => r.data);

export default api;
