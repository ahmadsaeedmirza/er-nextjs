"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Header({ cartCount = 0 }: { cartCount?: number }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCountState, setCartCountState] = useState(cartCount);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    // Fetch cart count from API
    const fetchCartCount = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/basket`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data.data) ? data.data : [];
          const count = items.reduce(
            (acc: number, item: { quantity: number }) => acc + item.quantity,
            0,
          );
          setCartCountState(count);
        }
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
      }
    };

    fetchCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [apiUrl]);

  const isActive = (path: string) => pathname === path;

  return (
    <header>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md">
        <div className="relative max-w-7xl mx-auto px-6 h-25 flex items-center justify-between py-3">
          {/* nav logo */}
          <Link
            href="/"
            className="text-4xl font-bold text-primary font-dancing"
          >
            <div className="relative h-20 w-48">
              <Image
                src="/images/logo-3.png"
                alt="Salon Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-black">
            <Link
              href="/"
              className={`relative group py-2 text-sm font-semibold uppercase tracking-widest transition-colors hover:text-[#CF1745] ${
                isActive("/") ? "text-[#CF1745]" : ""
              }`}
            >
              Home
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#CF1745] origin-center transition-transform duration-300 ease-out ${
                  isActive("/")
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <Link
              href="/services"
              className={`relative group py-2 text-sm font-semibold uppercase tracking-widest transition-colors hover:text-[#CF1745] ${
                isActive("/services") ? "text-[#CF1745]" : ""
              }`}
            >
              Services
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#CF1745] origin-center transition-transform duration-300 ease-out ${
                  isActive("/services")
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <Link
              href="/products"
              className={`relative group py-2 text-sm font-semibold uppercase tracking-widest transition-colors hover:text-[#CF1745] ${
                isActive("/products") ? "text-[#CF1745]" : ""
              }`}
            >
              Products
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#CF1745] origin-center transition-transform duration-300 ease-out ${
                  isActive("/products")
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <Link
              href="/bookAppointment"
              className={`relative group py-2 text-sm font-semibold uppercase tracking-widest transition-colors hover:text-[#CF1745] ${
                isActive("/bookAppointment") ? "text-[#CF1745]" : ""
              }`}
            >
              Book Appointment
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#CF1745] origin-center transition-transform duration-300 ease-out ${
                  isActive("/bookAppointment")
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <Link
              href="/contactUs"
              className={`relative group py-2 text-sm font-semibold uppercase tracking-widest transition-colors hover:text-[#CF1745] ${
                isActive("/contactUs") ? "text-[#CF1745]" : ""
              }`}
            >
              Contact Us
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#CF1745] origin-center transition-transform duration-300 ease-out ${
                  isActive("/contactUs")
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <Link
              href="/cart"
              className={`relative transition-colors ${
                cartCountState > 0
                  ? "text-[#CF1745]"
                  : "text-black hover:text-[#CF1745]"
              }`}
            >
              <span className="fa-solid fa-cart-shopping text-xl" />
              {cartCountState > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#CF1745] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white font-bold">
                  {cartCountState}
                </span>
              )}
            </Link>
          </div>
          {/* Mobile Hamburger Button */}
          <button
            id="mobile-menu-btn"
            className="md:hidden text-2xl p-2 text-[#CF1745] focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={mobileMenuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
          </button>
        </div>
        {/* Mobile Menu Container (Hidden by default) */}
        <div
          id="mobile-menu"
          className={`${
            mobileMenuOpen ? "flex" : "hidden"
          } md:hidden bg-white flex-col items-center gap-4 py-6 transition-all duration-300 ease-in-out`}
        >
          <Link
            href="/"
            className={`text-sm font-semibold uppercase transition-colors hover:text-[#CF1745] ${
              isActive("/") ? "text-[#CF1745]" : "text-black"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/products"
            className={`text-sm font-semibold uppercase transition-colors hover:text-[#CF1745] ${
              isActive("/products") ? "text-[#CF1745]" : "text-black"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            href="/services"
            className={`text-sm font-semibold uppercase transition-colors hover:text-[#CF1745] ${
              isActive("/services") ? "text-[#CF1745]" : "text-black"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            href="/bookAppointment"
            className={`text-sm font-semibold uppercase transition-colors hover:text-[#CF1745] ${
              isActive("/bookAppointment") ? "text-[#CF1745]" : "text-black"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Book Appointment
          </Link>
          <Link
            href="/contactUs"
            className={`text-sm font-semibold uppercase transition-colors hover:text-[#CF1745] ${
              isActive("/contactUs") ? "text-[#CF1745]" : "text-black"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact Us
          </Link>
          <Link
            href="/cart"
            className={`relative transition-colors ${
              cartCountState > 0
                ? "text-[#CF1745]"
                : "text-black hover:text-[#CF1745]"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="fa-solid fa-cart-shopping text-xl" />
            {cartCountState > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#CF1745] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white font-bold">
                {cartCountState}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
