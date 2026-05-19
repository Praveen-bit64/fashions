import { z } from 'zod';

/**
 * Section types known to the renderer. Each key matches a row in the
 * HomepageSection table; the `data` JSON shape is validated per type.
 */
export const SECTION_KEYS = [
    'hero',
    'promo-spring',
    'new-arrivals',
    'featured-product',
    'promo-denim',
    'gallery',
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

// Each section type defines its own data shape.
// Sections that aren't editable (data-driven from products) have empty data.
export const HeroDataSchema = z.object({
    eyebrow: z.string().max(120).default('The Spring Edit'),
    titleLine1: z.string().max(120).default('Discover the latest'),
    titleLine2: z.string().max(120).default('fashion trends.'),
    subtitle: z
        .string()
        .max(500)
        .default(
            "Upgrade your wardrobe with this season's exclusive new arrivals — elegant, modern, and designed for the way you live."
        ),
    backgroundImage: z.string().default('/hero-bg.png'),
    primaryCtaLabel: z.string().max(60).default('Shop Now'),
    primaryCtaHref: z.string().default('/products'),
    secondaryCtaLabel: z.string().max(60).default('Explore Collections'),
    secondaryCtaHref: z.string().default('/products'),
});

export type HeroData = z.infer<typeof HeroDataSchema>;

/** PromoSection2 — 3-column showcase */
export const PromoColumn = z.object({
    image: z.string().default(''),
    title: z.string().max(120).default(''),
    description: z.string().max(500).default(''),
});

export const PromoSpringSchema = z.object({
    title: z.string().max(120).default('Denim Jacket Outfits'),
    subtitle: z
        .string()
        .max(300)
        .default(
            'See our top-picks for jean jackets that are oversized, distressed, and downright cool.'
        ),
    columns: z
        .array(PromoColumn)
        .length(3)
        .default([
            {
                image: '/feature-prod-1.jpg',
                title: 'Solid Crop Slim Cami Top',
                description:
                    'Explore the impeccably crafted styles defined by a modern Americana aesthetic.',
            },
            {
                image: '/feature-prod-2.jpg',
                title: '',
                description: '',
            },
            {
                image: '/feature-prod-3.jpg',
                title: 'High Turtleneck Jumper',
                description:
                    'Explore the impeccably crafted styles defined by a modern Americana aesthetic.',
            },
        ]),
    ctaLabel: z.string().max(60).default('Shop All Collections'),
    ctaHref: z.string().default('/products'),
});

export type PromoSpringData = z.infer<typeof PromoSpringSchema>;

/** PromoSection1 — Denim collection (large hero + 2 small cards) */
export const PromoCard = z.object({
    image: z.string().default(''),
    title: z.string().max(120).default(''),
    subtitle: z.string().max(200).default(''),
    ctaLabel: z.string().max(60).default('SHOP THE COLLECTION'),
    ctaHref: z.string().default('/products'),
});

export const PromoDenimSchema = z.object({
    title: z.string().max(120).default('Denim Collection'),
    subtitle: z
        .string()
        .max(400)
        .default(
            'Explore the best trends for girls and women at SaleHub! Clothes, shoes and cool accessories for a new season are available now at SaleHub online.'
        ),
    mainCard: PromoCard.default({
        image: '/feature-prod-1.jpg',
        title: 'DENIM-JACKET',
        subtitle: '14 Denim-Jacket Outfits to Live in Now That It Is Fall',
        ctaLabel: 'SHOP THE COLLECTION',
        ctaHref: '/products',
    }),
    card2: PromoCard.default({
        image: '/feature-prod-2.jpg',
        title: 'DENIM MINI SKIRT',
        subtitle: '',
        ctaLabel: 'SHOP THE COLLECTION',
        ctaHref: '/products',
    }),
    card3: PromoCard.default({
        image: '/feature-prod-3.jpg',
        title: 'HOODED DENIM',
        subtitle: 'Subtitle from happy customers',
        ctaLabel: 'SHOP THE COLLECTIONS',
        ctaHref: '/products',
    }),
});

export type PromoDenimData = z.infer<typeof PromoDenimSchema>;

export const SectionUpdateSchema = z.object({
    active: z.boolean().optional(),
    position: z.coerce.number().int().min(0).max(100).optional(),
    data: z.record(z.string(), z.unknown()).optional(),
});

export type SectionUpdateInput = z.infer<typeof SectionUpdateSchema>;

// Default section catalogue — used to render placeholders when no DB rows exist
export const DEFAULT_SECTION_CATALOGUE: Array<{
    key: SectionKey;
    type: string;
    label: string;
    description: string;
    editable: boolean;
}> = [
        {
            key: 'hero',
            type: 'hero',
            label: 'Hero Banner',
            description: 'The full-bleed banner at the top of the homepage.',
            editable: true,
        },
        {
            key: 'promo-spring',
            type: 'promo',
            label: 'Spring Promo Strip',
            description: 'Three-column showcase below the hero.',
            editable: true,
        },
        {
            key: 'new-arrivals',
            type: 'data:newArrivals',
            label: 'New Arrivals Grid',
            description: 'Latest 6 PUBLISHED products from the catalogue.',
            editable: false,
        },
        {
            key: 'featured-product',
            type: 'featured',
            label: 'Featured Product Showcase',
            description: 'Single-product hero with color + size pickers.',
            editable: false,
        },
        {
            key: 'promo-denim',
            type: 'promo',
            label: 'Denim Promo Section',
            description: 'Large hero card + two smaller editorial cards.',
            editable: true,
        },
        {
            key: 'gallery',
            type: 'gallery',
            label: 'Inspiration Gallery',
            description: 'Image grid at the bottom of the homepage.',
            editable: false,
        },
    ];
