"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const openBtn = document.getElementById("openSidebar");
      const closeBtn = document.getElementById("closeSidebar");

      if (
        sidebar &&
        !sidebar.contains(e.target as Node) &&
        !openBtn?.contains(e.target as Node) &&
        !closeBtn?.contains(e.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [sidebarOpen]);

  const handleLogout = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      await fetch(`${apiUrl}/api/v1/admin/logout`, {
        method: "GET",
        credentials: "include",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#CF1745] border-b border-slate-200 fixed top-0 w-full z-40">
        <div className="flex items-center gap-2">
          <img
            src="/images/logo-white.png"
            alt="E & R Salon"
            className="w-[100px] h-auto"
          />
          <h1 className="text-lg italic font-semibold text-white">
            E & R Salon
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="openSidebar"
            className="p-2"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="fa-solid fa-bars text-white text-lg"></i>
          </button>
          <button
            id="closeSidebar"
            className={`p-2 text-white ${!sidebarOpen ? "hidden" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed inset-y-0 text-white left-0 z-30 w-64 bg-[#CF1745] border-r border-slate-200 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:flex pt-20 md:pt-0`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <img
            src="/images/logo-white.png"
            alt="E & R Salon"
            className="w-[100px] h-auto"
          />
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <div className="pb-4">
            <div className="flex items-center gap-3 mb-2 px-3">
              <p className="text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                Main Menu
              </p>
              <div className="flex-1 h-px bg-white"></div>
            </div>
            <a
              href="/admin/dashboard"
              className="flex items-center gap-3 px-3 pt-3 pb-2 mb-3 relative group transition-all duration-300"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fa-solid text-white fa-chart-line"></i>
              <span className="text-sm font-medium">Dashboard</span>
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>
            <a
              href="/admin/orders"
              className="flex items-center gap-3 px-3 pt-3 pb-2 mb-3 relative group transition-all duration-300"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fa-solid text-white fa-shopping-cart"></i>
              <span className="text-sm font-medium">Orders</span>
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>
            <a
              href="/admin/products"
              className="flex items-center gap-3 px-3 pt-3 pb-2 mb-3 relative group transition-all duration-300"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fa-solid text-white fa-warehouse"></i>
              <span className="text-sm font-medium">Inventory</span>
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>
            <a
              href="/admin/appointments"
              className="flex items-center gap-3 px-3 pt-3 pb-2 mb-3 relative group transition-all duration-300"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fa-solid text-white fa-calendar"></i>
              <span className="text-sm font-medium">Appointments</span>
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>
            <a
              href="/admin/settings"
              className="flex items-center gap-3 px-3 pt-3 pb-2 mb-3 relative group transition-all duration-300"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fa-solid text-white fa-gear"></i>
              <span className="text-sm font-medium">Settings</span>
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>
          </div>
        </nav>

        <div className="p-6 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <i className="fa-solid fa-sign-out-alt"></i>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
