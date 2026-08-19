import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'yims_token';
const ADMIN_KEY = 'yims_admin';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ADMIN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_KEY);
      const isLoginPage = window.location.pathname.includes('/login');
      const isAuthCheck = error.config?.url?.includes('/auth/me');
      if (!isLoginPage && !isAuthCheck) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
