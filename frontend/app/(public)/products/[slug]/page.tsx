import type { Metadata } from "next";
import ProductImageSection from "@/components/ProductImageSection";
import ProductDetailSection from "@/components/ProductDetailSection";
import ProductCardItem from "@/components/ProductCardItem";
import Link from "next/link";

interface ProductOnePageProps {
  params: Promise<{
    slug: string;
  }>;
}

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
  additionalImages?: string[];
}

export async function generateMetadata(
  { params }: ProductOnePageProps
): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found - E & R Salon",
      description: "The requested salon product could not be found.",
    };
  }

  return {
    title: `${product.name} - E & R Salon`,
    description: product.description || `Buy ${product.name} premium product online at E & R Salon.`,
  };
}

async function fetchProduct(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // First try: fetch specific slug
    const response = await fetch(`${apiUrl}/api/v1/products/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const product = data.data?.data;

      if (product) {
        return {
          ...product,
          id: product._id,
        };
      }
    }

    // Fallback: fetch all products and find by slug
    const fallbackResponse = await fetch(`${apiUrl}/api/v1/products?limit=1000`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      const products = fallbackData.data?.data || [];
      const foundProduct = products.find(
        (p: Product) => p.slug === slug && !p.isHidden,
      );

      if (foundProduct) {
        return {
          ...foundProduct,
          id: foundProduct._id,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

async function fetchRecommendations(currentProductId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/v1/products?limit=1000`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
    });

    if (response.ok) {
      const data = await response.json();
      const products = data.data?.data || [];

      // Filter out current product and hidden products
      const eligible = products.filter(
        (p: Product) => p._id !== currentProductId && !p.isHidden
      );

      // Select 3 random products
      const shuffled = [...eligible].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3).map((p: Product) => ({
        ...p,
        id: p._id,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
}

export default async function ProductOnePage({ params }: ProductOnePageProps) {
  const { slug } = await params;

  // Try to fetch from backend
  const product = await fetchProduct(slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-slate-600">
            {"Sorry, we couldn't find the product you're looking for."}
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block px-6 py-3 bg-[#CF1745] text-white rounded-lg font-semibold hover:scale-105 transition-transform"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Fetch 3 random recommendations
  const recommendations = await fetchRecommendations(product.id || product._id);

  return (
    <section className="max-w-7xl bg-white mx-auto px-6 pb-24 pt-[169px]">
      <div className="flex flex-col md:flex-row gap-12">
        <ProductImageSection
          src={`/images/products/${product.productImage}`}
          alt={product.name}
          isOutOfStock={product.stockQuantity === 0}
          additionalImages={product.additionalImages}
        />

        <ProductDetailSection
          id={product.id}
          name={product.name}
          description={product.description}
          price={product.price}
          stockQuantity={product.stockQuantity}
          productImage={product.productImage}
        />
      </div>

      {/* YOU MAY ALSO LIKE SECTION */}
      {recommendations.length > 0 && (
        <div className="mt-24 border-t border-slate-100 pt-16">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-900 mb-10 text-center">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((prod: Product) => (
              <ProductCardItem
                key={prod.id || prod._id}
                id={prod.id || prod._id}
                slug={prod.slug}
                name={prod.name}
                price={prod.price}
                description={prod.description}
                productImage={prod.productImage}
                stockQuantity={prod.stockQuantity}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
