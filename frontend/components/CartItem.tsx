"use client";

import React, { useState } from "react";
import Image from "next/image";

interface CartItemProps {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  detail: string;
  onQuantityChange: (productId: string, newQuantity: number) => void;
  onDelete: (productId: string) => void;
  onError?: (error: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  productId,
  name,
  image,
  price,
  quantity,
  detail,
  onQuantityChange,
  onDelete,
  onError,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const itemTotal = price * quantity;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Normalize image path - convert relative paths to absolute paths
  const normalizeImagePath = (imagePath: string) => {
    if (!imagePath) return "/images/placeholder.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return imagePath;
    return `/images/products/${imagePath}`;
  };

  const imageSrc = normalizeImagePath(image);

  const handleIncrease = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${apiUrl}/api/cart/update-quantity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          quantity: quantity + 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update quantity");
      }

      onQuantityChange(productId, quantity + 1);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : "Failed to update quantity",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrease = async () => {
    if (quantity <= 1) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${apiUrl}/api/cart/update-quantity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          quantity: quantity - 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update quantity");
      }

      onQuantityChange(productId, quantity - 1);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : "Failed to update quantity",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${apiUrl}/api/cart/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove item");
      }

      onDelete(productId);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : "Failed to remove item",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="cart-item grid grid-cols-1 md:grid-cols-12 text-black items-center border-b py-6 gap-4">
      {/* Change items-start to items-center here */}
      <div className="col-span-6 flex gap-4 items-center">
        <div className="relative w-20 h-20">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover rounded-md"
          />
        </div>

        <div className="w-2/4">
          <h3 className="font-bold text-lg">{name}</h3>
        </div>

        <div className="flex justify-end w-1/4">
          <button
            onClick={handleDelete}
            disabled={isUpdating}
            title="Delete item"
            className="grid place-items-center w-8 h-8 cursor-pointer hover:text-[#CF1745] transition text-xl disabled:opacity-50"
          >
            <i className="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>

      <div className="md:col-span-2 text-right font-medium item-price">
        ${price.toFixed(2)}
      </div>

      <div className="md:col-span-2 flex justify-center">
        <div className="flex items-center border border-gray-300 rounded">
          <button
            onClick={handleDecrease}
            disabled={isUpdating || quantity <= 1}
            className="qty-decrease px-3 py-1 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="qty-value px-4 text-sm">{quantity}</span>
          <button
            onClick={handleIncrease}
            disabled={isUpdating}
            className="qty-increase px-3 py-1 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      <div className="md:col-span-2 text-right font-bold item-total">
        ${itemTotal.toFixed(2)}
      </div>
    </div>
  );
};

export default CartItem;
