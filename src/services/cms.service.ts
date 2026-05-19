import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
    DEFAULT_SECTION_CATALOGUE,
    HeroDataSchema,
    PromoSpringSchema,
    PromoDenimSchema,
    type HeroData,
    type PromoSpringData,
    type PromoDenimData,
    type SectionKey,
} from '@/lib/validation/cms';

export const cmsService = {
    /**
     * Ensures one row exists per known section key.
     * Idempotent — called from the admin page so first-time users have
     * something to edit without a separate seed script.
     */
    async ensureDefaults() {
        const initialData = (key: SectionKey): Prisma.InputJsonValue => {
            if (key === 'hero')
                return HeroDataSchema.parse({}) as Prisma.InputJsonValue;
            if (key === 'promo-spring')
                return PromoSpringSchema.parse({}) as Prisma.InputJsonValue;
            if (key === 'promo-denim')
                return PromoDenimSchema.parse({}) as Prisma.InputJsonValue;
            return {} as Prisma.InputJsonValue;
        };

        for (const def of DEFAULT_SECTION_CATALOGUE) {
            await prisma.homepageSection.upsert({
                where: { key: def.key },
                update: {},
                create: {
                    key: def.key,
                    type: def.type,
                    position: DEFAULT_SECTION_CATALOGUE.findIndex(
                        (d) => d.key === def.key
                    ),
                    active: true,
                    data: initialData(def.key),
                },
            });
        }
    },

    async listAll() {
        return prisma.homepageSection.findMany({
            orderBy: { position: 'asc' },
        });
    },

    async getByKey(key: SectionKey) {
        return prisma.homepageSection.findUnique({ where: { key } });
    },

    /**
     * Resolves hero content with defaults so the homepage always has something
     * to render even if the row doesn't exist yet.
     */
    async getHeroData(): Promise<HeroData> {
        const row = await prisma.homepageSection.findUnique({
            where: { key: 'hero' },
        });
        return HeroDataSchema.parse(row?.data ?? {});
    },

    async getPromoSpringData(): Promise<PromoSpringData> {
        const row = await prisma.homepageSection.findUnique({
            where: { key: 'promo-spring' },
        });
        return PromoSpringSchema.parse(row?.data ?? {});
    },

    async getPromoDenimData(): Promise<PromoDenimData> {
        const row = await prisma.homepageSection.findUnique({
            where: { key: 'promo-denim' },
        });
        return PromoDenimSchema.parse(row?.data ?? {});
    },

    async update(
        id: string,
        input: {
            active?: boolean;
            position?: number;
            data?: Record<string, unknown>;
        }
    ) {
        return prisma.homepageSection.update({
            where: { id },
            data: {
                ...(input.active !== undefined ? { active: input.active } : {}),
                ...(input.position !== undefined
                    ? { position: input.position }
                    : {}),
                ...(input.data !== undefined
                    ? { data: input.data as Prisma.InputJsonValue }
                    : {}),
            },
        });
    },

    /**
     * Returns a Map of key -> { active, data } for the homepage to read,
     * with safe defaults for unknown sections.
     */
    async getActiveMap(): Promise<
        Record<SectionKey, { active: boolean; data: unknown }>
    > {
        const rows = await prisma.homepageSection.findMany();
        const map: Record<string, { active: boolean; data: unknown }> = {};
        for (const def of DEFAULT_SECTION_CATALOGUE) {
            const row = rows.find((r) => r.key === def.key);
            map[def.key] = {
                active: row?.active ?? true,
                data: row?.data ?? {},
            };
        }
        return map as Record<SectionKey, { active: boolean; data: unknown }>;
    },
};
