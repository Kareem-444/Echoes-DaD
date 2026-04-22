import api from '@/lib/api';
import type { PaginatedResponse, StoredNotification } from '@/lib/types';

export const notificationService = {
  list: (url = '/api/notifications/'): Promise<PaginatedResponse<StoredNotification>> =>
    api.get<PaginatedResponse<StoredNotification>>(url).then((response) => response.data),

  markAllAsRead: (): Promise<void> =>
    api.post('/api/notifications/read/').then(() => undefined),
};
