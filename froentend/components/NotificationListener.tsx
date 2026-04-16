'use client';

import { useCallback, useState } from 'react';

import NotificationToast from '@/components/NotificationToast';
import { useNotifications } from '@/lib/hooks/useNotifications';
import type {
  ChatMessageNotification,
  NewMatchNotification,
  NotificationPayload,
  ResonanceMilestoneNotification,
} from '@/lib/types';

interface ActiveToast {
  id: number;
  notification: NotificationPayload;
}

let nextToastId = 0;

export default function NotificationListener() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const addToast = useCallback((notification: NotificationPayload) => {
    const toastId = ++nextToastId;
    setToasts((current) => [...current, { id: toastId, notification }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useNotifications('chat_message', (payload) => {
    addToast(payload as ChatMessageNotification);
  });

  useNotifications('new_match', (payload) => {
    addToast(payload as NewMatchNotification);
  });

  useNotifications('resonance_milestone', (payload) => {
    addToast(payload as ResonanceMilestoneNotification);
  });

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-4 z-[10000] flex w-[min(100%,24rem)] flex-col gap-3 sm:right-6">
      {toasts.map((toast) => (
        <NotificationToast
          key={toast.id}
          notification={toast.notification}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
