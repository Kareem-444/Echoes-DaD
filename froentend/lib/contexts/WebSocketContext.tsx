'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

import { useAuth } from '@/lib/AuthContext';
import type { NotificationPayload, NotificationType } from '@/lib/types';

type NotificationCallback = (payload: NotificationPayload) => void;

interface WebSocketContextType {
  subscribe: (type: NotificationType, callback: NotificationCallback) => void;
  unsubscribe: (type: NotificationType, callback: NotificationCallback) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

function buildSocketUrl(token: string) {
  const wsHost = (process.env.NEXT_PUBLIC_WS_URL || '127.0.0.1:8000')
    .replace(/^https?:\/\//, '')
    .replace(/^wss?:\/\//, '')
    .replace(/\/$/, '');

  return `ws://${wsHost}/ws/notifications/?token=${encodeURIComponent(token)}`;
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, token } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);
  const listenersRef = useRef<Map<NotificationType, Set<NotificationCallback>>>(
    new Map([
      ['chat_message', new Set()],
      ['new_match', new Set()],
      ['resonance_milestone', new Set()],
    ])
  );

  const subscribe = useCallback((type: NotificationType, callback: NotificationCallback) => {
    listenersRef.current.get(type)?.add(callback);
  }, []);

  const unsubscribe = useCallback((type: NotificationType, callback: NotificationCallback) => {
    listenersRef.current.get(type)?.delete(callback);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) {
      return;
    }

    const storedAccessToken = localStorage.getItem('access_token');
    const legacyToken = localStorage.getItem('echoes_token');
    const resolvedToken = storedAccessToken || legacyToken || token;

    if (!resolvedToken || !isAuthenticated) {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    localStorage.setItem('access_token', resolvedToken);
    shouldReconnectRef.current = true;

    const connect = () => {
      const nextSocket = new WebSocket(buildSocketUrl(resolvedToken));
      socketRef.current = nextSocket;

      nextSocket.onopen = () => {
        reconnectAttemptsRef.current = 0;
      };

      nextSocket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as NotificationPayload;
          listenersRef.current.get(payload.type)?.forEach((listener) => listener(payload));
        } catch {
          return;
        }
      };

      nextSocket.onerror = () => {
        nextSocket.close();
      };

      nextSocket.onclose = (event) => {
        if (socketRef.current === nextSocket) {
          socketRef.current = null;
        }

        if (!shouldReconnectRef.current || event.code === 4001) {
          return;
        }

        if (reconnectAttemptsRef.current >= MAX_RETRIES) {
          return;
        }

        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = window.setTimeout(connect, RETRY_DELAY_MS);
      };
    };

    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, isLoading, token]);

  return (
    <WebSocketContext.Provider value={{ subscribe, unsubscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }

  return context;
}
