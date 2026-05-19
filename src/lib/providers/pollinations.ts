import type {
    AiProvider,
    AiGenerateInput,
    AiGenerateOutput,
} from './types';

const POLLINATIONS_MODEL = process.env.POLLINATIONS_MODEL ?? 'flux';

/**
 * Pollinations.ai — free, no API key required.
 *
 * Caveat: this is a text-to-image provider. The `input.images` reference
 * photos are intentionally ignored — Pollinations cannot do face/body
 * try-on. You'll get a stylised generation of the customised dress
 * rendered on a model, not on the user's own body.
 *
 * Useful for testing the end-to-end pipeline without paying anything.
 */
const pollinationsProvider: AiProvider = {
    name: 'pollinations',
    async generate(input: AiGenerateInput): Promise<AiGenerateOutput> {
        const seed = Math.floor(Math.random() * 1_000_000);
        const params = new URLSearchParams({
            width: '1024',
            height: '1024',
            model: POLLINATIONS_MODEL,
            nologo: 'true',
            enhance: 'true',
            seed: String(seed),
        });

        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
            input.prompt
        )}?${params.toString()}`;

        const res = await fetch(url, {
            // Pollinations can be slow on cold-start
            signal: AbortSignal.timeout(45_000),
        });

        if (!res.ok) {
            throw new Error(`Pollinations returned HTTP ${res.status}`);
        }

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.byteLength < 1000) {
            throw new Error('Pollinations returned an empty / tiny image');
        }

        return { image: buffer };
    },
};

export default pollinationsProvider;
