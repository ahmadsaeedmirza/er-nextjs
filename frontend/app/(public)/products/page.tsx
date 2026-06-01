"use client";

import { useEffect, useState } from "react";
import ProductsHero from "@/components/ProductsHero";
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

// Mock products data - fallback
const mockProducts: Product[] = [
  {
    _id: "1",
    id: "1",
    slug: "signature-serum",
    name: "Signature Hair Serum",
    price: 45.99,
    description: "Premium hair serum for shine and protection",
    productImage: "shampoo.jpg",
    stockQuantity: 10,
  },
  {
    _id: "2",
    id: "2",
    slug: "hydrating-mask",
    name: "Hydrating Mask",
    price: 35.99,
    description: "Deep moisture treatment for all hair types",
    productImage: "shampoo.jpg",
    stockQuantity: 15,
  },
  {
    _id: "3",
    id: "3",
    slug: "color-protection",
    name: "Color Protection Spray",
    price: 28.99,
    description: "UV protection for color-treated hair",
    productImage: "shampoo.jpg",
    stockQuantity: 0,
  },
  {
    _id: "4",
    id: "4",
    slug: "volumizer",
    name: "Volume Boost Spray",
    price: 32.99,
    description: "Lightweight volumizing spray",
    productImage: "shampoo.jpg",
    stockQuantity: 8,
  },
  {
    _id: "5",
    id: "5",
    slug: "silk-pillowcase",
    name: "Silk Pillowcase",
    price: 49.99,
    description: "Pure silk pillowcase for hair care",
    productImage: "shampoo.jpg",
    stockQuantity: 12,
  },
  {
    _id: "6",
    id: "6",
    slug: "scalp-treatment",
    name: "Scalp Treatment Oil",
    price: 39.99,
    description: "Nourishing scalp treatment",
    productImage: "shampoo.jpg",
    stockQuantity: 7,
  },
];

const categories = [
  { name: "Hair Care", count: 12 },
  { name: "Styling & Finish", count: 8 },
  { name: "Treatments", count: 5 },
  { name: "Tools", count: 3 },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/v1/products?limit=1000`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data = await response.json();

        // Filter hidden products
        const visibleProducts =
          data.data?.data
            ?.filter((product: Product) => !product.isHidden)
            .map((product: Product) => ({
              ...product,
              id: product._id || product.id,
            })) || [];

        setProducts(visibleProducts);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch products",
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const displayProducts = products && products.length > 0 ? products : [];

  return (
    <div>
      {/* HERO SECTION */}
      <ProductsHero />

      {/* PRODUCTS SECTION */}
      <main className="bg-[#F8F6F6]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row gap-8">
            {/* SIDEBAR FILTERS */}
            <FilterSidebar categories={categories} />

            {/* PRODUCTS GRID */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading products...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500">
                    Error loading products: {error}
                  </p>
                </div>
              ) : displayProducts.length > 0 ? (
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
                  <p className="text-gray-500">No products available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
