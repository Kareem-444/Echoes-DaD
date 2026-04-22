import { NextResponse } from 'next/server';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';

import { getGroqClient } from '@/lib/groqClient';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type AuthenticatedUser = {
  id: string;
};

type RateLimitBucket = {
  count: number;
  windowStart: number;
};

const MODEL = 'llama-3.3-70b-versatile';
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimits = new Map<string, RateLimitBucket>();

const SYSTEM_PROMPT = `You are Echo Guide, a warm and empathetic AI companion 
inside Echoes â€” an anonymous social platform. Help users with:
- How to use Echoes features
- Understanding their matches and tokens
- Emotional support (gentle, non-judgmental)
- Encouraging them to share their thoughts
Keep responses short (2-3 sentences max). Warm, poetic tone.`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getBearerToken(req: Request) {
  const authorization = req.headers.get('authorization');
  const prefix = 'Bearer ';

  if (!authorization?.startsWith(prefix)) {
    return null;
  }

  const token = authorization.slice(prefix.length).trim();
  return token || null;
}

function validateMessages(body: unknown): ChatMessage[] | null {
  if (!isRecord(body) || !Array.isArray(body.messages)) {
    return null;
  }

  if (body.messages.length > MAX_MESSAGES) {
    return null;
  }

  const messages: ChatMessage[] = [];

  for (const message of body.messages) {
    if (!isRecord(message)) {
      return null;
    }

    const { role, content } = message;
    const hasValidRole = role === 'user' || role === 'assistant';
    const hasValidContent =
      typeof content === 'string' && content.length <= MAX_MESSAGE_LENGTH;

    if (!hasValidRole || !hasValidContent) {
      return null;
    }

    messages.push({ role, content });
  }

  return messages;
}

async function authenticateRequest(token: string): Promise<AuthenticatedUser | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

  if (!apiUrl) {
    console.error('AI route auth failed: NEXT_PUBLIC_API_URL is not configured.');
    return null;
  }

  const response = await fetch(`${apiUrl}/api/auth/me/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const user = await response.json();

  if (!isRecord(user) || typeof user.id !== 'string') {
    return null;
  }

  return { id: user.id };
}

function isRateLimited(userId: string) {
  const now = Date.now();
  const bucket = rateLimits.get(userId);

  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimits.set(userId, { count: 1, windowStart: now });
    return false;
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  bucket.count += 1;
  return false;
}

function toGroqMessages(messages: ChatMessage[]): ChatCompletionMessageParam[] {
  const history = messages.map((message): ChatCompletionMessageParam => {
    if (message.role === 'user') {
      return { role: 'user', content: message.content };
    }

    return { role: 'assistant', content: message.content };
  });

  return [{ role: 'system', content: SYSTEM_PROMPT }, ...history];
}

export async function POST(req: Request) {
  const token = getBearerToken(req);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  let user: AuthenticatedUser | null = null;

  try {
    user = await authenticateRequest(token);
  } catch (error) {
    console.error('AI route authentication error:', error);
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (isRateLimited(user.id)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  let requestBody: unknown;

  try {
    requestBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const messages = validateMessages(requestBody);
  if (!messages) {
    return NextResponse.json({ error: 'Invalid messages format.' }, { status: 400 });
  }

  try {
    const groq = getGroqClient();
    const chatCompletion = await groq.chat.completions.create({
      messages: toGroqMessages(messages),
      model: MODEL,
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "I am currently lost in the void. Let's try speaking again later.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Groq API Error:', error);
    return NextResponse.json({ error: 'AI assistant is unavailable.' }, { status: 500 });
  }
}
