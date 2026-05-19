import OpenAI from 'openai';

export const IMAGE_MODEL = 'gpt-image-1';

let _client: OpenAI | null = null;

/**
 * Lazy-instantiate the OpenAI client so we don't crash at module load
 * when AI_PROVIDER=gemini (i.e. when OPENAI_API_KEY is intentionally absent).
 */
export function getOpenAI(): OpenAI {
    if (!_client) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error(
                'OPENAI_API_KEY is not set. Either set AI_PROVIDER=gemini or add an OpenAI key to .env.local'
            );
        }
        _client = new OpenAI({ apiKey });
    }
    return _client;
}
