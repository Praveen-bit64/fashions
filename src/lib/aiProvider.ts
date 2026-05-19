import type { AiProvider, AiProviderName } from './providers/types';
import openaiProvider from './providers/openai';
import geminiProvider from './providers/gemini';
import pollinationsProvider from './providers/pollinations';

const PROVIDERS: Record<AiProviderName, AiProvider> = {
    openai: openaiProvider,
    gemini: geminiProvider,
    pollinations: pollinationsProvider,
};

/**
 * Returns the AI provider selected by the `AI_PROVIDER` env var.
 * Defaults to `pollinations` (truly free, no card) for safe local dev.
 */
export function getAiProvider(): AiProvider {
    const name = (process.env.AI_PROVIDER ?? 'pollinations') as AiProviderName;
    const provider = PROVIDERS[name];
    if (!provider) {
        throw new Error(
            `Unknown AI_PROVIDER "${name}". Expected one of: ${Object.keys(PROVIDERS).join(', ')}`
        );
    }
    return provider;
}

export { AiSafetyError } from './providers/types';
export type { AiProvider, AiProviderName } from './providers/types';
