import api from '@/lib/api';
import type { StoredNotification } from '@/lib/types';

export const notificationService = {
  list: (): Promise<StoredNotification[]> =>
    api.get<StoredNotification[]>('/api/notifications/').then((response) => response.data),

  markAllAsRead: (): Promise<void> =>
    api.post('/api/notifications/read/').then(() => undefined),
};
