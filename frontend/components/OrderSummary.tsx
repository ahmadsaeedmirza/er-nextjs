"use client";

import React from "react";

interface OrderSummaryProps {
  subtotal: number;
  tax: number;
  grandTotal: number;
  onPlaceOrder: () => void;
  isLoading?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  tax,
  grandTotal,
  onPlaceOrder,
  isLoading = false,
}) => {
  const handlePlaceOrderClick = () => {
    onPlaceOrder();
  };
  return (
    <div className="w-full lg:w-1/3 text-black flex flex-col items-end">
      <div className="w-full space-y-4 bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span id="subtotal" className="font-medium">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Sales Tax (10%):</span>
          <span id="tax" className="font-medium">
            ${tax.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between border-t pt-4 font-bold text-xl">
          <span>Grand total:</span>
          <span id="grand-total">${grandTotal.toFixed(2)}</span>
        </div>

        <button
          onClick={handlePlaceOrderClick}
          disabled={isLoading || grandTotal === 0}
          className={`w-full mt-6 ${
            isLoading || grandTotal === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#CF1745E6] hover:scale-105"
          } text-white py-4 font-bold uppercase rounded-lg tracking-widest transition-transform`}
        >
          {isLoading ? "Processing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
