"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  productImage: string;
  stockQuantity: number;
  discount: number;
}

export default function ManageProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 4000);
  };

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/products?limit=1000`, {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      const productsList = (data.data?.data || []) as Product[];
      setProducts(productsList);
      setFilteredProducts(productsList);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to load products";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply search filter
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const query = searchTerm.toLowerCase();
    const filtered = products.filter((product) => {
      const searchableText = `${(product.name || "").toLowerCase()} ${(product.slug || "").toLowerCase()}`;
      return searchableText.includes(query);
    });

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const lowStockCount = products.filter(
    (p) => (Number(p.stockQuantity) || 0) <= 10,
  ).length;
  const inStockCount = products.filter(
    (p) => (Number(p.stockQuantity) || 0) > 10,
  ).length;

  const getStockColor = (stockQty: number): string => {
    return stockQty <= 10 ? "bg-amber-500 animate-pulse" : "bg-emerald-500";
  };

  const getStockTextColor = (stockQty: number): string => {
    return stockQty <= 10 ? "text-amber-600" : "text-slate-600";
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center text-slate-500">Loading products...</div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toast.visible && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-opacity duration-300 ${
            toast.type === "error" ? "bg-red-600" : "bg-[#CF1745]"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-white overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="relative w-full max-w-md">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search products by name or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-black bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#CF1745]/20"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <Link
              href="/admin/products/add"
              className="bg-[#CF1745] hover:bg-[#CF174580] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#CF174514] transition-all active:scale-95"
            >
              <i className="fa-solid fa-plus"></i>
              Add Product
            </Link>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-8">
          {/* Breadcrumbs & Stats */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl text-black font-black tracking-tight">
                Product Inventory
              </h2>
              <p className="text-slate-500 mt-1">
                Real-time overview of your store's stock levels and catalog.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* In Stock Stat */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm min-w-[160px]">
                <div className="size-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div>
                  <p className="text-xs text-black text-slate-500 font-medium">
                    In Stock
                  </p>
                  <p className="text-lg text-black font-bold">{inStockCount}</p>
                </div>
              </div>

              {/* Low Stock Stat */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm min-w-[160px]">
                <div className="size-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                  <p className="text-xs text-black text-slate-500 font-medium">
                    Low Stock
                  </p>
                  <p className="text-lg text-black font-bold">
                    {lowStockCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredProducts.length === 0 && products.length === 0 ? (
              <p className="col-span-full text-slate-500">
                No products found. Click "Add Product" to create one.
              </p>
            ) : filteredProducts.length === 0 ? (
              <p className="col-span-full text-slate-500">
                No products match your search.
              </p>
            ) : (
              filteredProducts.map((product) => {
                const stockQty = Number(product.stockQuantity) || 0;
                const imageUrl = `/images/products/${product.productImage}`;

                return (
                  <div
                    key={product._id}
                    className="product-card bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-xl hover:shadow-[#CF1745]/5 transition-all"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{
                          backgroundImage: `url('${imageUrl}')`,
                        }}
                      />

                      {/* Low Stock Badge */}
                      {stockQty <= 10 && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                            Low Stock
                          </span>
                        </div>
                      )}

                      {/* Edit Button */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/products/edit?id=${product._id}`}
                          className="size-8 cursor-pointer bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-900 shadow-lg hover:bg-white"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </Link>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-tighter">
                            Slug: {product.slug}
                          </p>
                          <h3 className="font-bold text-black capitalize text-lg leading-tight group-hover:text-[#CF1745] transition-colors">
                            {product.name}
                          </h3>
                        </div>
                        <p className="font-black text-black text-lg">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-2 rounded-full ${getStockColor(stockQty)}`}
                          />
                          <span
                            className={`text-sm font-medium ${getStockTextColor(stockQty)}`}
                          >
                            {stockQty} in stock
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                          {product.discount || 0}% off
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Add New Product Card */}
            <Link
              href="/admin/products/add"
              className="bg-[#CF174505] border-2 border-dashed border-[#CF17451E] rounded-xl flex flex-col items-center justify-center p-8 group cursor-pointer hover:bg-[#CF17450A] transition-all hover:border-[#CF1745]"
            >
              <div className="size-16 rounded-full bg-[#CF174514] flex items-center justify-center text-[#CF1745] group-hover:scale-110 transition-transform mb-4">
                <i className="fa-solid fa-plus text-4xl"></i>
              </div>
              <p className="font-bold text-[#CF1745]">New Product</p>
              <p className="text-slate-400 text-sm mt-1">
                Start tracking a new item
              </p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
