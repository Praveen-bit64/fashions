'use client';
import SectionHeader from './resuseable/SectionHeader';

const PromoSection1 = () => {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <SectionHeader
                    title="Denim Collection"
                    subtitle="Explore the best trends for girls and women at SaleHub! Clothes, shoes and cool accessories for a new season are available now at SaleHub online."
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

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                    {/* Left Section - Denim Jacket (Large) */}
                    <div className="lg:col-span-2 relative group">
                        <div className="relative h-[600px] lg:h-[700px] overflow-hidden rounded-lg">
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                                style={{
                                    backgroundImage: "url('/feature-prod-1.jpg')", // Replace with actual denim jacket image
                                    backgroundColor: "#f5f5f5"
                                }}
                            >
                                {/* Dark overlay for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                            </div>

                            {/* Text Overlay */}
                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                <h3 className="text-4xl lg:text-5xl font-open-sans font-bold mb-4 leading-tight">
                                    DENIM-JACKET
                                </h3>
                                <p className="text-lg lg:text-xl font-inter mb-6 max-w-md leading-relaxed">
                                    14 Denim-Jacket Outfits to Live in Now That It Is Fall
                                </p>
                                <button className="bg-white text-black px-8 py-3 rounded-none border-2 border-black font-inter font-semibold hover:bg-black hover:text-white transition-all duration-300">
                                    SHOP THE COLLECTION
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Two Smaller Items */}
                    <div className="space-y-8">
                        {/* Top Right - Denim Mini Skirt */}
                        <div className="relative group">
                            <div className="relative h-[320px] overflow-hidden rounded-lg">
                                {/* Background Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                                    style={{
                                        backgroundImage: "url('/feature-prod-2.jpg')", // Replace with actual denim skirt image
                                        backgroundColor: "#f5f5f5"
                                    }}
                                >
                                    {/* Dark overlay for text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                </div>

                                {/* Text Overlay */}
                                <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                                    <h3 className="text-2xl lg:text-3xl font-open-sans font-bold mb-4 leading-tight">
                                        DENIM MINI SKIRT
                                    </h3>
                                    <button className="bg-white text-black px-6 py-2.5 rounded-none border-2 border-black font-inter font-semibold hover:bg-black hover:text-white transition-all duration-300">
                                        SHOP THE COLLECTION
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Right - Hooded Denim */}
                        <div className="relative group">
                            <div className="relative h-[320px] overflow-hidden rounded-lg">
                                {/* Background Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                                    style={{
                                        backgroundImage: "url('/feature-prod-3.jpg')", // Replace with actual hooded denim image
                                        backgroundColor: "#f5f5f5"
                                    }}
                                >
                                    {/* Dark overlay for text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                </div>

                                {/* Text Overlay */}
                                <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                                    <h3 className="text-2xl lg:text-3xl font-open-sans font-bold mb-2 leading-tight">
                                        HOODED DENIM
                                    </h3>
                                    <p className="text-sm font-inter mb-4 opacity-90">
                                        Subtitle from happy customers
                                    </p>
                                    <button className="bg-white text-black px-6 py-2.5 rounded-none border-2 border-black font-inter font-semibold hover:bg-black hover:text-white transition-all duration-300">
                                        SHOP THE COLLECTIONS
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromoSection1;