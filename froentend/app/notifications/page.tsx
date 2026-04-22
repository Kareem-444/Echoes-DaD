'use client';

import { useCallback, useEffect, useState } from 'react';

import { AuthGuard } from '@/components/AuthGuard';
import { BottomNav } from '@/components/BottomNav';
import { Navbar } from '@/components/Navbar';
import { notificationService } from '@/lib/services/notificationService';
import type { NotificationType, StoredNotification } from '@/lib/types';

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [nextNotificationsUrl, setNextNotificationsUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (url?: string) => {
    const isNextPage = Boolean(url);
    if (isNextPage) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await notificationService.list(url);
      setNotifications((current) =>
        isNextPage ? [...current, ...response.results] : response.results
      );
      setNextNotificationsUrl(response.next);
      setError(null);
    } catch {
      setError(isNextPage ? 'Failed to load more notifications.' : 'Failed to load notifications.');
    } finally {
      if (isNextPage) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-surface font-body text-on-surface">
        <Navbar />

        <main className="mx-auto max-w-2xl px-4 pb-32 pt-24">
          <header className="mb-8">
            <h1 className="font-headline text-3xl font-extrabold text-primary">Notifications</h1>
            <p className="mt-2 text-sm text-on-surface-variant">Your latest Echoes updates.</p>
          </header>

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-lg bg-surface-container px-5 py-10 text-center text-sm text-on-surface-variant">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="rounded-lg bg-surface-container px-5 py-10 text-center text-sm text-error">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="rounded-lg bg-surface-container px-5 py-10 text-center text-sm text-on-surface-variant">
                No notifications yet.
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <article
                    key={notification.id}
                    className={`rounded-lg px-5 py-4 shadow-sm ${
                      notification.is_read ? 'bg-surface-container-low' : 'bg-primary-container/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                          {formatNotificationLabel(notification.type)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-on-surface">{notification.message}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-medium text-on-surface-variant">
                        {formatRelativeTime(notification.created_at)}
                      </span>
                    </div>
                  </article>
                ))}

                {nextNotificationsUrl && (
                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={() => fetchNotifications(nextNotificationsUrl)}
                      disabled={loadingMore}
                      className="rounded-full bg-surface-container-high px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingMore ? 'Loading...' : 'Load more'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <BottomNav activeTab="profile" />
      </div>
    </AuthGuard>
  );
}
