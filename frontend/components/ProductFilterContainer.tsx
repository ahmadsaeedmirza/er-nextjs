"use client";

import { useState } from "react";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCardItem from "@/components/ProductCardItem";

interface Product {
  _id: string;
  id?: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  productImage: string;
  stockQuantity: number;
  isHidden?: boolean;
  discount?: number;
}

interface ProductFilterContainerProps {
  initialProducts: Product[];
}

export default function ProductFilterContainer({
  initialProducts,
}: ProductFilterContainerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [availability, setAvailability] = useState("all");

  // Filter products in memory
  const filteredProducts = initialProducts.filter((product) => {
    // 1. Search term filter
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Availability filter
    const matchesAvailability =
      availability === "all" ||
      (availability === "in-stock" && product.stockQuantity > 0);

    return matchesSearch && matchesAvailability;
  });

  // Sort products in memory
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low-high") {
      return a.price - b.price;
    }
    if (sortBy === "price-high-low") {
      return b.price - a.price;
    }
    if (sortBy === "name-a-z") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "name-z-a") {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  const displayProducts = sortedProducts;

  return (
    <main className="bg-[#F8F6F6] pb-24 pt-16">
      {/* SEARCH BAR SECTION */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="max-w-2xl mx-auto relative">
          <input
            type="text"
            placeholder="Search our premium signature products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-full border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#CF174514] focus:border-[#CF1745] text-base text-slate-900 placeholder-slate-400 transition-all shadow-sm"
          />
          <svg
            className="absolute left-5 top-[18px] w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* SIDEBAR FILTERS */}
          <FilterSidebar
            sortBy={sortBy}
            onSortChange={setSortBy}
            availability={availability}
            onAvailabilityChange={setAvailability}
          />

          {/* PRODUCTS GRID */}
          <div className="flex-1">
            {displayProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayProducts.map((product) => (
                  <ProductCardItem
                    key={product._id || product.id}
                    id={product.id || product._id}
                    slug={product.slug}
                    name={product.name}
                    price={product.price}
                    description={product.description}
                    productImage={product.productImage}
                    stockQuantity={product.stockQuantity}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No products available matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
