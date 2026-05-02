import axios from 'axios';

const backendOrigin = import.meta.env.VITE_BACKEND_ORIGIN || (import.meta.env.DEV ? 'http://localhost:8080' : 'https://nenasa-lms-mobile.onrender.com');

// In production, use the full backend URL.
// In local development, use the Vite proxy (/api -> backend:8080).
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : `${backendOrigin}/api`);

const api = axios.create({
  baseURL: apiBaseURL
});

export const buildBackendUrl = (path = '') => {
  if (!path) return backendOrigin;
  if (/^https?:\/\//i.test(path)) return path;
  return `${backendOrigin}${path.startsWith('/') ? path : `/${path}`}`;
};

api.interceptors.request.use((config) => {
  const url = config.url || '';
  const isAuthRequest = /(^|\/)(auth\/login|auth\/register)$/.test(url);
  if (isAuthRequest) {
    return config;
  }

  const stored = localStorage.getItem('nanasa_auth');
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

