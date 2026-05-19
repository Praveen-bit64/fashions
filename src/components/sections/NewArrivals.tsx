'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '../ui/ProductCard';
import SectionHeader from '../ui/SectionHeader';

type RawProduct = {
    id: string;
    slug: string;
    title: string;
    brand: string;
    basePrice: number;
    discountPrice: number | null;
    rating: number;
    reviewCount: number;
    isNewArrival: boolean;
    isBestSeller: boolean;
    media: Array<{ url: string; position: number }>;
    variants: Array<{ stockQty: number }>;
};

type Product = {
    id: string;
    slug: string;
    title: string;
    brand: string;
    originalPrice: number;
    discountedPrice?: number;
    discountPercentage?: number;
    rating: number;
    reviewCount: number;
    image: string;
    images: string[];
    isNewArrival: boolean;
    isBestSeller: boolean;
    isOutOfStock: boolean;
};

function toProduct(p: RawProduct): Product {
    const media = p.media ?? [];
    const variants = p.variants ?? [];
    const imgs = [...media]
        .sort((a, b) => a.position - b.position)
        .map((m) => m.url);
    const stock = variants.reduce((s, v) => s + v.stockQty, 0);
    const isOutOfStock = variants.length > 0 && stock === 0;
    const discountedPrice = p.discountPrice ?? undefined;
    const discountPercentage = discountedPrice
        ? Math.round(((p.basePrice - discountedPrice) / p.basePrice) * 100)
        : undefined;
    return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        brand: p.brand,
        originalPrice: p.basePrice,
        discountedPrice,
        discountPercentage,
        rating: p.rating,
        reviewCount: p.reviewCount,
        image: imgs[0] ?? '/feature-prod-1.jpg',
        images: imgs.slice(1),
        isNewArrival: p.isNewArrival,
        isBestSeller: p.isBestSeller,
        isOutOfStock,
    };
}

const NewArrivals = () => {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/v1/products?status=PUBLISHED&take=6');
                const data = await res.json();
                if (!cancelled && res.ok && data.ok) {
                    setProducts((data.data.items as RawProduct[]).map(toProduct));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (!loading && products.length === 0) {
        // Don't render an empty section on the homepage
        return null;
    }

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <SectionHeader
                    title="New Arrivals"
                    subtitle="Discover the latest trends and newest additions to our collection. Fresh styles, premium quality, and unbeatable prices."
                    titleFont="delius-swash-caps"
                    subtitleFont="inter"
                    titleSize="4xl"
                    subtitleSize="xl"
                    textAlign="center"
                    titleColor="gray-900"
                    subtitleColor="gray-600"
                    maxWidth="2xl"
                    spacing="normal"
                    showDivider={true}
                    dividerColor="emerald-300"
                />

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="aspect-[4/5] bg-gray-100 rounded-2xl animate-pulse"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="col-span-2">
                                <ProductCard
                                    id={product.id}
                                    title={product.title}
                                    brand={product.brand}
                                    originalPrice={product.originalPrice}
                                    discountedPrice={product.discountedPrice}
                                    discountPercentage={product.discountPercentage}
                                    rating={product.rating}
                                    reviewCount={product.reviewCount}
                                    image={product.image}
                                    images={product.images}
                                    isNewArrival={product.isNewArrival}
                                    isBestSeller={product.isBestSeller}
                                    isOutOfStock={product.isOutOfStock}
                                    onProductClick={() =>
                                        router.push(`/product/${product.slug}`)
                                    }
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-center mt-12">
                    <button
                        onClick={() => router.push('/products')}
                        className="bg-gray-900 text-white px-8 py-3 rounded-md font-inter font-medium hover:bg-gray-800 transition-colors"
                    >
                        View All New Arrivals
                    </button>
                </div>
            </div>
        </section>
    );
};

export default NewArrivals;
