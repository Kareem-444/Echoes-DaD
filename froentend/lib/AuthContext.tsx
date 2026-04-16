'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from './api';
import type { User } from './types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = typeof window !== 'undefined'
        ? localStorage.getItem('access_token') || localStorage.getItem('echoes_token')
        : null;

      if (storedToken) {
        localStorage.setItem('access_token', storedToken);
        localStorage.setItem('echoes_token', storedToken);
        setToken(storedToken);
        try {
          const response = await apiService.getMe();
          setUser(response.data as User);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('echoes_token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const persistToken = (accessToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('echoes_token', accessToken);
    document.cookie = `echoes_token=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
    setToken(accessToken);
  };

  const setAuthData = async (data: { access?: string; token?: string }) => {
    const accessToken = data.access ?? data.token ?? '';
    if (accessToken) persistToken(accessToken);

    const meResponse = await apiService.getMe();
    setUser(meResponse.data as User);
  };

  const login = async (email: string, password: string) => {
    const response = await apiService.loginUser(email, password);
    await setAuthData(response.data);
  };

  const register = async (email: string, password: string) => {
    const response = await apiService.registerUser(email, password);
    await setAuthData(response.data);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('echoes_token');
    document.cookie = 'echoes_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setToken(null);
    setUser(null);
    router.push('/auth');
  };

  /** Merge partial updates into the user object without a network call */
  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAuthenticated: !!user, login, register, logout, updateUser }}
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
