export type AiInputImage = {
    /** Raw image bytes */
    buffer: Buffer;
    /** MIME type, e.g. "image/png", "image/jpeg" */
    mimeType: string;
    /** Human-readable name (debugging only) */
    name: string;
};

export type AiGenerateInput = {
    prompt: string;
    images: AiInputImage[];
};

export type AiGenerateOutput = {
    /** PNG/JPEG bytes of the generated image */
    image: Buffer;
};

export type AiProviderName = 'openai' | 'gemini' | 'pollinations';

/**
 * Thrown by providers to signal a moderation / safety rejection.
 * The route handler translates these to 422.
 */
export class AiSafetyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AiSafetyError';
    }
}

export interface AiProvider {
    name: AiProviderName;
    generate(input: AiGenerateInput): Promise<AiGenerateOutput>;
}
