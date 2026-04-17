import api from '@/lib/api';
import type { AvatarShape, Echo, User } from '@/lib/types';

interface UpdateAppearancePayload {
  avatar_shape?: AvatarShape;
  avatar_color?: string;
}

export const userService = {
  getMe: (): Promise<User> =>
    api.get<User>('/api/auth/me/').then((r) => r.data),

  getMyEchoes: (): Promise<Echo[]> =>
    api.get<Echo[]>('/api/echoes/my/').then((r) => r.data),

  updateAppearance: (payload: UpdateAppearancePayload): Promise<User> =>
    api.patch<User>('/api/auth/me/', payload).then((r) => r.data),

  deleteAccount: (): Promise<void> =>
    api.delete('/api/auth/me/').then(() => undefined),
};
