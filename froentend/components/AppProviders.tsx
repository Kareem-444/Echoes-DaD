'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

import { AuthProvider } from '@/lib/AuthContext';
import { ToastProvider } from '@/lib/ToastContext';
import { WebSocketProvider } from '@/lib/contexts/WebSocketContext';

export default function AppProviders({ children }: { children: ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const appTree = (
    <AuthProvider>
      <WebSocketProvider>
        <ToastProvider>{children}</ToastProvider>
      </WebSocketProvider>
    </AuthProvider>
  );

  if (!googleClientId) {
    return appTree;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{appTree}</GoogleOAuthProvider>;
}
