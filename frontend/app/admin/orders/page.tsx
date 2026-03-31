"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
}

interface Order {
  id: string;
  displayId: string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  status: string;
  items: OrderItem[];
  itemCount: number;
  createdAt: Date;
  createdAtLabel: string;
  searchText: string;
}

export default function ManageOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const pageSize = 6;

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 4000);
  };

  // Load orders
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/orders?limit=1000&sort=-createdAt`, {
          credentials: "include",
        }),
        fetch(`${apiUrl}/api/v1/products?limit=1000`, {
          credentials: "include",
        }),
      ]);

      if (ordersRes.status === 401 || productsRes.status === 401) {
        router.push("/login");
        return;
      }

      if (!ordersRes.ok || !productsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();

      const productsList = productsData.data?.data || [];
      const productsMap = new Map<string, string>(
        productsList.map((p: any) => [String(p._id), p.name]),
      );

      const ordersList = (ordersData.data?.data || []).map((order: any) =>
        normalizeOrder(order, productsMap),
      );

      setOrders(ordersList);
      setCurrentPage(1);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to load orders";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeOrder = (
    order: any,
    productsMap: Map<string, string>,
  ): Order => {
    const createdAtDate = new Date(order.createdAt);
    const normalizedItems = (order.items || []).map((item: any) => {
      const productValue = item?.product;
      const productId =
        typeof productValue === "object" && productValue !== null
          ? String(productValue._id || "")
          : String(productValue || "");

      const productName =
        (typeof productValue === "object" && productValue?.name) ||
        productsMap.get(productId) ||
        "Product";

      return {
        productId,
        productName,
        quantity: Number(item?.quantity || 0),
      };
    });

    const itemCount = normalizedItems.reduce(
      (sum: number, item: OrderItem) => sum + item.quantity,
      0,
    );

    const searchText = [
      order._id,
      order.customerName,
      order.customerEmail,
      order.status,
      normalizedItems.map((item: OrderItem) => item.productName).join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return {
      id: String(order._id),
      displayId: `#ord-${String(order._id).slice(-6).toUpperCase()}`,
      customerName: order.customerName || "Unknown customer",
      customerEmail: order.customerEmail || "No email",
      totalPrice: Number(order.totalPrice || 0),
      status: order.status || "Pending",
      items: normalizedItems,
      itemCount,
      createdAt: createdAtDate,
      createdAtLabel: formatDate(createdAtDate),
      searchText,
    };
  };

  // Apply filters
  useEffect(() => {
    let filtered = orders;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((order) =>
        order.searchText.includes(lowerSearch),
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update order");
      }

      const data = await response.json();
      const updatedOrder = data.data?.data;

      if (!updatedOrder) throw new Error("No order data returned");

      const productsMap = new Map<string, string>();
      const normalized = normalizeOrder(updatedOrder, productsMap);

      setOrders((prev) => {
        const index = prev.findIndex((o) => o.id === orderId);
        if (index !== -1) {
          return [
            ...prev.slice(0, index),
            normalized,
            ...prev.slice(index + 1),
          ];
        }
        return [normalized, ...prev];
      });

      showToast("Order status updated to shipped.");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update order status";
      showToast(errorMessage, "error");
    }
  };

  const formatDate = (date: Date): string => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return "Invalid date";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number): string => {
    return Number(value || 0).toFixed(2);
  };

  const getStatusClass = (status: string): string => {
    if (status === "Shipped" || status === "Delivered") {
      return "bg-green-100 text-green-700";
    }
    if (status === "Cancelled") {
      return "bg-red-100 text-red-700";
    }
    return "bg-amber-100 text-amber-700";
  };

  const canShip = (status: string): boolean => {
    return !["Shipped", "Delivered", "Cancelled"].includes(status);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center text-slate-500">Loading orders...</div>
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
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h1 className="text-3xl font-black text-slate-900 pb-4 tracking-tight">
              Orders Overview
            </h1>
            <button
              onClick={() => loadOrders()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white"
            >
              <i className="fa-solid fa-rotate-right"></i>
              Refresh
            </button>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="search"
                  placeholder="Search by Order ID, customer or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#CF1745]/20 placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center bg-slate-50 rounded-lg p-1 shrink-0">
                {["All", "Pending", "Shipped"].map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setStatusFilter(status === "All" ? "all" : status)
                    }
                    className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                      (status === "All" && statusFilter === "all") ||
                      (status !== "All" && statusFilter === status)
                        ? "font-bold bg-white shadow-sm text-slate-900"
                        : "font-medium text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                      Order Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-slate-500"
                      >
                        {filteredOrders.length === 0
                          ? "No orders found."
                          : "No orders match the current filters."}
                      </td>
                    </tr>
                  ) : (
                    currentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-[#CF1745]">
                            {order.displayId}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">
                            {order.createdAtLabel}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {order.customerEmail}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {order.itemCount} item
                          {order.itemCount === 1 ? "" : "s"}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          ${formatCurrency(order.totalPrice)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusClass(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                          {canShip(order.status) && (
                            <button
                              onClick={() =>
                                updateOrderStatus(order.id, "Shipped")
                              }
                              className="block mt-2 text-xs font-medium text-[#CF1745] hover:underline"
                            >
                              Change to shipped?
                            </button>
                          )}
                          {order.status === "Shipped" && (
                            <p className="text-xs mt-2 text-slate-500">
                              Already shipped
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ul className="text-sm text-slate-600 space-y-1">
                            {order.items.length > 0 ? (
                              order.items.map((item, idx) => (
                                <li key={idx}>
                                  {item.productName} | {item.quantity}
                                </li>
                              ))
                            ) : (
                              <li>No items</li>
                            )}
                          </ul>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">
                {filteredOrders.length === 0
                  ? "Showing 0 orders"
                  : `Showing ${startIndex + 1} to ${Math.min(startIndex + currentOrders.length, filteredOrders.length)} of ${filteredOrders.length} orders`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="p-2 border border-slate-200 rounded hover:bg-white transition-colors disabled:opacity-50"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      const maxButtons = 5;
                      let startPage = Math.max(1, currentPage - 2);
                      let endPage = Math.min(
                        totalPages,
                        startPage + maxButtons - 1,
                      );
                      if (endPage - startPage + 1 < maxButtons) {
                        startPage = Math.max(1, endPage - maxButtons + 1);
                      }
                      return page >= startPage && page <= endPage;
                    })
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded text-sm font-bold ${
                          page === currentPage
                            ? "bg-[#CF1745] text-white"
                            : "border border-slate-200 text-slate-700 hover:bg-white"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="p-2 border border-slate-200 rounded hover:bg-white transition-colors disabled:opacity-50"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
