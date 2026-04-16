import api from '@/lib/api';
import type { Echo, User } from '@/lib/types';

export const userService = {
  getMe: (): Promise<User> =>
    api.get<User>('/api/auth/me/').then((r) => r.data),

  getMyEchoes: (): Promise<Echo[]> =>
    api.get<Echo[]>('/api/echoes/my/').then((r) => r.data),
};
