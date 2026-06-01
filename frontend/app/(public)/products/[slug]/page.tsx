import ProductImageSection from "@/components/ProductImageSection";
import ProductDetailSection from "@/components/ProductDetailSection";

// Mock product data - Fallback only
const mockProducts: Record<string, any> = {
  "signature-serum": {
    _id: "1",
    id: "1",
    slug: "signature-serum",
    name: "Signature Hair Serum",
    description:
      "Our premium hair serum is formulated with natural oils and essential nutrients to provide deep nourishment and shine to your hair. Reduces frizz, strengthens hair, and provides UV protection. Perfect for all hair types.",
    price: 45.99,
    productImage: "shampoo.jpg",
    stockQuantity: 10,
  },
  "hydrating-mask": {
    _id: "2",
    id: "2",
    slug: "hydrating-mask",
    name: "Hydrating Mask",
    description:
      "Deep moisture treatment designed for all hair types. This luxurious mask penetrates the hair shaft to restore moisture, elasticity, and shine. Use once weekly for best results.",
    price: 35.99,
    productImage: "shampoo.jpg",
    stockQuantity: 15,
  },
  "color-protection": {
    _id: "3",
    id: "3",
    slug: "color-protection",
    name: "Color Protection Spray",
    description:
      "UV protection spray that shields color-treated hair from sun damage and fading. Lightweight formula with anti-humidity technology. Apply before sun exposure.",
    price: 28.99,
    productImage: "shampoo.jpg",
    stockQuantity: 0,
  },
};

interface ProductOnePageProps {
  params: Promise<{
    slug: string;
  }>;
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
        (p: any) => p.slug === slug && !p.isHidden,
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

export default async function ProductOnePage({ params }: ProductOnePageProps) {
  const { slug } = await params;

  // Try to fetch from backend
  let product = await fetchProduct(slug);

  // Fall back to mock data if backend fetch fails
  if (!product) {
    product = mockProducts[slug];
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-slate-600">
            Sorry, we couldn't find the product you're looking for.
          </p>
          <a
            href="/products"
            className="mt-6 inline-block px-6 py-3 bg-[#CF1745] text-white rounded-lg font-semibold hover:scale-105 transition-transform"
          >
            Back to Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl bg-white mx-auto px-6 pb-24 pt-[169px]">
      <div className="flex flex-col md:flex-row gap-12">
        <ProductImageSection
          src={`/images/products/${product.productImage}`}
          alt={product.name}
          isOutOfStock={product.stockQuantity === 0}
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
    </section>
  );
}
