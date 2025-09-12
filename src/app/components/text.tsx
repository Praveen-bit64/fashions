'use client';
import ProductCard from './resuseable/ProductCard';
import SectionHeader from './resuseable/SectionHeader';

const NewArrivals = () => {
    // Dummy product data
    const products = [
        {
            id: "1",
            title: "Essential Western Denim Shirt",
            brand: "DENIM CO",
            originalPrice: 1499,
            discountedPrice: 1199,
            discountPercentage: 20,
            rating: 4.8,
            reviewCount: 127,
            image: "/feature-prod-1.jpg",
            images: ["/feature-prod-2.jpg", "/feature-prod-3.jpg"],
            isNewArrival: true,
            isWishlisted: false,
            isBestSeller: false,
            isOutOfStock: false,
        },
        {
            id: "2",
            title: "Classic Cotton T-Shirt",
            brand: "COTTON CLUB",
            originalPrice: 799,
            discountedPrice: 599,
            discountPercentage: 25,
            rating: 4.6,
            reviewCount: 89,
            image: "/feature-prod-1.jpg",
            images: ["/feature-prod-2.jpg"],
            isNewArrival: true,
            isWishlisted: true,
            isBestSeller: false,
            isOutOfStock: false,
        },
        {
            id: "3",
            title: "Premium Leather Jacket",
            brand: "LEATHER LUXE",
            originalPrice: 8999,
            discountedPrice: 6999,
            discountPercentage: 22,
            rating: 4.9,
            reviewCount: 203,
            image: "/feature-prod-1.jpg",
            images: ["/feature-prod-2.jpg", "/feature-prod-3.jpg"],
            isNewArrival: true,
            isWishlisted: false,
            isBestSeller: true,
            isOutOfStock: false,
        },
        {
            id: "4",
            title: "Casual Chino Pants",
            brand: "CHINO STYLE",
            originalPrice: 1299,
            discountedPrice: 999,
            discountPercentage: 23,
            rating: 4.5,
            reviewCount: 156,
            image: "/feature-prod-1.jpg",
            images: ["/feature-prod-2.jpg"],
            isNewArrival: true,
            isWishlisted: false,
            isBestSeller: false,
            isOutOfStock: false,
        },
        {
            id: "5",
            title: "Summer Linen Shirt",
            brand: "LINEN LOUNGE",
            originalPrice: 1699,
            discountedPrice: 1299,
            discountPercentage: 24,
            rating: 4.7,
            reviewCount: 94,
            image: "/feature-prod-1.jpg",
            images: ["/feature-prod-2.jpg", "/feature-prod-3.jpg"],
            isNewArrival: true,
            isWishlisted: true,
            isBestSeller: false,
            isOutOfStock: false,
        },
        {
            id: "6",
            title: "Designer Sneakers",
            brand: "SNEAKER HUB",
            originalPrice: 4999,
            discountedPrice: 3999,
            discountPercentage: 20,
            rating: 4.8,
            reviewCount: 312,
            image: "/feature-prod-1.jpg",
            images: ["/feature-prod-2.jpg"],
            isNewArrival: true,
            isWishlisted: false,
            isBestSeller: false,
            isOutOfStock: true,
        },
    ];

    const handleWishlistToggle = (productId: string) => {
        console.log('Wishlist toggled for product:', productId);
        // Add your wishlist logic here
    };

    const handleAddToCart = (productId: string) => {
        console.log('Added to cart:', productId);
        // Add your add to cart logic here
    };

    const handleProductClick = (productId: string) => {
        console.log('Product clicked:', productId);
        // Add your product navigation logic here
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header using reusable component */}
                <SectionHeader
                    title="New Arrivals"
                    subtitle="Discover the latest trends and newest additions to our collection. Fresh styles, premium quality, and unbeatable prices."
                    titleFont="delius-swash-caps"
                    subtitleFont="font-mono"
                    titleSize="4xl"
                    subtitleSize="xl"
                    textAlign="center"
                    titleColor="gray-900"
                    subtitleColor="gray-600"
                    maxWidth="2xl"
                    spacing="normal"
                />

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
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
                            isWishlisted={product.isWishlisted}
                            isNewArrival={product.isNewArrival}
                            isBestSeller={product.isBestSeller}
                            isOutOfStock={product.isOutOfStock}
                            onWishlistToggle={handleWishlistToggle}
                            onAddToCart={handleAddToCart}
                            onProductClick={handleProductClick}
                        />
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <button className="bg-gray-900 text-white px-8 py-3 rounded-md font-inter font-medium hover:bg-gray-800 transition-colors">
                        View All New Arrivals
                    </button>
                </div>
            </div>
        </section>
    );
};

export default NewArrivals;