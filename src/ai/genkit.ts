import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Robust API key resolution for the AI Studio environment.
 * Checks server-side environment variables with priority.
 */
export const getGeminiApiKey = (): string | undefined => {
  const key = process.env.GEMINI_API_KEY || 
              process.env.GOOGLE_GENAI_API_KEY || 
              process.env.GOOGLE_API_KEY || 
              process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (key && key.length > 5 && !key.includes('placeholder') && !key.includes('MY_GEMINI_API_KEY')) {
    return key.trim();
  }
  return undefined;
};

const apiKey = getGeminiApiKey();

export const ai = genkit({
  plugins: [
    googleAI(apiKey ? { apiKey } : {})
  ],
  model: 'googleai/gemini-2.5-flash',
});

// Suppress OTel telemetry noise
try {
  if ((ai as any).telemetry) {
     (ai as any).telemetry.ignoreFailedSpan = true;
  }
} catch {
  // Silently ignore telemetry adjustment failures
}
