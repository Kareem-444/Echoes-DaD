import api from '@/lib/api';
import type { TokenBalance, DailyRewardResponse } from '@/lib/types';

export const tokenService = {
  getBalance: (): Promise<TokenBalance> =>
    api.get<TokenBalance>('/api/tokens/balance/').then((r) => r.data),

  claimDaily: (): Promise<DailyRewardResponse> =>
    api.post<DailyRewardResponse>('/api/tokens/daily/').then((r) => r.data),
};
