'use client';
import { motion } from "framer-motion";
import { useState } from "react";
import SectionHeader from "./resuseable/SectionHeader";

const ProductDetail = () => {
    const [selectedColor, setSelectedColor] = useState("olive");
    const [selectedSize, setSelectedSize] = useState("M");
    const [selectedImage, setSelectedImage] = useState(0);

    const colors = [
        { name: "Olive", value: "olive", bg: "bg-green-700" },
        { name: "Black", value: "black", bg: "bg-black" },
        { name: "Pink", value: "pink", bg: "bg-pink-400" },
        { name: "White", value: "white", bg: "bg-white border border-gray-300" },
        { name: "Purple", value: "purple", bg: "bg-purple-700" },
    ];

    const sizes = ["XS", "S", "M", "L", "XL"];

    const productImages = [
        "/feature-prod-1.jpg",
        "/feature-prod-2.jpg",
        "/feature-prod-3.jpg"
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 bg-white">
            {/* Section Header using reusable component */}
            <motion.div
                initial={{ opacity: 0, y: 70 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9 }}
            >
                <SectionHeader
                    title="Featured Product"
                    subtitle="Discover our handpicked selection of premium quality products that define style and elegance."
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
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT: Product Images */}
                <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-4">
                    {/* Main Product Image */}
                    <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                        <img
                            src={productImages[selectedImage]}
                            alt="Essential Western Denim Shirt"
                            className="w-full h-[600px] object-cover transition-opacity duration-300"
                        />
                        {/* Discount Badge */}
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-inter font-medium">
                            20% OFF
                        </div>
                    </div>

                    {/* Image Thumbnails */}
                    <div className="flex gap-3 justify-center">
                        {productImages.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                className={`w-16 h-16 object-cover border-2 rounded-md cursor-pointer transition-all duration-200 hover:border-gray-500 ${selectedImage === index
                                    ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2"
                                    : "border-gray-300"
                                    }`}
                                onClick={() => setSelectedImage(index)}
                                alt={`Product view ${index + 1}`}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* RIGHT: Product Details */}
                <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-6">
                    {/* Brand & Product Title */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-inter font-medium text-gray-600 uppercase tracking-wide">Brand Name</span>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span className="text-sm font-inter text-gray-500">Product ID: 12345</span>
                        </div>
                        <h1 className="text-2xl font-open-sans font-semibold text-gray-900 leading-tight">
                            Essential Western Denim Shirt
                        </h1>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-sm">★</span>
                                ))}
                            </div>
                            <span className="text-sm font-inter text-gray-600 ml-1">4.8</span>
                        </div>
                        <span className="text-gray-400">|</span>
                        <span className="text-sm font-inter text-gray-600">127 Reviews</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-sm font-inter text-gray-600">2.1k Sold</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-inter font-bold text-gray-900">₹1,199</span>
                        <span className="text-xl font-inter text-gray-500 line-through">₹1,499</span>
                        <span className="text-sm font-inter font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                            Save ₹300
                        </span>
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-inter font-medium text-gray-900">Color</h3>
                            <span className="text-sm font-inter text-gray-600">{colors.find(c => c.value === selectedColor)?.name}</span>
                        </div>
                        <div className="flex gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color.value}
                                    className={`w-8 h-8 rounded-full ${color.bg} ${selectedColor === color.value
                                        ? "ring-2 ring-gray-900 ring-offset-2"
                                        : "ring-1 ring-gray-300"
                                        } transition-all duration-200`}
                                    onClick={() => setSelectedColor(color.value)}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Size Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-inter font-medium text-gray-900">Size</h3>
                            <button className="text-sm font-inter text-blue-600 hover:text-blue-700">
                                Size Guide
                            </button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    disabled={size === "XL"}
                                    className={`px-4 py-2 border rounded-md text-sm font-inter font-medium transition-all duration-200 ${selectedSize === size
                                        ? "border-gray-900 bg-gray-900 text-white"
                                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                        } ${size === "XL" ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                        <button className="w-full bg-gray-900 text-white py-3 rounded-md font-inter font-medium hover:bg-gray-800 transition-colors">
                            ADD TO CART
                        </button>
                        <button className="w-full border border-gray-300 text-gray-900 py-3 rounded-md font-inter font-medium hover:bg-gray-50 transition-colors">
                            ADD TO WISHLIST
                        </button>
                    </div>

                    {/* Delivery & Offers */}
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-green-600 font-inter font-medium">✓</span>
                            <span className="font-inter text-gray-700">Free delivery on orders above ₹999</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-green-600 font-inter font-medium">✓</span>
                            <span className="font-inter text-gray-700">Easy 30-day returns</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-green-600 font-inter font-medium">✓</span>
                            <span className="font-inter text-gray-700">Cash on delivery available</span>
                        </div>
                    </div>

                    {/* Product Details */}
                    {/* <div className="pt-6 border-t space-y-4">
                        <h4 className="text-lg font-inter font-semibold text-gray-900">Product Details</h4>
                        <div className="space-y-2 text-sm font-inter text-gray-700">
                            <p><span className="font-medium">Fabric:</span> 100% Cotton Denim</p>
                            <p><span className="font-medium">Fit:</span> Regular</p>
                            <p><span className="font-medium">Pattern:</span> Solid</p>
                            <p><span className="font-medium">Collar:</span> Button Down</p>
                            <p><span className="font-medium">Sleeves:</span> Long Sleeves</p>
                            <p><span className="font-medium">Care Instructions:</span> Machine Wash</p>
                        </div>
                    </div> */}

                    {/* Size Chart */}
                    {/* <div className="pt-6 border-t">
                        <h4 className="text-lg font-inter font-semibold text-gray-900 mb-4">Size Chart</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm font-inter">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-3">Size</th>
                                        <th className="text-left py-2 px-3">Chest</th>
                                        <th className="text-left py-2 px-3">Length</th>
                                        <th className="text-left py-2 px-3">Shoulder</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    <tr className="border-b">
                                        <td className="py-2 px-3">S</td>
                                        <td className="py-2 px-3">38"</td>
                                        <td className="py-2 px-3">28"</td>
                                        <td className="py-2 px-3">16"</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 px-3">M</td>
                                        <td className="py-2 px-3">40"</td>
                                        <td className="py-2 px-3">29"</td>
                                        <td className="py-2 px-3">17"</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 px-3">L</td>
                                        <td className="py-2 px-3">42"</td>
                                        <td className="py-2 px-3">30"</td>
                                        <td className="py-2 px-3">18"</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div> */}
                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetail;