import { NextResponse } from 'next/server';
import { groq } from '@/lib/groqClient';

// Use the recommended model for general tasks
const MODEL = 'llama3-8b-8192';

const SYSTEM_PROMPT = `You are Echo Guide, a warm and empathetic AI companion 
inside Echoes — an anonymous social platform. Help users with:
- How to use Echoes features
- Understanding their matches and tokens
- Emotional support (gentle, non-judgmental)
- Encouraging them to share their thoughts
Keep responses short (2-3 sentences max). Warm, poetic tone.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Format messages for Groq API
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }))
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages as any,
      model: MODEL,
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "I am currently lost in the void. Let's try speaking again later.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Groq API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
