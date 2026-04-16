import { useEffect, useRef, useState } from 'react';

import type { Message } from '@/lib/types';
import { chatService } from '@/lib/services/chatService';

const SOCKET_RETRY_DELAY_MS = 3000;
const PENDING_TIMEOUT_MS = 10000;

interface SocketAck {
  type: 'chat_message_ack';
  client_id: string;
  message: Message;
  new_token_balance: number;
}

interface SocketError {
  type: 'chat_error';
  client_id?: string;
  detail: string;
}

interface SocketMessageEvent {
  type: 'chat_message';
  message: Message;
}

type SocketEvent = SocketAck | SocketError | SocketMessageEvent;

interface SendMessageResult {
  message: Message;
  newTokenBalance: number | null;
}

interface PendingMessage {
  reject: (error: Error) => void;
  resolve: (result: SendMessageResult) => void;
  timeoutId: number;
}

function buildChatSocketUrl(matchId: string, token: string) {
  const wsHost = (process.env.NEXT_PUBLIC_WS_URL || '127.0.0.1:8000')
    .replace(/^https?:\/\//, '')
    .replace(/^wss?:\/\//, '')
    .replace(/\/$/, '');

  return `ws://${wsHost}/ws/chat/${matchId}/?token=${encodeURIComponent(token)}`;
}

function upsertMessage(current: Message[], incoming: Message) {
  if (current.some((message) => message.id === incoming.id)) {
    return current;
  }

  return [...current, incoming].sort(
    (left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
  );
}

export function useChatSocket(matchId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);
  const pendingMessagesRef = useRef<Map<string, PendingMessage>>(new Map());

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      if (isMounted) {
        setLoading(true);
      }

      try {
        const loadedMessages = await chatService.getMessages(matchId);
        if (isMounted) {
          setMessages(loadedMessages);
          setLoadError(null);
        }
      } catch {
        if (isMounted) {
          setLoadError('Failed to load chat history.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [matchId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('access_token') || localStorage.getItem('echoes_token');
    if (!token) {
      setIsConnected(false);
      return;
    }

    shouldReconnectRef.current = true;
    const pendingMessages = pendingMessagesRef.current;

    const connect = () => {
      const socket = new WebSocket(buildChatSocketUrl(matchId, token));
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        let payload: SocketEvent;

        try {
          payload = JSON.parse(event.data) as SocketEvent;
        } catch {
          return;
        }

        if (payload.type === 'chat_message') {
          setMessages((current) => upsertMessage(current, payload.message));
          return;
        }

        if (payload.type === 'chat_message_ack') {
          const pending = pendingMessagesRef.current.get(payload.client_id);
          if (!pending) {
            return;
          }

          window.clearTimeout(pending.timeoutId);
          pendingMessagesRef.current.delete(payload.client_id);

          setMessages((current) => upsertMessage(current, payload.message));
          pending.resolve({
            message: payload.message,
            newTokenBalance: payload.new_token_balance,
          });

          return;
        }

        const detail = payload.detail || 'Failed to send message.';
        if (payload.client_id) {
          const pending = pendingMessagesRef.current.get(payload.client_id);
          if (pending) {
            window.clearTimeout(pending.timeoutId);
            pendingMessagesRef.current.delete(payload.client_id);
            pending.reject(new Error(detail));
          }
        }
      };

      socket.onerror = () => {
        socket.close();
      };

      socket.onclose = (event) => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        setIsConnected(false);

        if (!shouldReconnectRef.current || event.code === 4001 || event.code === 4003) {
          return;
        }

        reconnectTimeoutRef.current = window.setTimeout(connect, SOCKET_RETRY_DELAY_MS);
      };
    };

    connect();

    return () => {
      shouldReconnectRef.current = false;

      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      pendingMessages.forEach((pending) => {
        window.clearTimeout(pending.timeoutId);
        pending.reject(new Error('Chat connection closed.'));
      });
      pendingMessages.clear();

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [matchId]);

  const sendMessage = async (content: string): Promise<SendMessageResult> => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      throw new Error('Message cannot be empty.');
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const clientId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      return new Promise<SendMessageResult>((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
          pendingMessagesRef.current.delete(clientId);
          reject(new Error('Chat server did not respond in time.'));
        }, PENDING_TIMEOUT_MS);

        pendingMessagesRef.current.set(clientId, {
          resolve,
          reject,
          timeoutId,
        });

        socketRef.current?.send(JSON.stringify({ content: trimmedContent, client_id: clientId }));
      });
    }

    const message = await chatService.sendMessage(matchId, trimmedContent);
    setMessages((current) => upsertMessage(current, message));

    return {
      message,
      newTokenBalance: null,
    };
  };

  return {
    messages,
    sendMessage,
    isConnected,
    loading,
    loadError,
  };
}
