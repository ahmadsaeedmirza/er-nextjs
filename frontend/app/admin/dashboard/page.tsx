"use client";
 
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

interface DashboardData {
  totals: {
    totalSales: number;
    totalOrders: number;
    pendingOrders: number;
    totalAppointments: number;
  };
  salesTrend: Array<{
    label: string;
    sales: number;
  }>;
  orderStatusCounts: Array<{
    status: string;
    count: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    totalPrice: number;
    status: string;
  }>;
  recentAppointments: Array<{
    customerName: string;
    service: string;
    appointmentDate: string;
    timeSlot: string;
    status: string;
  }>;
  topProducts: Array<{
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(
    "Loading dashboard data...",
  );
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [isConnected, setIsConnected] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchDashboard = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
      setLoadingMessage("Loading dashboard data...");
    }
    try {
      const response = await fetch(`${apiUrl}/api/v1/admin/dashboard-stats`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data.data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load dashboard data";
      if (!silent) {
        setLoadingMessage(message);
      }
      showToast(message, "error");
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [apiUrl, router]);

  // Play synthesized notification sound safely (check SSR)
  const playNotificationSound = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(783.99, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.15);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0.08, audioCtx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(audioCtx.currentTime + 0.1);
      osc2.stop(audioCtx.currentTime + 0.3);
    } catch (error) {
      console.warn("Audio Context error:", error);
    }
  };

  // Socket.io integration
  useEffect(() => {
    const socket = io(apiUrl, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to dashboard socket server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from dashboard socket server");
    });

    socket.on("orderCreated", (order: any) => {
      const displayId = `#ord-${String(order._id || "").slice(-6).toUpperCase()}`;
      showToast(`New Order received: ${displayId}`);
      playNotificationSound();
      fetchDashboard(true);
    });

    socket.on("appointmentCreated", (appt: any) => {
      showToast(`New Appointment: ${appt.customerName || "Client"}`);
      playNotificationSound();
      fetchDashboard(true);
    });

    socket.on("orderUpdated", () => {
      fetchDashboard(true);
    });

    socket.on("orderDeleted", () => {
      fetchDashboard(true);
    });

    socket.on("appointmentUpdated", () => {
      fetchDashboard(true);
    });

    socket.on("appointmentDeleted", () => {
      fetchDashboard(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl]);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 3500);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return formatCurrency(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value || 0);
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (value: string) => {
    const [hours, minutes] = (value || "00:00")
      .split(":")
      .map((p) => Number(p));
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status: string) => {
    if (
      status === "Shipped" ||
      status === "Delivered" ||
      status === "Confirmed"
    ) {
      return "bg-green-100 text-green-700";
    }
    if (status === "Cancelled") {
      return "bg-red-100 text-red-700";
    }
    if (status === "Processing") {
      return "bg-blue-100 text-blue-700";
    }
    return "bg-amber-100 text-amber-700";
  };

  const renderSalesTrendChart = () => {
    if (!dashboardData?.salesTrend.length) {
      return (
        <p className="col-span-6 text-sm text-slate-500">
          No sales trend data available.
        </p>
      );
    }

    const maxSales = Math.max(
      ...dashboardData.salesTrend.map((entry) => entry.sales || 0),
      1,
    );

    return dashboardData.salesTrend.map((entry, idx) => {
      const heightPercent = Math.max(
        6,
        Math.round(((entry.sales || 0) / maxSales) * 100),
      );

      return (
        <div key={idx} className="flex flex-col items-center justify-end gap-2">
          <span className="text-[11px] text-slate-500">
            {formatCompactCurrency(entry.sales)}
          </span>
          <div className="w-full rounded-md bg-[#CF17450F] h-36 flex items-end">
            <div
              className="w-full rounded-md bg-[#CF1745]"
              style={{ height: `${heightPercent}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-600">
            {entry.label}
          </span>
        </div>
      );
    });
  };

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

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all ${
              isConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? "bg-emerald-500" : "bg-rose-500"
                }`}
              ></span>
            </span>
            {isConnected ? "Live Sync" : "Offline"}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="bg-white max-w-7xl mx-auto px-8 py-8">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Business Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live snapshot of sales, orders, appointments, and performance
              trends.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-500">
              {loadingMessage}
            </div>
          )}

          {/* Content */}
          {!isLoading && dashboardData && (
            <div className="space-y-6">
              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Sales
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    {formatCurrency(dashboardData.totals.totalSales)}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Orders
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    {formatNumber(dashboardData.totals.totalOrders)}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Pending Orders
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    {formatNumber(dashboardData.totals.pendingOrders)}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Appointments
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    {formatNumber(dashboardData.totals.totalAppointments)}
                  </p>
                </div>
              </div>

              {/* Charts and Status */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Sales Trend */}
                <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      Sales Trend (6 Months)
                    </h3>
                    <p className="text-xs text-slate-500">Updated live</p>
                  </div>
                  <div className="grid grid-cols-6 gap-3 items-end min-h-[200px]">
                    {renderSalesTrendChart()}
                  </div>
                </div>

                {/* Order Status */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Order Status
                  </h3>
                  <ul className="space-y-2">
                    {dashboardData.orderStatusCounts.length ? (
                      dashboardData.orderStatusCounts.map((status, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                        >
                          <span className="text-sm font-medium text-slate-700">
                            {status.status}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {formatNumber(status.count)}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-slate-500">
                        No order status data found.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Recent Orders and Appointments */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Recent Orders */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">
                      Recent Orders
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Order
                          </th>
                          <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dashboardData.recentOrders.length ? (
                          dashboardData.recentOrders.map((order, idx) => {
                            const displayId = `#ord-${String(order.id || "")
                              .slice(-6)
                              .toUpperCase()}`;
                            return (
                              <tr key={idx}>
                                <td className="px-5 py-3 text-sm font-semibold text-slate-800">
                                  {displayId}
                                </td>
                                <td className="px-5 py-3 text-sm text-slate-700">
                                  {order.customerName || "Customer"}
                                </td>
                                <td className="px-5 py-3 text-sm font-semibold text-slate-900">
                                  {formatCurrency(order.totalPrice)}
                                </td>
                                <td className="px-5 py-3">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusClass(order.status)}`}
                                  >
                                    {order.status || "Pending"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-5 py-6 text-sm text-slate-500 text-center"
                            >
                              No recent orders.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Appointments */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">
                      Recent Appointments
                    </h3>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {dashboardData.recentAppointments.length ? (
                      dashboardData.recentAppointments.map((appt, idx) => (
                        <li
                          key={idx}
                          className="px-5 py-4 flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {appt.customerName || "Client"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {appt.service || "Service"} ·{" "}
                              {formatDate(appt.appointmentDate)} ·{" "}
                              {formatTime(appt.timeSlot)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusClass(appt.status)}`}
                          >
                            {appt.status || "Pending"}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="px-5 py-5 text-sm text-slate-500">
                        No recent appointments.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Top Products by Quantity Sold
                </h3>
                <ul className="space-y-2">
                  {dashboardData.topProducts.length ? (
                    dashboardData.topProducts.map((product, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {product.name || "Product"}
                          </p>
                          <p className="text-xs text-slate-500">
                            Revenue: {formatCurrency(product.revenue)}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {formatNumber(product.quantitySold)} sold
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500">
                      No product sales data available.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
