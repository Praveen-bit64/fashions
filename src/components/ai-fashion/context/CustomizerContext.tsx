'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { useAppSelector } from '@/redux/hooks';
import {
    COLORS,
    LENGTHS,
    MATERIALS,
    NECKS,
    PATTERNS,
    SIZES,
    SLEEVES,
    type TrendingDesign,
} from '../data/options';

export type AiStatus = 'idle' | 'uploading' | 'generating' | 'done' | 'error';
export type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

export type CustomizerProduct = {
    id: string;
    title: string;
    brand: string;
    image: string;
    basePrice: number;
};

export type Usage = {
    kind: 'anon' | 'user';
    remaining: number;
    limit: number;
    window: 'lifetime' | '1d';
};

type CustomizerState = {
    product: CustomizerProduct;
    material: string;
    color: string;
    sleeve: string;
    neck: string;
    length: string;
    pattern: string;
    size: string;

    zoom: number;
    rotation: number;

    // Local previews (for instant UI) + remote URLs (after Cloudinary upload)
    faceImagePreview: string | null;
    faceImageUrl: string | null;
    faceUploadStatus: UploadStatus;

    bodyImagePreview: string | null;
    bodyImageUrl: string | null;
    bodyUploadStatus: UploadStatus;

    generatedImage: string | null;
    aiStatus: AiStatus;
    aiError: string | null;

    usage: Usage | null;
    refreshUsage: () => Promise<void>;

    totalPremium: number;
    totalPrice: number;
    selectedColorHex: string;

    setMaterial: (v: string) => void;
    setColor: (v: string) => void;
    setSleeve: (v: string) => void;
    setNeck: (v: string) => void;
    setLength: (v: string) => void;
    setPattern: (v: string) => void;
    setSize: (v: string) => void;

    setZoom: (v: number) => void;
    setRotation: (v: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    rotateLeft: () => void;
    rotateRight: () => void;
    resetTransform: () => void;

    uploadFace: (file: File) => Promise<void>;
    uploadBody: (file: File) => Promise<void>;
    clearFace: () => void;
    clearBody: () => void;

    generateAiPreview: () => Promise<void>;
    clearAiPreview: () => void;

    applyPreset: (design: TrendingDesign) => void;
    resetAll: () => void;
};

const CustomizerContext = createContext<CustomizerState | null>(null);

const DEFAULTS = {
    material: 'Cotton',
    color: 'Ivory',
    sleeve: 'short',
    neck: 'round',
    length: 'knee',
    pattern: 'solid',
    size: 'M',
};

const readPreview = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
    });

async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
        throw new Error(data?.error ?? 'Upload failed');
    }
    const data = (await res.json()) as { url: string };
    return data.url;
}

