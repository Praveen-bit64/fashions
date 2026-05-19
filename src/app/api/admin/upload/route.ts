import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { requireRole, ADMIN_WRITE, apiError } from '@/lib/api-auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB for product images
const ALLOWED_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
]);

export async function POST(req: Request) {
    const auth = await requireRole(ADMIN_WRITE);
    if (auth instanceof NextResponse) return auth;

    let form: FormData;
    try {
        form = await req.formData();
    } catch {
        return apiError('BAD_REQUEST', 'Invalid form data', 400);
    }

    const file = form.get('file');
    if (!file || typeof file === 'string') {
        return apiError('BAD_REQUEST', 'Missing file', 400);
    }
    if (!ALLOWED_TYPES.has(file.type)) {
        return apiError(
            'UNSUPPORTED_MEDIA_TYPE',
            'Only JPEG, PNG, and WEBP are allowed',
            415
        );
    }
    if (file.size > MAX_BYTES) {
        return apiError('TOO_LARGE', 'Image must be under 12 MB', 413);
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { url, publicId } = await uploadToCloudinary(buffer, 'product');
        return NextResponse.json({ ok: true, data: { url, publicId } });
    } catch (err) {
        console.error('[api/admin/upload]', err);
        return apiError('UPLOAD_FAILED', 'Upload failed', 500);
    }
}
