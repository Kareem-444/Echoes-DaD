import api from '@/lib/api';
import type { Message, PaginatedResponse } from '@/lib/types';

/**
 * ChatServiceInterface is exported to document the contract for future
 * WebSocket integration. The socket layer must satisfy this same shape.
 */
export interface ChatServiceInterface {
  getMessages: (matchId: string, url?: string) => Promise<PaginatedResponse<Message>>;
  sendMessage: (matchId: string, content: string) => Promise<Message>;
}

export const chatService: ChatServiceInterface = {
  getMessages: (matchId: string, url?: string): Promise<PaginatedResponse<Message>> =>
    api.get<PaginatedResponse<Message>>(url ?? `/api/chat/${matchId}/`).then((r) => r.data),

  sendMessage: (matchId: string, content: string): Promise<Message> =>
    api.post<Message>(`/api/chat/${matchId}/`, { content }).then((r) => r.data),
};
