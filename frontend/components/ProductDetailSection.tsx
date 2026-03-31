"use client";

import QuantitySelector from "@/components/QuantitySelector";
import { useState } from "react";

interface ProductDetailSectionProps {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  productImage: string;
}

export default function ProductDetailSection({
  id,
  name,
  description,
  price,
  stockQuantity,
  productImage,
}: ProductDetailSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false, type: "" });
  const isOutOfStock = stockQuantity === 0;
  const isLowStock = stockQuantity < 10 && stockQuantity > 0;

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, visible: true, type });
    setTimeout(() => {
      setToast({ message: "", visible: false, type: "" });
    }, 3000);
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: id,
          name,
          price,
          image: productImage,
          detail: description,
          quantity,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add to cart");
      }

      showToast("Item added to cart!", "success");
      setQuantity(1); // Reset quantity after adding
      // Dispatch event to update cart count in header
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to add to cart",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:w-1/3 flex flex-col justify-center">
      <h2 className="text-3xl font-bold text-slate-900 capitalize mb-4">
        {name}
      </h2>
      <p className="text-slate-600 mb-6">{description}</p>
      <p className="text-2xl font-bold text-[#CF1745] mb-6">
        ${Number(price).toFixed(2)}
      </p>

      {isLowStock && (
        <p className="text-orange-600 text-sm font-semibold mb-4">
          Only {stockQuantity} left in stock
        </p>
      )}

      {isOutOfStock && (
        <p className="text-red-500 text-sm font-semibold mb-8">Out of Stock</p>
      )}

      <QuantitySelector
        maxStock={stockQuantity}
        onQuantityChange={setQuantity}
        disabled={isOutOfStock}
      />

      <button
        className={`py-4 px-8 rounded-full font-bold uppercase tracking-widest transition-colors ${
          isOutOfStock || isLoading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "add-to-cart-btn bg-[#CF1745] text-white cursor-pointer hover:bg-[#b01235]"
        }`}
        disabled={isOutOfStock || isLoading}
        onClick={handleAddToCart}
      >
        {isLoading ? "Adding..." : "Add to Cart"}
      </button>

      {/* Toast Notification */}
      {toast.visible && (
        <div
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-4 rounded-lg text-white font-semibold z-50 transition-opacity whitespace-nowrap ${
            toast.type === "success" ? "bg-[#CF1745]" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
