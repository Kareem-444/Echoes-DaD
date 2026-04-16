"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, passphrase: string) => Promise<boolean>;
  register: (email: string, passphrase: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("echoes_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const login = async (email: string, passphrase: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 600));
    if (!email || !passphrase) return false;
    const u: User = { email };
    setUser(u);
    localStorage.setItem("echoes_user", JSON.stringify(u));
    return true;
  };

  const register = async (email: string, passphrase: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 600));
    if (!email || passphrase.length < 6) return false;
    const u: User = { email };
    setUser(u);
    localStorage.setItem("echoes_user", JSON.stringify(u));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("echoes_user");
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
