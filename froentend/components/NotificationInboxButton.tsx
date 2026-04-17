'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNotifications } from '@/lib/hooks/useNotifications';
import { useAuth } from '@/lib/AuthContext';
import { notificationService } from '@/lib/services/notificationService';
import type { NotificationPayload, NotificationType, StoredNotification } from '@/lib/types';

function formatNotificationLabel(type: NotificationType) {
  switch (type) {
    case 'chat_message':
      return 'New Message';
    case 'new_match':
      return 'New Match';
    case 'resonance_milestone':
      return 'Milestone';
    default:
      return 'Notification';
  }
}

function formatNotificationMessage(payload: NotificationPayload) {
  if (payload.type === 'chat_message') {
    return `${payload.sender_anonymous_name} sent a message: ${payload.content}`;
  }

  if (payload.type === 'new_match') {
    return `You matched with ${payload.anonymous_name} at ${payload.harmony_score}% harmony.`;
  }

  return `Your echo reached ${payload.milestone} resonances: ${payload.echo_preview}`;
}

function buildNotificationFromPayload(payload: NotificationPayload): StoredNotification {
  const generatedId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    id: generatedId,
    type: payload.type,
    message: formatNotificationMessage(payload),
    is_read: false,
    created_at: payload.type === 'chat_message' ? payload.timestamp : new Date().toISOString(),
  };
}

function formatRelativeTime(dateString: string) {
  const diffInSeconds = Math.max(0, Math.floor((Date.now() - new Date(dateString).getTime()) / 1000));

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  }

  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  }

  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function upsertNotification(
  currentNotifications: StoredNotification[],
  incomingNotification: StoredNotification
) {
  const nextNotifications = [
    incomingNotification,
    ...currentNotifications.filter((notification) => notification.id !== incomingNotification.id),
  ];

  return nextNotifications.slice(0, 20);
}

export default function NotificationInboxButton() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await notificationService.list();
      setNotifications(response);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  const handleIncomingNotification = useCallback((payload: NotificationPayload) => {
    if (!user) {
      return;
    }

    setNotifications((current) => upsertNotification(current, buildNotificationFromPayload(payload)));
  }, [user]);

  useNotifications('chat_message', handleIncomingNotification);
  useNotifications('new_match', handleIncomingNotification);
  useNotifications('resonance_milestone', handleIncomingNotification);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const handleToggle = async () => {
    if (!user) {
      return;
    }

    const nextOpenState = !isOpen;
    setIsOpen(nextOpenState);

    if (nextOpenState) {
      await loadNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!unreadCount) {
      return;
    }

    setIsMarkingRead(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } finally {
      setIsMarkingRead(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => void handleToggle()}
        className="relative rounded-full p-2 text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high active:scale-90"
        aria-label="Open notifications"
      >
        <span className="material-symbols-outlined text-[#3b309e]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 z-[70] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-outline-variant/10 bg-surface-container-low shadow-[0px_18px_48px_rgba(59,48,158,0.18)]">
          <div className="flex items-center justify-between border-b border-outline-variant/10 px-5 py-4">
            <div>
              <h3 className="font-headline text-lg font-bold text-primary">Notifications</h3>
              <p className="text-xs font-medium text-on-surface-variant">
                Last 20 updates in your Echoes inbox
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleMarkAllAsRead()}
              disabled={!unreadCount || isMarkingRead}
              className="rounded-full bg-surface-container-high px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isMarkingRead ? 'Saving...' : 'Mark all as read'}
            </button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto px-3 py-3">
            {isLoading ? (
              <div className="px-3 py-10 text-center text-sm text-on-surface-variant">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-3 py-10 text-center text-sm text-on-surface-variant">
                No notifications yet.
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <article
                    key={notification.id}
                    className={`rounded-2xl px-4 py-3 transition-colors ${
                      notification.is_read
                        ? 'bg-background/70'
                        : 'bg-primary-container/10 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                          {formatNotificationLabel(notification.type)}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-on-surface">{notification.message}</p>
                      </div>
                      <div className="shrink-0 text-[11px] font-medium text-on-surface-variant">
                        {formatRelativeTime(notification.created_at)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
