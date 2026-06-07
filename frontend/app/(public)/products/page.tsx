import type { Metadata } from "next";
import ProductsHero from "@/components/ProductsHero";
import ProductFilterContainer from "@/components/ProductFilterContainer";

export const metadata: Metadata = {
  title: "Our Products - E & R Salon",
  description: "Browse our exclusive collection of high-performance beauty and styling essentials.",
};

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

async function fetchProducts() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/api/v1/products?limit=1000`, {
    cache: "no-store",
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

  return visibleProducts;
}

export default async function Products() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    products = await fetchProducts();
  } catch (err) {
    console.error("Error fetching products:", err);
    error = err instanceof Error ? err.message : "Failed to fetch products";
  }

  return (
    <div>
      {/* HERO SECTION */}
      <ProductsHero />

      {error ? (
        <main className="bg-[#F8F6F6] pb-24 pt-16">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading products: {error}</p>
          </div>
        </main>
      ) : (
        <ProductFilterContainer initialProducts={products} />
      )}
    </div>
  );
}

