"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductCardItemProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  productImage: string;
  stockQuantity: number;
}

export default function ProductCardItem({
  id,
  slug,
  name,
  price,
  description,
  productImage,
  stockQuantity,
}: ProductCardItemProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false, type: "" });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, visible: true, type });
    setTimeout(() => {
      setToast({ message: "", visible: false, type: "" });
    }, 3000);
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const response = await fetch(`${apiUrl}/api/basket/add`, {
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
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add to cart");
      }

      showToast("Item added to cart!", "success");
      // Dispatch event to update cart count in header
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to add to cart",
        "error",
      );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
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

      <div className="group flex flex-col h-full">
        <Link href={`/products/${slug}`} className="block">
          <div className="relative aspect-[4/5] bg-white mb-6 overflow-hidden rounded-lg">
            <Image
              src={`/images/products/${productImage}`}
              alt={name}
              fill
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {stockQuantity === 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                Out of Stock
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1 flex flex-col justify-between text-center">
          <div className="flex-1 flex flex-col justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-2 text-slate-900 line-clamp-2 min-h-[40px] flex items-center justify-center">
              {name}
            </h3>
            <p className="text-[#CF1745] font-mono mt-auto">
              ${Number(price).toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={stockQuantity === 0 || isAdding}
            className={`px-6 py-3 rounded-full text-[12px] font-semibold uppercase tracking-widest w-full transition-all mt-auto ${
              stockQuantity === 0
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[#CF1745] text-white cursor-pointer hover:scale-105 disabled:opacity-50"
            }`}
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </>
  );
}
