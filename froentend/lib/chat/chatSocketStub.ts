import { useEffect, useState } from 'react';
import type { Message } from '@/lib/types';
import { chatService } from '@/lib/services/chatService';

/**
 * FUTURE IMPLEMENTATION STUB:
 * This hook will eventually replace the simple HTTP chatService calls
 * with a real-time Django Channels WebSocket connection.
 * 
 * Target Architecture:
 * - Django Channels configures `ws/chat/<match_id>/`
 * - Frontend authenticates socket using JWT token
 * - Messages broadcast immediately
 * 
 * Usage in component:
 * const { messages, sendMessage, isConnected } = useChatSocket(matchId);
 */
export function useChatSocket(matchId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Fallback to initial HTTP load for now
  useEffect(() => {
    chatService.getMessages(matchId).then(setMessages);
    // STUB: const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${matchId}/?token=${jwt}`);
    // return () => ws.close();
  }, [matchId]);

  const sendMessage = async (content: string) => {
    // STUB: ws.send(JSON.stringify({ message: content }))
    const msg = await chatService.sendMessage(matchId, content);
    setMessages((prev) => [...prev, msg]);
    return msg;
  };

  return {
    messages,
    sendMessage,
    isConnected,
  };
}
