import Groq from 'groq-sdk';

/**
 * Server-side singleton instance of the Groq client.
 * This should ONLY be imported or used in server components or API routes.
 */
const apiKey = process.env.GROQ_API_KEY;

export const groq = new Groq({
  apiKey: apiKey || 'missing-key', 
});
