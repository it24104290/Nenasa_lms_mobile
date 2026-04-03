import axios from 'axios';

const backendOrigin = import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:8080';

// Prefer explicit backend API URL unless a custom base URL is provided via env.
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || `${backendOrigin}/api`;

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

