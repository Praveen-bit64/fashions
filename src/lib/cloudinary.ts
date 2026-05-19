import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export type CloudinaryUploadKind = 'user-upload' | 'ai-generated' | 'product';

const FOLDERS: Record<CloudinaryUploadKind, string> = {
    'user-upload': 'fashion/user-uploads',
    'ai-generated': 'fashion/ai-generated',
    'product': 'fashion/products',
};

/**
 * Upload a file or base64 buffer to Cloudinary.
 * User uploads expire after 1 day; generated previews after 30 days.
 */
export async function uploadToCloudinary(
    data: string | Buffer,
    kind: CloudinaryUploadKind
): Promise<{ url: string; publicId: string }> {
    const payload =
        Buffer.isBuffer(data) ? `data:image/png;base64,${data.toString('base64')}` : data;

    const result = await cloudinary.uploader.upload(payload, {
        folder: FOLDERS[kind],
        resource_type: 'image',
        // Sensible defaults — strip metadata, auto-format, limit size
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        // Auto-expire user-uploaded photos to respect privacy
        ...(kind === 'user-upload'
            ? { tags: ['expires-1d'] }
            : kind === 'ai-generated'
                ? { tags: ['ai-generated'] }
                : { tags: ['product'] }),
    });

    return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error('[cloudinary] delete failed', publicId, err);
    }
}

export { cloudinary };
