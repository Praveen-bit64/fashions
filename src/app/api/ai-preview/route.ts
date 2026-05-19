import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { uploadToCloudinary } from '@/lib/cloudinary';
import {
    checkAnonQuota,
    consumeAnonQuota,
    userDailyLimiter,
} from '@/lib/ratelimit';
import { getIdentity } from '@/lib/requestIdentity';
import { getAiProvider, AiSafetyError } from '@/lib/aiProvider';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const maxDuration = 60;

type CustomizationPayload = {
    material: string;
    color: string;
    sleeve: string;
    neck: string;
    length: string;
    pattern: string;
    size: string;
};

type RequestBody = {
    productId: string;
    productImageUrl: string;
    bodyImageUrl?: string | null;
    faceImageUrl?: string | null;
    customization: CustomizationPayload;
};

type FetchedImage = {
    buffer: Buffer;
    mimeType: string;
    name: string;
};

const buildPrompt = (c: CustomizationPayload, hasBody: boolean): string => {
    const base = [
        `${c.color.toLowerCase()} ${c.material.toLowerCase()} dress`,
        c.pattern !== 'solid' ? `with a ${c.pattern} pattern` : '',
        `${c.sleeve === 'sleeveless' ? 'sleeveless' : `${c.sleeve.replace('-', ' ')} sleeves`}`,
        `a ${c.neck.replace('-', ' ')} neckline`,
        `${c.length} length`,
    ]
        .filter(Boolean)
        .join(', ');

    if (hasBody) {
        return [
            'A photorealistic editorial fashion photograph.',
            `Show the person from the second reference image wearing a custom-tailored ${base}.`,
            "Keep the person's face, body proportions, skin tone, and pose exactly as in the reference.",
            'Soft natural studio lighting, neutral background, magazine-quality.',
        ].join(' ');
    }

    return [
        'A photorealistic editorial product photograph.',
        `Render the dress from the reference image re-imagined as a ${base}.`,
        'Maintain the original silhouette and fit. Soft studio lighting, neutral background, magazine-quality.',
    ].join(' ');
};

const mimeFromExt = (ext: string): string => {
    switch (ext.toLowerCase()) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.webp':
            return 'image/webp';
        case '.gif':
            return 'image/gif';
        default:
            return 'image/png';
    }
};

async function loadImage(
    urlOrPath: string,
    name: string
): Promise<FetchedImage> {
    // Absolute URL → fetch over HTTP
    if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
        const res = await fetch(urlOrPath);
        if (!res.ok) throw new Error(`Failed to fetch ${name}: ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        return {
            buffer: Buffer.from(arrayBuffer),
            mimeType: res.headers.get('content-type') ?? 'image/png',
            name,
        };
    }

    // Relative path → read from /public on disk
    const relPath = urlOrPath.startsWith('/') ? urlOrPath.slice(1) : urlOrPath;
    const fullPath = join(process.cwd(), 'public', relPath);
    const buffer = await readFile(fullPath);
    return {
        buffer,
        mimeType: mimeFromExt(extname(relPath)),
        name,
    };
}

export async function POST(req: Request) {
    // 1. Quota check
    const identity = getIdentity(req);
    if (identity.kind === 'anon') {
        const check = await checkAnonQuota(identity.ip);
        if (!check.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Free preview limit reached. Sign in to continue.',
                    code: 'QUOTA_EXCEEDED_ANON',
                },
                { status: 429 }
            );
        }
    } else {
        const { success } = await userDailyLimiter.limit(identity.id);
        if (!success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Daily preview limit reached. Resets in 24 hours.',
                    code: 'QUOTA_EXCEEDED_USER',
                },
                { status: 429 }
            );
        }
    }

    // 2. Validate input
    let body: RequestBody;
    try {
        body = (await req.json()) as RequestBody;
    } catch {
        return NextResponse.json(
            { success: false, error: 'Invalid JSON payload' },
            { status: 400 }
        );
    }

    if (!body.productImageUrl) {
        return NextResponse.json(
            { success: false, error: 'productImageUrl is required' },
            { status: 400 }
        );
    }

    const hasBody = Boolean(body.bodyImageUrl);

    // 3. Pull reference images (HTTP URLs OR local /public paths)
    let images: FetchedImage[];
    try {
        const productImage = await loadImage(body.productImageUrl, 'product.png');
        if (hasBody && body.bodyImageUrl) {
            const bodyImage = await loadImage(body.bodyImageUrl, 'body.png');
            images = [productImage, bodyImage];
        } else {
            images = [productImage];
        }
    } catch (err) {
        console.error('[api/ai-preview] load reference failed', err);
        return NextResponse.json(
            { success: false, error: 'Could not load reference images' },
            { status: 502 }
        );
    }

    // 4. Generate via the configured AI provider
    const provider = getAiProvider();
    let generatedBuffer: Buffer;
    try {
        const result = await provider.generate({
            prompt: buildPrompt(body.customization, hasBody),
            images,
        });
        generatedBuffer = result.image;
    } catch (err: unknown) {
        console.error(`[api/ai-preview] provider=${provider.name} failed`, err);
        if (err instanceof AiSafetyError) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        'This image could not be processed by our safety filters. Please try a different photo.',
                },
                { status: 422 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Generation failed. Please try again.' },
            { status: 502 }
        );
    }

    // 5. Persist to Cloudinary
    let imageUrl: string;
    try {
        const { url } = await uploadToCloudinary(generatedBuffer, 'ai-generated');
        imageUrl = url;
    } catch (err) {
        console.error('[api/ai-preview] cloudinary upload failed', err);
        return NextResponse.json(
            { success: false, error: 'Could not save generated image' },
            { status: 500 }
        );
    }

    // 6. Consume anonymous quota only after success
    if (identity.kind === 'anon') {
        await consumeAnonQuota(identity.ip);
    }

    // 7. Persist the generation record. Failures here are non-fatal — the
    //    customer already has their image; we just lose admin analytics.
    if (body.productId) {
        try {
            await prisma.aiCustomization.create({
                data: {
                    basedOnProductId: body.productId,
                    config: body.customization as unknown as object,
                    faceImageUrl: body.faceImageUrl ?? null,
                    bodyImageUrl: body.bodyImageUrl ?? null,
                    generatedUrl: imageUrl,
                    provider: provider.name,
                },
            });
        } catch (err) {
            console.error('[api/ai-preview] persist aiCustomization failed', err);
        }
    }

    return NextResponse.json({
        success: true,
        provider: provider.name,
        imageUrl,
        appliedCustomization: body.customization,
    });
}
