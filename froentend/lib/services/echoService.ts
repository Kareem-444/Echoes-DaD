import api from '@/lib/api';
import type { BoostEchoResponse, Echo, ResonateEchoResponse } from '@/lib/types';

export const echoService = {
  getEchoes: (): Promise<Echo[]> =>
    api.get<Echo[]>('/api/echoes/').then((r) => r.data),

  createEcho: (content: string, mood?: string): Promise<Echo> =>
    api.post<Echo>('/api/echoes/', { content, mood }).then((r) => r.data),

  resonate: (echoId: string): Promise<ResonateEchoResponse> =>
    api.post<ResonateEchoResponse>(`/api/echoes/${echoId}/resonate/`).then((r) => r.data),

  boostEcho: (echoId: string): Promise<BoostEchoResponse> =>
    api.post<BoostEchoResponse>(`/api/echoes/${echoId}/boost/`).then((r) => r.data),

  getTodayPrompt: (): Promise<{ text: string; date: string }> =>
    api.get<{ text: string; date: string }>('/api/echoes/prompts/today/').then((r) => r.data),
};
