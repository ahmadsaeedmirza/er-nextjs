"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import InstagramPost from "@/components/InstagramPost";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  productImage: string;
  discount?: number;
  slug: string;
  stockQuantity: number;
  isHidden?: boolean;
  salePrice?: number;
}

// Fallback mock products if API fails

export default function Home() {
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
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Add this line
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data = await response.json();

        // Filter hidden products and get first 3
        const visibleProducts =
          data.data?.data
            ?.filter((product: Product) => !product.isHidden)
            .slice(0, 3) || [];

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
      <main className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Image Container */}
        <div className="absolute inset-0 z-0">
          <Image
            alt="Luxury Salon Interior"
            src="/images/landing-page-img.jpg"
            fill
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 hero-gradient bg-black/40" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl text-white">
            <span className="inline-block px-4 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              ESTABLISHED 2012
            </span>

            <h1 className="text-6xl md:text-8xl font-light mb-8 leading-tight">
              Luxury Beauty{" "}
              <span className="font-bold text-primary italic">Experience</span>
            </h1>

            <p className="text-lg text-slate-200 mb-10 leading-relaxed max-w-lg font-light">
              Indulge in the finest hair and skin treatments tailored
              specifically for your lifestyle. Our master stylists blend
              artistry with science for unparalleled results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/bookAppointment"
                className="px-8 py-4 bg-[#CF1745E6] text-white rounded-xl font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-primary/30 text-center"
              >
                Book Appointment
              </Link>
              <Link
                href="/products"
                className="px-8 py-4 bg-transparent border-2 border-white/40 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-white hover:text-[#CF1745E6] transition-all text-center"
              >
                Shop Products
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* SERVICES SECTION */}
      <section className="py-24 bg-white">
        <div className="text-center mb-20">
          <h2 className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-4 text-black">
            Our Services
          </h2>
          <h3 className="text-sm font-semibold text-[#CF1745E6]">
            Premium Care
          </h3>
        </div>
        <div className="flex flex-col max-w-7xl mx-auto px-6">
          <div className="flex justify-end mb-4">
            <Link
              href="/services"
              className="cursor-pointer text-[#CF1745E6] font-semibold flex items-center gap-2 hover:gap-3 transition-all"
            >
              View All
              <i className="fa-solid fa-chevron-right text-[#CF1745E6]" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ServiceCard
              imgUrl="/images/manicure.jpg"
              altText="Professional stylist cutting long hair in salon"
              price="85"
              title="Signature Haircut & Styling"
              description="Personalized consultation, luxury wash, precision cut, and professional blowout."
              duration={60}
            />
            <ServiceCard
              imgUrl="/images/manicure.jpg"
              altText="Model with professional balayage blonde hair highlights"
              price="210"
              title="Bespoke Color Treatment"
              description="Hand-painted highlights for a natural, sun-kissed look. Includes toner and treatment."
              duration={180}
            />
            <ServiceCard
              imgUrl="/images/manicure.jpg"
              altText="Hair treatment being applied in salon bowl"
              price="185"
              title="Rejuvenating Facial"
              description="Deep reparative treatment to eliminate frizz and restore shine for up to 3 months."
              duration={90}
            />
            <ServiceCard
              imgUrl="/images/manicure.jpg"
              altText="Hair treatment being applied in salon bowl"
              price="220"
              title="Deep Tissue Stone Massage"
              description="Deep reparative treatment to eliminate frizz and restore shine for up to 3 months."
              duration={90}
            />
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section className="py-24 bg-[#CF1745E6] text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="text-[20rem] font-bold text-white leading-none -rotate-12 transform -translate-x-20 -translate-y-20">
            LUXURY
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="mb-12">
            <h2 className="text-white text-sm font-bold tracking-[0.3em] uppercase mb-4">
              About Us
            </h2>
            <i className="fa-solid fa-quote-right text-white text-6xl" />
          </div>

          <div>
            <p className="font-white italic leading-relaxed mb-8">
              Welcome to E & R Salon — your destination for beauty, relaxation,
              and self-care. We are passionate about helping you look and feel
              your best in a comfortable and uplifting environment.
            </p>
            <p className="font-white italic leading-relaxed mb-8">
              Our experienced professionals specialize in hair styling,
              skincare, nail artistry, and rejuvenating spa treatments. Every
              client is unique, and we take pride in creating personalized
              experiences that enhance your natural beauty.
            </p>
            <p className="font-white italic leading-relaxed mb-8">
              At E & R, your confidence is our greatest achievement.
            </p>

            <i className="fa-solid fa-quote-left text-white text-6xl mt-12" />
          </div>
        </div>
      </section>

      {/* PRODUCT SECTION */}
      <section className="marble-bg py-24 relative bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-black text-sm font-bold tracking-[0.3em] uppercase mb-4">
              Our Products
            </h2>
            <h3 className="text-sm font-semibold text-[#CF1745E6]">
              Curated Artistry
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading products: {error}</p>
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product._id || product.name}
                  image={`/images/products/${product.productImage}`}
                  title={product.name}
                  description={product.description}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No products available</p>
            </div>
          )}
        </div>
      </section>

      {/* INSTAGRAM GALLERY SECTION */}
      <section className="py-24 bg-[#F8F6F6]/94">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-primary text-black text-sm font-bold tracking-[0.3em] uppercase mb-4">
                Visual Journal
              </h2>
              <h3 className="text-4xl font-light text-black">
                Follow Our Work @E&R_SALON
              </h3>
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 bg-white border border-primary/20 rounded-lg text-sm text-black font-bold uppercase tracking-widest hover:bg-[#CF1745E6] hover:text-white whitespace-nowrap"
            >
              View On Instagram
            </a>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InstagramPost
              imgUrl="/images/massage.jpg"
              altText="Model with elegant hairstyle"
            />
            <InstagramPost
              imgUrl="/images/manicure.jpg"
              altText="Close up of beauty product bottle"
            />
            <InstagramPost
              imgUrl="/images/haircut.jpg"
              altText="Stylist working on client's hair"
            />
            <InstagramPost
              imgUrl="/images/hair-styling.jpg"
              altText="Luxury skincare setup in salon"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
