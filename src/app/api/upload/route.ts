import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
]);

export async function POST(req: Request) {
    let form: FormData;
    try {
        form = await req.formData();
    } catch {
        return NextResponse.json(
            { success: false, error: 'Invalid form data' },
            { status: 400 }
        );
    }

    const file = form.get('file');
    if (!file || typeof file === 'string') {
        return NextResponse.json(
            { success: false, error: 'Missing file' },
            { status: 400 }
        );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
            { success: false, error: 'Only JPEG/PNG/WEBP/HEIC images are allowed' },
            { status: 415 }
        );
    }

    if (file.size > MAX_BYTES) {
        return NextResponse.json(
            { success: false, error: 'Image must be under 8 MB' },
            { status: 413 }
        );
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const { url, publicId } = await uploadToCloudinary(buffer, 'user-upload');
        return NextResponse.json({ success: true, url, publicId });
    } catch (err) {
        console.error('[api/upload] failed', err);
        return NextResponse.json(
            { success: false, error: 'Upload failed' },
            { status: 500 }
        );
    }
}
