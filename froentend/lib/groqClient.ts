import 'server-only';

import fs from 'fs';
import path from 'path';

import Groq from 'groq-sdk';

let cachedClient: Groq | null = null;

function readKeyFromEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    return null;
  }

  const envContents = fs.readFileSync(envPath, 'utf8');
  const match = envContents.match(/^\s*GROQ_API_KEY\s*=\s*(.+)\s*$/m);

  if (!match) {
    return null;
  }

  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

function resolveGroqApiKey() {
  return readKeyFromEnvFile() || process.env.GROQ_API_KEY?.trim() || null;
}

export function getGroqClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = resolveGroqApiKey();

  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY in froentend/.env.local.');
  }

  cachedClient = new Groq({ apiKey });
  return cachedClient;
}
