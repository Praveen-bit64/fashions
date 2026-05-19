import { Toaster } from 'react-hot-toast';
import HeroBanner from '@/components/sections/HeroBanner';
import FeaturedProduct from '@/components/sections/FeaturedProduct';
import NewArrivals from '@/components/sections/NewArrivals';
import PromoSection1 from '@/components/sections/PromoSection1';
import PromoSection2 from '@/components/sections/PromoSection2';
import Gallery from '@/components/sections/Gallery';
import { cmsService } from '@/services/cms.service';
import {
    HeroDataSchema,
    PromoSpringSchema,
    PromoDenimSchema,
} from '@/lib/validation/cms';

export const dynamic = 'force-dynamic';

const Page = async () => {
    const sections = await cmsService.getActiveMap();
    const heroContent = HeroDataSchema.parse(sections.hero.data ?? {});
    const promoSpringContent = PromoSpringSchema.parse(
        sections['promo-spring'].data ?? {}
    );
    const promoDenimContent = PromoDenimSchema.parse(
        sections['promo-denim'].data ?? {}
    );

    return (
        <div className="min-h-screen bg-slate-100">
            <Toaster />
            {sections.hero.active && <HeroBanner {...heroContent} />}
            {sections['promo-spring'].active && (
                <PromoSection2 {...promoSpringContent} />
            )}
            {sections['new-arrivals'].active && <NewArrivals />}
            {sections['featured-product'].active && <FeaturedProduct />}
            {sections['promo-denim'].active && (
                <PromoSection1 {...promoDenimContent} />
            )}
            {sections.gallery.active && <Gallery />}
        </div>
    );
};

export default Page;
