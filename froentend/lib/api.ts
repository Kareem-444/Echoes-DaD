import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token') || localStorage.getItem('echoes_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response interceptor: handle 401 globally ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      error?.response?.status === 401
    ) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('echoes_token');
      document.cookie = 'echoes_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  registerUser: (email: string, password: string) =>
    api.post('/api/auth/register/', { email, password }),

  loginUser: (email: string, password: string) =>
    api.post('/api/auth/login/', { email, password }),

  getMe: () =>
    api.get('/api/auth/me/'),
};

export default api;