export function CustomizerProvider({
    product,
    children,
}: {
    product: CustomizerProduct;
    children: ReactNode;
}) {
    // Pull current user from Redux for identity header
    const user = useAppSelector((s) => s.auth.user);

    const [material, setMaterial] = useState(DEFAULTS.material);
    const [color, setColor] = useState(DEFAULTS.color);
    const [sleeve, setSleeve] = useState(DEFAULTS.sleeve);
    const [neck, setNeck] = useState(DEFAULTS.neck);
    const [length, setLength] = useState(DEFAULTS.length);
    const [pattern, setPattern] = useState(DEFAULTS.pattern);
    const [size, setSize] = useState(DEFAULTS.size);

    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    const [faceImagePreview, setFaceImagePreview] = useState<string | null>(null);
    const [faceImageUrl, setFaceImageUrl] = useState<string | null>(null);
    const [faceUploadStatus, setFaceUploadStatus] = useState<UploadStatus>('idle');

    const [bodyImagePreview, setBodyImagePreview] = useState<string | null>(null);
    const [bodyImageUrl, setBodyImageUrl] = useState<string | null>(null);
    const [bodyUploadStatus, setBodyUploadStatus] = useState<UploadStatus>('idle');

    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
    const [aiError, setAiError] = useState<string | null>(null);

    const [usage, setUsage] = useState<Usage | null>(null);

    const identityHeaders = useMemo<Record<string, string>>(() => {
        const headers: Record<string, string> = {};
        if (user) headers['x-user-id'] = user.id;
        return headers;
    }, [user]);

    const refreshUsage = useCallback(async () => {
        try {
            const res = await fetch('/api/usage', { headers: identityHeaders });
            if (!res.ok) return;
            const data = (await res.json()) as Usage;
            setUsage(data);
        } catch {
            // ignore — usage display is best-effort
        }
    }, [identityHeaders]);

    useEffect(() => {
        void refreshUsage();
    }, [refreshUsage]);

    const totalPremium = useMemo(() => {
        let p = 0;
        p += MATERIALS.find((m) => m.name === material)?.premium ?? 0;
        p += COLORS.find((c) => c.name === color)?.premium ?? 0;
        p += SLEEVES.find((s) => s.id === sleeve)?.premium ?? 0;
        p += NECKS.find((n) => n.id === neck)?.premium ?? 0;
        p += LENGTHS.find((l) => l.id === length)?.premium ?? 0;
        p += PATTERNS.find((pt) => pt.id === pattern)?.premium ?? 0;
        p += SIZES.find((s) => s.id === size)?.premium ?? 0;
        return p;
    }, [material, color, sleeve, neck, length, pattern, size]);

    const totalPrice = product.basePrice + totalPremium;

    const selectedColorHex = useMemo(
        () => COLORS.find((c) => c.name === color)?.hex ?? '#ffffff',
        [color]
    );

    const zoomIn = useCallback(() => setZoom((z) => Math.min(2, z + 0.2)), []);
    const zoomOut = useCallback(() => setZoom((z) => Math.max(0.6, z - 0.2)), []);
    const rotateLeft = useCallback(() => setRotation((r) => r - 15), []);
    const rotateRight = useCallback(() => setRotation((r) => r + 15), []);
    const resetTransform = useCallback(() => {
        setZoom(1);
        setRotation(0);
    }, []);

    const uploadFace = useCallback(async (file: File) => {
        setAiError(null);
        setFaceUploadStatus('uploading');
        try {
            const preview = await readPreview(file);
            setFaceImagePreview(preview);
            const url = await uploadFile(file);
            setFaceImageUrl(url);
            setFaceUploadStatus('done');
        } catch (err) {
            setFaceImagePreview(null);
            setFaceImageUrl(null);
            setFaceUploadStatus('error');
            setAiError(err instanceof Error ? err.message : 'Face upload failed');
        }
    }, []);

    const uploadBody = useCallback(async (file: File) => {
        setAiError(null);
        setBodyUploadStatus('uploading');
        try {
            const preview = await readPreview(file);
            setBodyImagePreview(preview);
            const url = await uploadFile(file);
            setBodyImageUrl(url);
            setBodyUploadStatus('done');
        } catch (err) {
            setBodyImagePreview(null);
            setBodyImageUrl(null);
            setBodyUploadStatus('error');
            setAiError(err instanceof Error ? err.message : 'Body upload failed');
        }
    }, []);

    const clearFace = useCallback(() => {
        setFaceImagePreview(null);
        setFaceImageUrl(null);
        setFaceUploadStatus('idle');
    }, []);

    const clearBody = useCallback(() => {
        setBodyImagePreview(null);
        setBodyImageUrl(null);
        setBodyUploadStatus('idle');
    }, []);

    const clearAiPreview = useCallback(() => {
        setGeneratedImage(null);
        setAiStatus('idle');
        setAiError(null);
        clearFace();
        clearBody();
    }, [clearFace, clearBody]);

    const generateAiPreview = useCallback(async () => {
        // Either face or body must be uploaded (and done uploading) — though
        // the API will also accept zero uploads for a pure style edit.
        if (
            faceUploadStatus === 'uploading' ||
            bodyUploadStatus === 'uploading'
        ) {
            setAiError('Please wait for uploads to finish');
            setAiStatus('error');
            return;
        }

        setAiStatus('generating');
        setAiError(null);
        try {
            const res = await fetch('/api/ai-preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...identityHeaders,
                },
                body: JSON.stringify({
                    productId: product.id,
                    productImageUrl: product.image,
                    bodyImageUrl,
                    faceImageUrl,
                    customization: {
                        material,
                        color,
                        sleeve,
                        neck,
                        length,
                        pattern,
                        size,
                    },
                }),
            });

            const data = (await res.json()) as
                | { success: true; imageUrl: string }
                | { success: false; error: string; code?: string };

            if (!res.ok || !data.success) {
                throw new Error(
                    'error' in data ? data.error : 'Generation failed'
                );
            }

            setGeneratedImage(data.imageUrl);
            setAiStatus('done');
            void refreshUsage();
        } catch (err) {
            setAiError(
                err instanceof Error ? err.message : 'Unexpected error occurred'
            );
            setAiStatus('error');
            void refreshUsage();
        }
    }, [
        product.id,
        product.image,
        bodyImageUrl,
        faceImageUrl,
        material,
        color,
        sleeve,
        neck,
        length,
        pattern,
        size,
        faceUploadStatus,
        bodyUploadStatus,
        identityHeaders,
        refreshUsage,
    ]);

    const applyPreset = useCallback((design: TrendingDesign) => {
        setMaterial(design.config.material);
        setColor(design.config.color);
        setSleeve(design.config.sleeve);
        setNeck(design.config.neck);
        setLength(design.config.length);
        setPattern(design.config.pattern);
    }, []);

    const resetAll = useCallback(() => {
        setMaterial(DEFAULTS.material);
        setColor(DEFAULTS.color);
        setSleeve(DEFAULTS.sleeve);
        setNeck(DEFAULTS.neck);
        setLength(DEFAULTS.length);
        setPattern(DEFAULTS.pattern);
        setSize(DEFAULTS.size);
        setZoom(1);
        setRotation(0);
        clearAiPreview();
    }, [clearAiPreview]);

    const value: CustomizerState = {
        product,
        material,
        color,
        sleeve,
        neck,
        length,
        pattern,
        size,
        zoom,
        rotation,
        faceImagePreview,
        faceImageUrl,
        faceUploadStatus,
        bodyImagePreview,
        bodyImageUrl,
        bodyUploadStatus,
        generatedImage,
        aiStatus,
        aiError,
        usage,
        refreshUsage,
        totalPremium,
        totalPrice,
        selectedColorHex,
        setMaterial,
        setColor,
        setSleeve,
        setNeck,
        setLength,
        setPattern,
        setSize,
        setZoom,
        setRotation,
        zoomIn,
        zoomOut,
        rotateLeft,
        rotateRight,
        resetTransform,
        uploadFace,
        uploadBody,
        clearFace,
        clearBody,
        generateAiPreview,
        clearAiPreview,
        applyPreset,
        resetAll,
    };

    return (
        <CustomizerContext.Provider value={value}>
            {children}
        </CustomizerContext.Provider>
    );
}

export function useCustomizer(): CustomizerState {
    const ctx = useContext(CustomizerContext);
    if (!ctx) {
        throw new Error('useCustomizer must be used inside CustomizerProvider');
    }
    return ctx;
}
