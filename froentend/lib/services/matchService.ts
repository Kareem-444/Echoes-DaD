import api from '@/lib/api';
import type { Match, PaginatedResponse } from '@/lib/types';

export const matchService = {
  getMatches: (url = '/api/matches/'): Promise<PaginatedResponse<Match>> =>
    api.get<PaginatedResponse<Match>>(url).then((r) => r.data),

  generateMatches: (): Promise<Match[]> =>
    api.post<Match[]>('/api/matches/generate/').then((r) => r.data),
};
