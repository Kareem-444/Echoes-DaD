import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
let accessToken: string | null = null;
let refreshToken: string | null = null;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAuthTokens(tokens: { access?: string | null; refresh?: string | null }) {
  accessToken = tokens.access || null;
  refreshToken = tokens.refresh || null;
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export function clearAuthTokens() {
  accessToken = null;
  refreshToken = null;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      error?.response?.status === 401
    ) {
      clearAuthTokens();
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

  loginWithGoogle: (idToken: string) =>
    api.post('/api/auth/google/', { id_token: idToken }),

  getMe: () =>
    api.get('/api/auth/me/'),

  logoutUser: (refresh?: string | null) =>
    api.post('/api/auth/logout/', refresh ? { refresh } : {}),
};

export default api;
