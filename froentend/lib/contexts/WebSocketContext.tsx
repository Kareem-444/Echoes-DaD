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

function resolveWsHost() {
  const configuredHost = (process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || '')
    .replace(/^https?:\/\//, '')
    .replace(/^wss?:\/\//, '')
    .replace(/\/$/, '');

  if (configuredHost) {
    return configuredHost;
  }

  return typeof window !== 'undefined' ? window.location.host : '';
}

function buildSocketUrl() {
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${resolveWsHost()}/ws/notifications/`;
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, token } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);
  const listenersRef = useRef<Map<NotificationType, Set<NotificationCallback>>>(
    new Map<NotificationType, Set<NotificationCallback>>([
      ['chat_message', new Set<NotificationCallback>()],
      ['new_match', new Set<NotificationCallback>()],
      ['resonance_milestone', new Set<NotificationCallback>()],
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

    if (!token || !isAuthenticated) {
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

    shouldReconnectRef.current = true;

    const connect = () => {
      const nextSocket = new WebSocket(buildSocketUrl());
      socketRef.current = nextSocket;

      nextSocket.onopen = () => {
        nextSocket.send(JSON.stringify({ type: 'authenticate', token }));
      };

      nextSocket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as NotificationPayload | { type: 'authenticated' };
          if (payload.type === 'authenticated') {
            reconnectAttemptsRef.current = 0;
            return;
          }

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
