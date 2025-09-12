'use client';
import SectionHeader from './resuseable/SectionHeader';

const PromoSection2 = () => {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header - Only for Middle Column */}
                <SectionHeader
                    title="Denim Jacket Outfits"
                    subtitle="See our top-picks for jean jackets that are oversized, distressed, and downright cool."
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

                {/* Three Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column - Solid Crop Slim Cami Top */}
                    <div className="text-center space-y-6">
                        {/* Product Image */}
                        <div className="relative group">
                            <div className="relative h-[500px] overflow-hidden rounded-lg">
                                <div
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                                    style={{
                                        backgroundImage: "url('/feature-prod-1.jpg')", // Replace with actual crop top image
                                        backgroundColor: "#f8f9fa"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-3">
                            <h3 className="text-xl font-open-sans font-bold text-gray-900">
                                Solid Crop Slim Cami Top
                            </h3>
                            <p className="text-gray-600 font-inter leading-relaxed">
                                Explore the impeccably crafted styles defined by a modern Americana aesthetic.
                            </p>
                        </div>
                    </div>

                    {/* Middle Column - Denim Jacket (Featured) */}
                    <div className="text-center space-y-6">
                        {/* Product Image */}
                        <div className="relative group">
                            <div className="relative h-[500px] overflow-hidden rounded-lg">
                                <div
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                                    style={{
                                        backgroundImage: "url('/feature-prod-2.jpg')", // Replace with actual denim jacket image
                                        backgroundColor: "#f8f9fa"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Product Info - This column doesn't need additional title/description as it's covered by the header */}
                        <div className="space-y-3">
                            <div className="w-16 h-1 bg-gray-300 mx-auto rounded-full"></div>
                        </div>
                    </div>

                    {/* Right Column - High Turtleneck Jumper */}
                    <div className="text-center space-y-6">
                        {/* Product Image */}
                        <div className="relative group">
                            <div className="relative h-[500px] overflow-hidden rounded-lg">
                                <div
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                                    style={{
                                        backgroundImage: "url('/feature-prod-3.jpg')", // Replace with actual turtleneck image
                                        backgroundColor: "#f8f9fa"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-3">
                            <h3 className="text-xl font-open-sans font-bold text-gray-900">
                                High Turtleneck Jumper
                            </h3>
                            <p className="text-gray-600 font-inter leading-relaxed">
                                Explore the impeccably crafted styles defined by a modern Americana aesthetic.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Optional: Call to Action */}
                <div className="text-center mt-12">
                    <button className="bg-gray-900 text-white px-8 py-3 rounded-md font-inter font-semibold hover:bg-gray-800 transition-colors">
                        Shop All Collections
                    </button>
                </div>
            </div>
        </section>
    );
};

export default PromoSection2;