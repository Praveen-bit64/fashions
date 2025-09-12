'use client';
import SectionHeader from './resuseable/SectionHeader';

const Gallery = () => {
    // Gallery images for seamless layout
    const galleryImages = [
        { id: 1, image: "/feature-prod-1.jpg" },
        { id: 2, image: "/feature-prod-2.jpg" },
        { id: 3, image: "/feature-prod-3.jpg" },
        { id: 4, image: "/feature-prod-1.jpg" },
        { id: 5, image: "/feature-prod-2.jpg" },
        { id: 6, image: "/feature-prod-3.jpg" },
        { id: 7, image: "/feature-prod-1.jpg" },
        { id: 8, image: "/feature-prod-2.jpg" },
        { id: 9, image: "/feature-prod-3.jpg" }
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <SectionHeader
                    title="Style Gallery"
                    subtitle="Explore our curated collection of fashion moments and style inspirations."
                    titleFont="delius-swash-caps"
                    subtitleFont="inter"
                    titleSize="4xl"
                    subtitleSize="lg"
                    textAlign="center"
                    titleColor="gray-900"
                    subtitleColor="gray-600"
                    maxWidth="3xl"
                    spacing="normal"
                    showDivider={true}
                    dividerColor="emerald-300"
                />

                {/* Grid Layout with Spacing */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] gap-4">
                    {/* Row 1 */}
                    <div className="row-span-2 col-span-1 group cursor-pointer">
                        <div className="relative w-full h-full overflow-hidden rounded-lg">
                            <div
                                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${galleryImages[0].image})`,
                                    backgroundColor: "#f8f9fa"
                                }}
                            />
                        </div>
                    </div>

                    <div className="row-span-1 col-span-1 group cursor-pointer">
                        <div className="relative w-full h-full overflow-hidden rounded-lg">
                            <div
                                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${galleryImages[1].image})`,
                                    backgroundColor: "#f8f9fa"
                                }}
                            />
                        </div>
                    </div>

                    <div className="row-span-1 col-span-1 group cursor-pointer">
                        <div className="relative w-full h-full overflow-hidden rounded-lg">
                            <div
                                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${galleryImages[2].image})`,
                                    backgroundColor: "#f8f9fa"
                                }}
                            />
                        </div>
                    </div>

                    <div className="row-span-1 col-span-1 group cursor-pointer">
                        <div className="relative w-full h-full overflow-hidden rounded-lg">
                            <div
                                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${galleryImages[3].image})`,
                                    backgroundColor: "#f8f9fa"
                                }}
                            />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="row-span-1 col-span-2 group cursor-pointer">
                        <div className="relative w-full h-full overflow-hidden rounded-lg">
                            <div
                                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${galleryImages[4].image})`,
                                    backgroundColor: "#f8f9fa"
                                }}
                            />
                        </div>
                    </div>

                    <div className="row-span-1 col-span-1 group cursor-pointer">
                        <div className="relative w-full h-full overflow-hidden rounded-lg">
                            <div
                                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${galleryImages[5].image})`,
                                    backgroundColor: "#f8f9fa"
                                }}
                            />
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="row-span-1 col-span-1 group cursor-pointer">
                        <div className="relative w-full h-full overflow-hidden rounded-lg">
                            <div
                                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${galleryImages[6].image})`,
                                    backgroundColor: "#f8f9fa"
                                }}
                            />
                        </div>
                    </div>

                    <div className="row-span-1 col-span-1 group cursor-pointer">
                        <div className="relative w-full h-full overflow-hidden rounded-lg">
                            <div
                                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${galleryImages[7].image})`,
                                    backgroundColor: "#f8f9fa"
                                }}
                            />
                        </div>
                    </div>

                    <div className="row-span-1 col-span-1 group cursor-pointer">
                        <div className="relative w-full h-full overflow-hidden rounded-lg">
                            <div
                                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${galleryImages[8].image})`,
                                    backgroundColor: "#f8f9fa"
                                }}
                            />
                        </div>
                    </div>

                    <div className="row-span-1 col-span-1 group cursor-pointer">
                        <div className="relative w-full h-full overflow-hidden rounded-lg">
                            <div
                                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${galleryImages[0].image})`,
                                    backgroundColor: "#f8f9fa"
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Gallery;