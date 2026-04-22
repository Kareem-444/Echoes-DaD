'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, clearAuthTokens, getRefreshToken, setAuthTokens } from './api';
import type { User } from './types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function clearLegacyBrowserAuth() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('access_token');
  localStorage.removeItem('echoes_token');
  localStorage.removeItem('refresh_token');
  document.cookie = 'echoes_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    clearLegacyBrowserAuth();
    setIsLoading(false);
  }, []);

  const clearLocalAuthState = () => {
    clearAuthTokens();
    clearLegacyBrowserAuth();
    setToken(null);
    setUser(null);
  };

  const setAuthData = async (data: { access?: string; token?: string; refresh?: string }) => {
    const accessToken = data.access ?? data.token ?? '';
    setAuthTokens({ access: accessToken, refresh: data.refresh });
    setToken(accessToken || null);

    const meResponse = await apiService.getMe();
    setUser(meResponse.data as User);
  };

  const login = async (email: string, password: string) => {
    const response = await apiService.loginUser(email, password);
    await setAuthData(response.data);
  };

  const loginWithGoogle = async (idToken: string) => {
    const response = await apiService.loginWithGoogle(idToken);
    await setAuthData(response.data);
  };

  const register = async (email: string, password: string) => {
    const response = await apiService.registerUser(email, password);
    await setAuthData(response.data);
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();

    try {
      await apiService.logoutUser(refreshToken);
    } catch {
      // We still clear local auth state to guarantee frontend logout.
    }

    clearLocalAuthState();
    router.push('/auth');
  };

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
