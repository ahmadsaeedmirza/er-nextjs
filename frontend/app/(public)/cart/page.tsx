"use client";

import React, { useState, useEffect, useRef } from "react";
import CartItemsList from "@/components/CartItemsList";
import ShippingForm from "@/components/ShippingForm";
import OrderSummary from "@/components/OrderSummary";

interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  detail: string;
}

interface ShippingFormData {
  fullName: string;
  email: string;
  phone: string;
}

export default function CartPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch cart items on component mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  // Calculate totals whenever cart items change
  useEffect(() => {
    calculateTotals();
  }, [cartItems]);

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiUrl}/api/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        console.error(`Cart fetch failed with status ${response.status}`);
        setCartItems([]);
        return;
      }

      const data = await response.json();
      const cartData = Array.isArray(data.data) ? data.data : [];
      setCartItems(cartData);
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Silently set empty cart instead of showing error
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = () => {
    let calculatedSubtotal = 0;

    cartItems.forEach((item) => {
      calculatedSubtotal += item.price * item.quantity;
    });

    const calculatedGrandTotal = calculatedSubtotal;

    setSubtotal(calculatedSubtotal);
    setGrandTotal(calculatedGrandTotal);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item,
      ),
    );
  };

  const handleDeleteItem = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId),
    );
    showToast("Item removed from cart", "success");
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 3000);
  };

  const handlePlaceOrder = async (shippingData: ShippingFormData) => {
    setIsSubmitting(true);
    try {
      const orderData = {
        customerName: shippingData.fullName,
        customerEmail: shippingData.email,
        items: cartItems.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
        totalPrice: grandTotal,
      };

      const response = await fetch(`${apiUrl}/api/v1/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      const result = await response.json();
      console.log("Order placed successfully:", result);

      // Redirect to confirmation page immediately
      window.location.href = "/orderConfirmation";
    } catch (error) {
      console.error("Error placing order:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to place order",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleErrorFromCart = (error: string) => {
    showToast(error, "error");
    // Refresh cart after an error occurred
    fetchCartItems();
  };

  if (isLoading) {
    return (
      <main className="max-w-5xl bg-white mx-auto px-6 py-12">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading your cart...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl bg-white mx-auto px-6 py-12">
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

      <h1 className="text-3xl font-bold mb-10">Your Cart</h1>

      {cartItems.length > 0 ? (
        <>
          {/* Cart Items List */}
          <CartItemsList
            items={cartItems}
            onQuantityChange={handleQuantityChange}
            onDelete={handleDeleteItem}
            onError={handleErrorFromCart}
          />

          {/* Checkout Section */}
          <div className="flex flex-col lg:flex-row mt-12 gap-12">
            {/* Shipping Form */}
            <ShippingForm
              ref={formRef}
              onSubmit={handlePlaceOrder}
              isLoading={isSubmitting}
            />

            {/* Order Summary */}
            <OrderSummary
              subtotal={subtotal}
              grandTotal={grandTotal}
              onPlaceOrder={() => {
                if (formRef.current) {
                  formRef.current.dispatchEvent(
                    new Event("submit", { bubbles: true, cancelable: true }),
                  );
                }
              }}
              isLoading={isSubmitting}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="text-center space-y-6">
            {/* Empty Cart Icon */}
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>

            {/* Empty State Text */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Your Cart is Empty
              </h2>
              <p className="text-gray-600 text-lg">
                Looks like you haven't added anything yet
              </p>
            </div>

            {/* Continue Shopping Button */}
            <a
              href="/products"
              className="inline-block mt-8 bg-[#CF1745] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#b01235] transition-colors"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
