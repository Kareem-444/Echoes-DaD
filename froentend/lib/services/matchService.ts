import api from '@/lib/api';
import type { Match } from '@/lib/types';

export const matchService = {
  getMatches: (): Promise<Match[]> =>
    api.get<Match[]>('/api/matches/').then((r) => r.data),

  generateMatches: (): Promise<Match[]> =>
    api.post<Match[]>('/api/matches/generate/').then((r) => r.data),
};
