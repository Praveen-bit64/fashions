'use client';
import { useRouter } from 'next/navigation';
import SectionHeader from '../ui/SectionHeader';
import type { PromoSpringData } from '@/lib/validation/cms';

const DEFAULTS: PromoSpringData = {
    title: 'Denim Jacket Outfits',
    subtitle:
        'See our top-picks for jean jackets that are oversized, distressed, and downright cool.',
    columns: [
        {
            image: '/feature-prod-1.jpg',
            title: 'Solid Crop Slim Cami Top',
            description:
                'Explore the impeccably crafted styles defined by a modern Americana aesthetic.',
        },
        { image: '/feature-prod-2.jpg', title: '', description: '' },
        {
            image: '/feature-prod-3.jpg',
            title: 'High Turtleneck Jumper',
            description:
                'Explore the impeccably crafted styles defined by a modern Americana aesthetic.',
        },
    ],
    ctaLabel: 'Shop All Collections',
    ctaHref: '/products',
};

const PromoSection2 = (props: Partial<PromoSpringData> = {}) => {
    const router = useRouter();
    const content = { ...DEFAULTS, ...props };
    const columns =
        content.columns?.length === 3 ? content.columns : DEFAULTS.columns;

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
                    subtitleColor="gray-600"
                    maxWidth="2xl"
                    spacing="normal"
                    showDivider={true}
                    dividerColor="emerald-300"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {columns.map((col, idx) => (
                        <div key={idx} className="text-center space-y-6">
                            <div className="relative group">
                                <div className="relative h-[500px] overflow-hidden rounded-lg">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                                        style={{
                                            backgroundImage: `url('${col.image || '/feature-prod-1.jpg'}')`,
                                            backgroundColor: '#f8f9fa',
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                {col.title ? (
                                    <h3 className="text-xl font-open-sans font-bold text-gray-900">
                                        {col.title}
                                    </h3>
                                ) : (
                                    <div className="w-16 h-1 bg-gray-300 mx-auto rounded-full" />
                                )}
                                {col.description && (
                                    <p className="text-gray-600 font-inter leading-relaxed">
                                        {col.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {content.ctaLabel && (
                    <div className="text-center mt-12">
                        <button
                            onClick={() => router.push(content.ctaHref)}
                            className="bg-gray-900 text-white px-8 py-3 rounded-md font-inter font-semibold hover:bg-gray-800 transition-colors"
                        >
                            {content.ctaLabel}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PromoSection2;
