import { GoogleGenAI, Modality } from '@google/genai';
import {
    AiSafetyError,
    type AiProvider,
    type AiGenerateInput,
    type AiGenerateOutput,
} from './types';

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-image';

let _client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
    if (!_client) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error(
                'GEMINI_API_KEY is not set. Get one free at https://aistudio.google.com/apikey'
            );
        }
        _client = new GoogleGenAI({ apiKey });
    }
    return _client;
}

const geminiProvider: AiProvider = {
    name: 'gemini',
    async generate(input: AiGenerateInput): Promise<AiGenerateOutput> {
        const client = getClient();

        const parts = [
            { text: input.prompt },
            ...input.images.map((img) => ({
                inlineData: {
                    mimeType: img.mimeType,
                    data: img.buffer.toString('base64'),
                },
            })),
        ];

        let response;
        try {
            response = await client.models.generateContent({
                model: GEMINI_MODEL,
                contents: parts,
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gemini failed';
            const lower = message.toLowerCase();
            if (
                lower.includes('safety') ||
                lower.includes('blocked') ||
                lower.includes('prohibited')
            ) {
                throw new AiSafetyError(message);
            }
            throw err;
        }

        const candidate = response.candidates?.[0];
        const finishReason = candidate?.finishReason;
        if (finishReason && finishReason !== 'STOP') {
            throw new AiSafetyError(`Gemini stopped generation: ${finishReason}`);
        }

        const imagePart = candidate?.content?.parts?.find(
            (p) => p.inlineData?.data
        );
        const data = imagePart?.inlineData?.data;
        if (!data) {
            // Surface the text response (if any) for easier debugging
            const textPart = candidate?.content?.parts?.find((p) => p.text);
            throw new Error(
                `Gemini returned no image${textPart?.text ? `: ${textPart.text.slice(0, 200)}` : ''}`
            );
        }

        return { image: Buffer.from(data, 'base64') };
    },
};

export default geminiProvider;
