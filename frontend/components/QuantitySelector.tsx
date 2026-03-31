"use client";

import { useState } from "react";

interface QuantitySelectorProps {
  maxStock: number;
  onQuantityChange?: (quantity: number) => void;
  disabled?: boolean;
}

export default function QuantitySelector({
  maxStock,
  onQuantityChange,
  disabled = false,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    if (quantity < maxStock) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  return (
    <div className={`flex items-center mb-8 ${disabled ? "opacity-50" : ""}`}>
      <span className="text-sm font-bold uppercase text-black tracking-widest mr-4">
        Quantity:
      </span>
      <div className="flex items-center text-black border border-slate-300 rounded-full">
        <button
          id="decrement"
          className="w-10 h-10 flex items-center justify-center cursor-pointer text-lg hover:bg-slate-100 disabled:cursor-not-allowed"
          onClick={handleDecrement}
          disabled={disabled || quantity <= 1}
        >
          −
        </button>
        <span id="quantity" className="px-4 text-sm font-semibold">
          {quantity}
        </span>
        <button
          id="increment"
          className="w-10 h-10 flex items-center justify-center cursor-pointer text-lg hover:bg-slate-100 disabled:cursor-not-allowed"
          onClick={handleIncrement}
          disabled={disabled || quantity >= maxStock}
          data-stock={maxStock}
        >
          +
        </button>
      </div>
    </div>
  );
}
