"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  stockQuantity: number;
  productImage: string;
  isHidden: boolean;
}

export default function AddEditProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "0",
    stockQuantity: "0",
    productImage: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [msgBox, setMsgBox] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProductHidden, setIsProductHidden] = useState(false);
  const [verifyModal, setVerifyModal] = useState({
    visible: false,
    password: "",
  });
  const [pendingAction, setPendingAction] = useState<"delete" | "hide" | null>(
    null,
  );
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Compute isEditing from productId
  const isEditing = !!productId;

  // Extract product ID from search params
  useEffect(() => {
    if (searchParams) {
      const id = searchParams.get("id");
      setProductId(id);
    }
  }, [searchParams]);

  // Load product if editing
  useEffect(() => {
    if (productId) {
      loadProduct(productId);
    } else {
      setIsLoading(false);
    }
  }, [productId]);

  const loadProduct = async (id: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/products/${id}`, {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error("Failed to load product");

      const data = await response.json();
      const prod = data.data?.data as Product;

      setProduct(prod);
      setFormData({
        name: prod.name,
        description: prod.description,
        price: String(prod.price),
        discount: String(prod.discount || 0),
        stockQuantity: String(prod.stockQuantity),
        productImage: null,
      });
      setImagePreview(`/images/products/${prod.productImage}`);
      setIsProductHidden(prod.isHidden);

      // Get admin email from cookie or session
      setAdminEmail(localStorage.getItem("adminEmail") || "Admin");
    } catch (error) {
      console.error("Error loading product:", error);
      setMsgBox({
        visible: true,
        message: `Failed to load product: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, productImage: file }));

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const fileInput = document.getElementById(
      "productImageInput",
    ) as HTMLInputElement;
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    handleImageChange({
      target: fileInput,
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleStockChange = (delta: number) => {
    const current = parseInt(formData.stockQuantity) || 0;
    const newValue = Math.max(0, current + delta);
    setFormData((prev) => ({ ...prev, stockQuantity: String(newValue) }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsgBox({ visible: false, message: "", type: "success" });

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("discount", formData.discount);
      data.append("stockQuantity", formData.stockQuantity);
      if (formData.productImage) {
        data.append("productImage", formData.productImage);
      }

      const isEditing = !!productId;
      const url = isEditing
        ? `${apiUrl}/api/v1/products/${productId}`
        : `${apiUrl}/api/v1/products`;
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        body: data,
        credentials: "include",
      });

      const result = await response.json();

      if (result.status === "success") {
        setMsgBox({
          visible: true,
          message: isEditing
            ? "Product updated successfully!"
            : "Product added successfully!",
          type: "success",
        });
        setTimeout(() => {
          router.push("/admin/products");
        }, 1500);
      } else {
        setMsgBox({
          visible: true,
          message: result.message || "Something went wrong",
          type: "error",
        });
      }
    } catch (error) {
      setMsgBox({
        visible: true,
        message: "Network error. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openVerifyModal = (action: "delete" | "hide") => {
    setPendingAction(action);
    setVerifyModal({ visible: true, password: "" });
    setVerifyError("");
  };

  const closeVerifyModal = () => {
    setVerifyModal({ visible: false, password: "" });
    setPendingAction(null);
    setVerifyError("");
  };

  const verifyPassword = async () => {
    if (!verifyModal.password.trim()) {
      setVerifyError("Please enter your password.");
      return;
    }

    setVerifyLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/admin/verifyPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: verifyModal.password }),
      });

      const data = await response.json();

      if (data.status === "success") {
        // Password verified, run the pending action
        await runPendingAction();
        closeVerifyModal();
      } else {
        setVerifyError(data.message || "Password verification failed.");
      }
    } catch (error) {
      setVerifyError("Error verifying password. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const runPendingAction = async () => {
    if (pendingAction === "delete") {
      const response = await fetch(`${apiUrl}/api/v1/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 204) {
        setMsgBox({
          visible: true,
          message: "Product deleted successfully!",
          type: "success",
        });
        setTimeout(() => {
          router.push("/admin/products");
        }, 1000);
        return;
      }

      const data = await response.json();
      throw new Error(data.message || "Delete failed");
    }

    if (pendingAction === "hide") {
      const response = await fetch(
        `${apiUrl}/api/v1/products/${productId}/visibility`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ isHidden: !isProductHidden }),
        },
      );

      const data = await response.json();

      if (data.status === "success") {
        setIsProductHidden(!isProductHidden);
        setMsgBox({
          visible: true,
          message: !isProductHidden
            ? "Product hidden from website."
            : "Product is now visible on website.",
          type: "success",
        });
      } else {
        throw new Error(data.message || "Visibility update failed");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center text-slate-500">Loading product...</div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-slate-500 mt-1">
              {isEditing
                ? "Update product details, media, and stock levels."
                : "Fill in the details to add a new product to your catalog."}
            </p>
          </div>
          <Link
            href="/admin/products"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-xs"></i>
            Back to Products
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-8">
          {/* General Information Section */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 text-slate-900">
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#CF174514] focus:border-[#CF1745] outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#CF174514] focus:border-[#CF1745] outline-none transition-all resize-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#CF174514] focus:border-[#CF1745] outline-none transition-all"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  name="discount"
                  placeholder="0"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#CF174514] focus:border-[#CF1745] outline-none transition-all"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Stock Quantity
                </label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => handleStockChange(-1)}
                    className="px-4 py-3 text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  <input
                    type="number"
                    min="0"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    className="flex-1 text-center border-none bg-transparent text-slate-900 focus:ring-0 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleStockChange(1)}
                    className="px-4 py-3 text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Product Image Section */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">
              Product Image
            </h3>
            <div
              className="relative group cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleImageDrop}
            >
              <div className="w-full aspect-[21/9] bg-slate-100 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-[#CF1745] transition-all relative">
                {/* Image Preview */}
                {imagePreview && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${imagePreview}')` }}
                  />
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fa-solid fa-cloud-arrow-up text-4xl mb-2"></i>
                  <p className="font-medium">Click to upload image</p>
                  <p className="text-xs opacity-80 mt-1">
                    PNG, JPG or WEBP • Max 5MB
                  </p>
                </div>

                {/* Default Placeholder */}
                {!imagePreview && (
                  <div className="relative z-0 flex flex-col items-center text-slate-400">
                    <i className="fa-solid fa-image text-5xl"></i>
                    <p className="text-sm mt-3">Click to upload an image</p>
                  </div>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                id="productImageInput"
                type="file"
                name="productImage"
                accept="image/*"
                onChange={handleImageChange}
                onClick={(e) => {
                  const div = document.querySelector(
                    "[onDragOver]",
                  ) as HTMLDivElement;
                  if (div) div.click();
                }}
                className="hidden"
              />

              <div
                onClick={() =>
                  document.getElementById("productImageInput")?.click()
                }
                className="absolute inset-0 z-0 cursor-pointer"
              />
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 py-4">
            {isEditing && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => openVerifyModal("hide")}
                  className="px-5 py-3 rounded-lg border border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 transition-colors cursor-pointer"
                >
                  {isProductHidden ? "Show on Website" : "Hide from Website"}
                </button>
                <button
                  type="button"
                  onClick={() => openVerifyModal("delete")}
                  className="px-5 py-3 rounded-lg border border-red-300 text-red-700 font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Delete Product
                </button>
              </div>
            )}

            <div className="flex items-center gap-4 ml-auto">
              <Link
                href="/admin/products"
                className="px-6 py-3 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Discard
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#CF1745] hover:bg-[#a01035] text-white rounded-lg cursor-pointer font-bold shadow-lg shadow-[#CF174514] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                <span>
                  {isSubmitting
                    ? isEditing
                      ? "Saving..."
                      : "Adding..."
                    : isEditing
                      ? "Save Changes"
                      : "Add Product"}
                </span>
              </button>
            </div>
          </div>

          {/* Message Box */}
          {msgBox.visible && (
            <div
              className={`mt-4 p-4 rounded-lg text-sm font-medium ${
                msgBox.type === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {msgBox.message}
            </div>
          )}
        </form>
      </div>

      {/* Verify Identity Modal */}
      {isEditing && (
        <div
          className={`fixed inset-0 z-[60] ${verifyModal.visible ? "flex" : "hidden"} items-center justify-center bg-black/50 p-4`}
          onClick={closeVerifyModal}
        >
          <div
            className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Verify Identity
            </h3>
            <p className="text-sm text-slate-600 mb-1">
              Please confirm your password to continue.
            </p>
            <p className="text-sm text-slate-700 mb-4">
              Logged in as: <span className="font-semibold">{adminEmail}</span>
            </p>

            <p className="text-sm font-semibold text-slate-700 mb-2">
              {pendingAction === "delete"
                ? "You are about to delete this product permanently."
                : isProductHidden
                  ? "You are about to show this product on the website."
                  : "You are about to hide this product from the website."}
            </p>

            <input
              type="password"
              placeholder="Enter your password"
              value={verifyModal.password}
              onChange={(e) =>
                setVerifyModal({ ...verifyModal, password: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#CF174514] focus:border-[#CF1745] outline-none transition-all"
            />

            {verifyError && (
              <p className="text-sm text-red-600 mt-2">{verifyError}</p>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeVerifyModal}
                className="px-4 py-2 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={verifyPassword}
                disabled={verifyLoading}
                className="px-5 py-2 rounded-lg bg-[#CF1745] text-white font-semibold hover:bg-[#a01035] transition-colors disabled:opacity-50"
              >
                {verifyLoading ? "Verifying..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
