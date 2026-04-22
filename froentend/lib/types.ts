// ─── User ────────────────────────────────────────────────────────────────────

export type AvatarShape = 'circle' | 'hexagon' | 'triangle' | 'square';

export interface PublicUser {
  id: string;
  anonymous_name: string;
  avatar_shape: AvatarShape;
  avatar_color: string;
}

export interface User extends PublicUser {
  email: string;
  token_balance: number;
  echoes_shared: number;
  resonances: number;
  created_at: string;
  last_daily_claim: string | null;
}

// ─── Echo ─────────────────────────────────────────────────────────────────────

export type EchoAuthor = PublicUser;

export interface Echo {
  id: string;
  content: string;
  author: EchoAuthor;
  created_at: string;
  resonance_count: number;
  mood?: string | null;
  expires_at?: string | null;
  is_boosted: boolean;
  boost_count: number;
}

export interface ResonateEchoResponse extends Echo {
  milestone_reached?: boolean;
  milestone_value?: number;
}

// ─── Match ────────────────────────────────────────────────────────────────────

export interface Match {
  id: string;
  user1: PublicUser;
  user2: PublicUser;
  echo1: Echo;
  echo2: Echo;
  harmony_score: number;
  created_at: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  match: string;
  sender: PublicUser;
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

export interface BoostEchoResponse {
  detail: string;
  new_expires_at: string;
  new_token_balance: number;
  boost_count: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// Notifications

export type NotificationType = 'chat_message' | 'new_match' | 'resonance_milestone';

export interface StoredNotification {
  id: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatMessageNotification {
  type: 'chat_message';
  match_id: string;
  sender_anonymous_name: string;
  content: string;
  timestamp: string;
}

export interface NewMatchNotification {
  type: 'new_match';
  match_id: string;
  harmony_score: number;
  anonymous_name: string;
}

export interface ResonanceMilestoneNotification {
  type: 'resonance_milestone';
  echo_id: string;
  milestone: number;
  echo_preview: string;
}

export type NotificationPayload =
  | ChatMessageNotification
  | NewMatchNotification
  | ResonanceMilestoneNotification;
