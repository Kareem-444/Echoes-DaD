// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  anonymous_name: string;
  avatar_shape: 'circle' | 'hexagon' | 'triangle' | 'square';
  avatar_color: string;
  token_balance: number;
  echoes_shared: number;
  resonances: number;
  created_at: string;
  last_daily_claim: string | null;
}

// ─── Echo ─────────────────────────────────────────────────────────────────────

export interface EchoAuthor {
  anonymous_name: string;
  avatar: 'circle' | 'hexagon' | 'triangle' | 'square';
}

export interface Echo {
  id: string;
  content: string;
  author: EchoAuthor;
  created_at: string;
  resonance_count: number;
  mood?: string | null;
  expires_at?: string | null;
}

// ─── Match ────────────────────────────────────────────────────────────────────

export interface Match {
  id: string;
  user1: User;
  user2: User;
  echo1: Echo;
  echo2: Echo;
  harmony_score: number;
  created_at: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  match: string;
  sender: User;
  content: string;
  is_read: boolean;
  created_at: string;
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

export interface TokenBalance {
  balance: number;
  last_daily_claim: string | null;
}

export interface TokenTransaction {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface DailyRewardResponse {
  detail: string;
  balance: number;
  transaction: TokenTransaction;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}
