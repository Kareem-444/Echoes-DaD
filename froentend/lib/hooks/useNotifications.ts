'use client';

import { useEffect, useRef } from 'react';

import { useWebSocket } from '@/lib/contexts/WebSocketContext';
import type { NotificationPayload, NotificationType } from '@/lib/types';

export function useNotifications(
  type: NotificationType,
  callback: (payload: NotificationPayload) => void
) {
  const { subscribe, unsubscribe } = useWebSocket();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (payload: NotificationPayload) => {
      callbackRef.current(payload);
    };

    subscribe(type, handler);

    return () => {
      unsubscribe(type, handler);
    };
  }, [subscribe, type, unsubscribe]);
}
