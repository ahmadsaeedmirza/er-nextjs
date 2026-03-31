"use client";

import React from "react";
import CartItem from "./CartItem";

interface CartItemData {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  detail: string;
}

interface CartItemsListProps {
  items: CartItemData[];
  onQuantityChange: (productId: string, newQuantity: number) => void;
  onDelete: (productId: string) => void;
  onError?: (error: string) => void;
}

const CartItemsList: React.FC<CartItemsListProps> = ({
  items,
  onQuantityChange,
  onDelete,
  onError,
}) => {
  if (!items || items.length === 0) {
    return (
      <p className="py-10 text-center text-gray-500">Your cart is empty.</p>
    );
  }

  return (
    <>
      {/* Table Header - Hidden on mobile */}
      <div className="hidden md:grid grid-cols-12 text-sm text-gray-500 uppercase border-b text-black pb-4 mb-2">
        <div className="col-span-6">Item</div>
        <div className="col-span-2 text-right">Price</div>
        <div className="col-span-2 text-center">Quantity</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {/* Cart Items */}
      {items.map((item) => (
        <CartItem
          key={item.productId}
          productId={item.productId}
          name={item.name}
          image={item.image}
          price={item.price}
          quantity={item.quantity}
          detail={item.detail}
          onQuantityChange={onQuantityChange}
          onDelete={onDelete}
          onError={onError}
        />
      ))}
    </>
  );
};

export default CartItemsList;
