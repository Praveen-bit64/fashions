export type Color = { name: string; hex: string; premium?: number };
export type Material = { name: string; description: string; premium: number };
export type SimpleOption = { id: string; label: string; premium?: number };

export const MATERIALS: Material[] = [
    { name: 'Cotton', description: 'Soft, breathable everyday wear', premium: 0 },
    { name: 'Linen', description: 'Light, airy summer favourite', premium: 200 },
    { name: 'Silk', description: 'Luxurious sheen for formal occasions', premium: 800 },
    { name: 'Velvet', description: 'Plush, rich evening glamour', premium: 600 },
    { name: 'Satin', description: 'Smooth, lustrous finish', premium: 500 },
    { name: 'Georgette', description: 'Flowy, elegant drape', premium: 300 },
    { name: 'Chiffon', description: 'Sheer, lightweight movement', premium: 350 },
    { name: 'Crêpe', description: 'Textured weave, modern flair', premium: 250 },
];

export const COLORS: Color[] = [
    { name: 'Ivory', hex: '#f5f5f4' },
    { name: 'Blush', hex: '#fce7f3' },
    { name: 'Sage', hex: '#86efac' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Midnight', hex: '#111827' },
    { name: 'Burgundy', hex: '#7f1d1d' },
    { name: 'Cobalt', hex: '#1e40af' },
    { name: 'Mustard', hex: '#ca8a04' },
    { name: 'Lavender', hex: '#c4b5fd' },
    { name: 'Rose Gold', hex: '#fda4af', premium: 150 },
    { name: 'Champagne', hex: '#fef3c7', premium: 100 },
    { name: 'Charcoal', hex: '#374151' },
];

export const SLEEVES: SimpleOption[] = [
    { id: 'sleeveless', label: 'Sleeveless' },
    { id: 'cap', label: 'Cap Sleeve' },
    { id: 'short', label: 'Short' },
    { id: 'three-quarter', label: '3/4 Length' },
    { id: 'full', label: 'Full Sleeve' },
    { id: 'puff', label: 'Puff', premium: 200 },
    { id: 'bell', label: 'Bell', premium: 250 },
];

export const NECKS: SimpleOption[] = [
    { id: 'round', label: 'Round' },
    { id: 'v', label: 'V-Neck' },
    { id: 'square', label: 'Square' },
    { id: 'boat', label: 'Boat' },
    { id: 'sweetheart', label: 'Sweetheart', premium: 250 },
    { id: 'halter', label: 'Halter', premium: 200 },
    { id: 'collar', label: 'Collared', premium: 150 },
];

export const LENGTHS: SimpleOption[] = [
    { id: 'mini', label: 'Mini' },
    { id: 'knee', label: 'Knee Length' },
    { id: 'midi', label: 'Midi' },
    { id: 'maxi', label: 'Maxi' },
    { id: 'floor', label: 'Floor Length', premium: 300 },
];

export const PATTERNS: SimpleOption[] = [
    { id: 'solid', label: 'Solid' },
    { id: 'floral', label: 'Floral', premium: 350 },
    { id: 'striped', label: 'Striped', premium: 150 },
    { id: 'polka', label: 'Polka Dot', premium: 200 },
    { id: 'geometric', label: 'Geometric', premium: 300 },
    { id: 'tie-dye', label: 'Tie-Dye', premium: 400 },
    { id: 'embroidered', label: 'Embroidered', premium: 600 },
];

export const SIZES: SimpleOption[] = [
    { id: 'XS', label: 'XS' },
    { id: 'S', label: 'S' },
    { id: 'M', label: 'M' },
    { id: 'L', label: 'L' },
    { id: 'XL', label: 'XL' },
    { id: 'XXL', label: 'XXL' },
];

export type TrendingDesign = {
    id: string;
    name: string;
    description: string;
    image: string;
    config: {
        material: string;
        color: string;
        sleeve: string;
        neck: string;
        length: string;
        pattern: string;
    };
};

export const TRENDING_DESIGNS: TrendingDesign[] = [
    {
        id: 'midnight-silk',
        name: 'Midnight Silk',
        description: 'Evening elegance',
        image: '/feature-prod-1.jpg',
        config: {
            material: 'Silk',
            color: 'Midnight',
            sleeve: 'cap',
            neck: 'v',
            length: 'maxi',
            pattern: 'solid',
        },
    },
    {
        id: 'summer-linen',
        name: 'Summer Linen',
        description: 'Breezy day wear',
        image: '/feature-prod-2.jpg',
        config: {
            material: 'Linen',
            color: 'Ivory',
            sleeve: 'short',
            neck: 'round',
            length: 'midi',
            pattern: 'floral',
        },
    },
    {
        id: 'rose-romance',
        name: 'Rose Romance',
        description: 'Soft & feminine',
        image: '/feature-prod-3.jpg',
        config: {
            material: 'Satin',
            color: 'Blush',
            sleeve: 'puff',
            neck: 'sweetheart',
            length: 'knee',
            pattern: 'solid',
        },
    },
    {
        id: 'emerald-statement',
        name: 'Emerald Statement',
        description: 'Bold & confident',
        image: '/feature-prod-1.jpg',
        config: {
            material: 'Velvet',
            color: 'Emerald',
            sleeve: 'three-quarter',
            neck: 'square',
            length: 'midi',
            pattern: 'solid',
        },
    },
];
