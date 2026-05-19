import { toFile } from 'openai';
import { getOpenAI, IMAGE_MODEL } from '../openai';
import {
    AiSafetyError,
    type AiProvider,
    type AiGenerateInput,
    type AiGenerateOutput,
} from './types';

const openaiProvider: AiProvider = {
    name: 'openai',
    async generate(input: AiGenerateInput): Promise<AiGenerateOutput> {
        const openai = getOpenAI();
        const files = await Promise.all(
            input.images.map((img) =>
                toFile(img.buffer, img.name, { type: img.mimeType })
            )
        );

        try {
            const result = await openai.images.edit({
                model: IMAGE_MODEL,
                image: files,
                prompt: input.prompt,
                size: '1024x1024',
                quality: 'medium',
                n: 1,
            });

            const b64 = result.data?.[0]?.b64_json;
            if (!b64) throw new Error('OpenAI returned no image');

            return { image: Buffer.from(b64, 'base64') };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'OpenAI failed';
            const lower = message.toLowerCase();
            if (lower.includes('safety') || lower.includes('moderation')) {
                throw new AiSafetyError(message);
            }
            throw err;
        }
    },
};

export default openaiProvider;
