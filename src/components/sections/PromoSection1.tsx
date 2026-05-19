'use client';
import { useRouter } from 'next/navigation';
import SectionHeader from '../ui/SectionHeader';
import type { PromoDenimData } from '@/lib/validation/cms';

const DEFAULTS: PromoDenimData = {
    title: 'Denim Collection',
    subtitle:
        'Explore the best trends for girls and women at SaleHub! Clothes, shoes and cool accessories for a new season are available now at SaleHub online.',
    mainCard: {
        image: '/feature-prod-1.jpg',
        title: 'DENIM-JACKET',
        subtitle: '14 Denim-Jacket Outfits to Live in Now That It Is Fall',
        ctaLabel: 'SHOP THE COLLECTION',
        ctaHref: '/products',
    },
    card2: {
        image: '/feature-prod-2.jpg',
        title: 'DENIM MINI SKIRT',
        subtitle: '',
        ctaLabel: 'SHOP THE COLLECTION',
        ctaHref: '/products',
    },
    card3: {
        image: '/feature-prod-3.jpg',
        title: 'HOODED DENIM',
        subtitle: 'Subtitle from happy customers',
        ctaLabel: 'SHOP THE COLLECTIONS',
        ctaHref: '/products',
    },
};

const PromoSection1 = (props: Partial<PromoDenimData> = {}) => {
    const router = useRouter();
    const content = { ...DEFAULTS, ...props };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <SectionHeader
                    title={content.title}
                    subtitle={content.subtitle}
                    titleFont="delius-swash-caps"
                    subtitleFont="inter"
                    titleSize="4xl"
                    subtitleSize="lg"
                    textAlign="center"
                    titleColor="gray-900"
                    subtitleColor="gray-700"
                    maxWidth="4xl"
                    spacing="normal"
                    showDivider={true}
                    dividerColor="emerald-300"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                    {/* Left — main card */}
                    <div className="lg:col-span-2 relative group">
                        <div className="relative h-[600px] lg:h-[700px] overflow-hidden rounded-lg">
                            <div
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                                style={{
                                    backgroundImage: `url('${content.mainCard.image || '/feature-prod-1.jpg'}')`,
                                    backgroundColor: '#f5f5f5',
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            </div>

                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                {content.mainCard.title && (
                                    <h3 className="text-4xl lg:text-5xl font-open-sans font-bold mb-4 leading-tight">
                                        {content.mainCard.title}
                                    </h3>
                                )}
                                {content.mainCard.subtitle && (
                                    <p className="text-lg lg:text-xl font-inter mb-6 max-w-md leading-relaxed">
                                        {content.mainCard.subtitle}
                                    </p>
                                )}
                                {content.mainCard.ctaLabel && (
                                    <button
                                        onClick={() =>
                                            router.push(content.mainCard.ctaHref)
                                        }
                                        className="bg-white text-black px-8 py-3 rounded-none border-2 border-black font-inter font-semibold hover:bg-black hover:text-white transition-all duration-300"
                                    >
                                        {content.mainCard.ctaLabel}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right — two smaller cards */}
                    <div className="space-y-8">
                        {[content.card2, content.card3].map((card, idx) => (
                            <div key={idx} className="relative group">
                                <div className="relative h-[320px] overflow-hidden rounded-lg">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                                        style={{
                                            backgroundImage: `url('${card.image || '/feature-prod-1.jpg'}')`,
                                            backgroundColor: '#f5f5f5',
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                    </div>

                                    <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                                        {card.title && (
                                            <h3 className="text-2xl lg:text-3xl font-open-sans font-bold mb-2 leading-tight">
                                                {card.title}
                                            </h3>
                                        )}
                                        {card.subtitle && (
                                            <p className="text-sm font-inter mb-4 opacity-90">
                                                {card.subtitle}
                                            </p>
                                        )}
                                        {card.ctaLabel && (
                                            <button
                                                onClick={() => router.push(card.ctaHref)}
                                                className="bg-white text-black px-6 py-2.5 rounded-none border-2 border-black font-inter font-semibold hover:bg-black hover:text-white transition-all duration-300"
                                            >
                                                {card.ctaLabel}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromoSection1;
