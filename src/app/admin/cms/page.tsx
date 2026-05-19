import { cmsService } from '@/services/cms.service';
import {
    DEFAULT_SECTION_CATALOGUE,
    HeroDataSchema,
    PromoSpringSchema,
    PromoDenimSchema,
    type HeroData,
    type PromoSpringData,
    type PromoDenimData,
} from '@/lib/validation/cms';
import PageHeader from '@/components/admin/PageHeader';
import CmsClient from './CmsClient';

export const dynamic = 'force-dynamic';

export default async function AdminCmsPage() {
    await cmsService.ensureDefaults();
    const sections = await cmsService.listAll();

    const heroSection = sections.find((s) => s.key === 'hero');
    const promoSpringSection = sections.find((s) => s.key === 'promo-spring');
    const promoDenimSection = sections.find((s) => s.key === 'promo-denim');

    const heroData: HeroData = HeroDataSchema.parse(heroSection?.data ?? {});
    const promoSpringData: PromoSpringData = PromoSpringSchema.parse(
        promoSpringSection?.data ?? {}
    );
    const promoDenimData: PromoDenimData = PromoDenimSchema.parse(
        promoDenimSection?.data ?? {}
    );

    const serialised = sections.map((s) => {
        const def = DEFAULT_SECTION_CATALOGUE.find((d) => d.key === s.key);
        return {
            id: s.id,
            key: s.key,
            active: s.active,
            position: s.position,
            label: def?.label ?? s.key,
            description: def?.description ?? '',
            editable: def?.editable ?? false,
        };
    });

    return (
        <>
            <PageHeader
                breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'CMS' }]}
                eyebrow="Engagement"
                title="Homepage CMS"
                description="Edit hero copy, swap promo imagery, and toggle sections on or off."
            />
            <CmsClient
                sections={serialised}
                heroId={heroSection?.id ?? ''}
                heroData={heroData}
                promoSpringId={promoSpringSection?.id ?? ''}
                promoSpringData={promoSpringData}
                promoDenimId={promoDenimSection?.id ?? ''}
                promoDenimData={promoDenimData}
            />
        </>
    );
}
