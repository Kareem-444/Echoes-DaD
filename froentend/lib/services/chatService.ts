import api from '@/lib/api';
import type { Message } from '@/lib/types';

/**
 * ChatServiceInterface is exported to document the contract for future
 * WebSocket integration. The socket layer must satisfy this same shape.
 */
export interface ChatServiceInterface {
  getMessages: (matchId: string) => Promise<Message[]>;
  sendMessage: (matchId: string, content: string) => Promise<Message>;
}

export const chatService: ChatServiceInterface = {
  getMessages: (matchId: string): Promise<Message[]> =>
    api.get<Message[]>(`/api/chat/${matchId}/`).then((r) => r.data),

  sendMessage: (matchId: string, content: string): Promise<Message> =>
    api.post<Message>(`/api/chat/${matchId}/`, { content }).then((r) => r.data),
};
