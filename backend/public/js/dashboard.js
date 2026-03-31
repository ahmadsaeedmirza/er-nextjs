document.addEventListener("DOMContentLoaded", () => {
  const refreshButton = document.getElementById("refreshDashboard");
  const loadingSection = document.getElementById("dashboardLoading");
  const contentSection = document.getElementById("dashboardContent");

  const metricTotalSales = document.getElementById("metricTotalSales");
  const metricTotalOrders = document.getElementById("metricTotalOrders");
  const metricPendingOrders = document.getElementById("metricPendingOrders");
  const metricTotalAppointments = document.getElementById(
    "metricTotalAppointments",
  );

  const salesTrendChart = document.getElementById("salesTrendChart");
  const orderStatusList = document.getElementById("orderStatusList");
  const recentOrdersBody = document.getElementById("recentOrdersBody");
  const recentAppointmentsList = document.getElementById(
    "recentAppointmentsList",
  );
  const topProductsList = document.getElementById("topProductsList");

  if (!refreshButton || !loadingSection || !contentSection) {
    return;
  }

  refreshButton.addEventListener("click", async () => {
    await loadDashboard(true);
  });

  loadDashboard();

  async function loadDashboard(showRefreshedToast = false) {
    setLoadingState(true, "Loading dashboard data...");

    try {
      const response = await axios.get("/api/v1/admin/dashboard-stats");
      const payload = response.data?.data;

      if (!payload) {
        throw new Error("Dashboard data is unavailable.");
      }

      renderTotals(payload.totals || {});
      renderSalesTrend(payload.salesTrend || []);
      renderOrderStatus(payload.orderStatusCounts || []);
      renderRecentOrders(payload.recentOrders || []);
      renderRecentAppointments(payload.recentAppointments || []);
      renderTopProducts(payload.topProducts || []);

      setLoadingState(false);

      if (showRefreshedToast) {
        showToast("Dashboard refreshed.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        window.location.assign("/login");
        return;
      }

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to load dashboard data.";
      setLoadingState(true, message);
      showToast(message, "error");
    }
  }

  function setLoadingState(isLoading, message = "") {
    if (isLoading) {
      loadingSection.textContent = message || "Loading dashboard data...";
      loadingSection.classList.remove("hidden");
      contentSection.classList.add("hidden");
      return;
    }

    loadingSection.classList.add("hidden");
    contentSection.classList.remove("hidden");
  }

  function renderTotals(totals) {
    metricTotalSales.textContent = formatCurrency(totals.totalSales || 0);
    metricTotalOrders.textContent = formatNumber(totals.totalOrders || 0);
    metricPendingOrders.textContent = formatNumber(totals.pendingOrders || 0);
    metricTotalAppointments.textContent = formatNumber(
      totals.totalAppointments || 0,
    );
  }

  function renderSalesTrend(salesTrend) {
    if (!salesTrendChart) {
      return;
    }

    if (!salesTrend.length) {
      salesTrendChart.innerHTML =
        '<p class="col-span-6 text-sm text-slate-500">No sales trend data available.</p>';
      return;
    }

    const maxSales = Math.max(
      ...salesTrend.map((entry) => Number(entry.sales || 0)),
      1,
    );

    salesTrendChart.innerHTML = salesTrend
      .map((entry) => {
        const sales = Number(entry.sales || 0);
        const heightPercent = Math.max(6, Math.round((sales / maxSales) * 100));

        return `
          <div class="flex flex-col items-center justify-end gap-2">
            <span class="text-[11px] text-slate-500">${formatCompactCurrency(sales)}</span>
            <div class="w-full rounded-md bg-[#CF17450F] h-36 flex items-end">
              <div class="w-full rounded-md bg-[#CF1745]" style="height:${heightPercent}%"></div>
            </div>
            <span class="text-xs font-medium text-slate-600">${escapeHtml(entry.label || "-")}</span>
          </div>
        `;
      })
      .join("");
  }

  function renderOrderStatus(orderStatuses) {
    if (!orderStatusList) {
      return;
    }

    if (!orderStatuses.length) {
      orderStatusList.innerHTML =
        '<li class="text-sm text-slate-500">No order status data found.</li>';
      return;
    }

    orderStatusList.innerHTML = orderStatuses
      .map((entry) => {
        return `
          <li class="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
            <span class="text-sm font-medium text-slate-700">${escapeHtml(entry.status)}</span>
            <span class="text-sm font-bold text-slate-900">${formatNumber(entry.count || 0)}</span>
          </li>
        `;
      })
      .join("");
  }

  function renderRecentOrders(orders) {
    if (!recentOrdersBody) {
      return;
    }

    if (!orders.length) {
      recentOrdersBody.innerHTML =
        '<tr><td colspan="4" class="px-5 py-6 text-sm text-slate-500 text-center">No recent orders.</td></tr>';
      return;
    }

    recentOrdersBody.innerHTML = orders
      .map((order) => {
        const displayId = `#ord-${String(order.id || "")
          .slice(-6)
          .toUpperCase()}`;
        return `
          <tr>
            <td class="px-5 py-3 text-sm font-semibold text-slate-800">${escapeHtml(displayId)}</td>
            <td class="px-5 py-3 text-sm text-slate-700">${escapeHtml(order.customerName || "Customer")}</td>
            <td class="px-5 py-3 text-sm font-semibold text-slate-900">${formatCurrency(order.totalPrice || 0)}</td>
            <td class="px-5 py-3"><span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(order.status)}">${escapeHtml(order.status || "Pending")}</span></td>
          </tr>
        `;
      })
      .join("");
  }

  function renderRecentAppointments(appointments) {
    if (!recentAppointmentsList) {
      return;
    }

    if (!appointments.length) {
      recentAppointmentsList.innerHTML =
        '<li class="px-5 py-5 text-sm text-slate-500">No recent appointments.</li>';
      return;
    }

    recentAppointmentsList.innerHTML = appointments
      .map((appointment) => {
        const date = formatDate(appointment.appointmentDate);
        const time = formatTime(appointment.timeSlot);
        return `
          <li class="px-5 py-4 flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-slate-900">${escapeHtml(appointment.customerName || "Client")}</p>
              <p class="text-xs text-slate-500 mt-1">${escapeHtml(appointment.service || "Service")} · ${date} · ${time}</p>
            </div>
            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(appointment.status)}">${escapeHtml(appointment.status || "Pending")}</span>
          </li>
        `;
      })
      .join("");
  }

  function renderTopProducts(topProducts) {
    if (!topProductsList) {
      return;
    }

    if (!topProducts.length) {
      topProductsList.innerHTML =
        '<li class="text-sm text-slate-500">No product sales data available.</li>';
      return;
    }

    topProductsList.innerHTML = topProducts
      .map((product) => {
        return `
          <li class="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
            <div>
              <p class="text-sm font-semibold text-slate-900">${escapeHtml(product.name || "Product")}</p>
              <p class="text-xs text-slate-500">Revenue: ${formatCurrency(product.revenue || 0)}</p>
            </div>
            <span class="text-sm font-bold text-slate-900">${formatNumber(product.quantitySold || 0)} sold</span>
          </li>
        `;
      })
      .join("");
  }

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  }

  function formatCompactCurrency(value) {
    return Number(value || 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    });
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-US");
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(value) {
    const [hours, minutes] = String(value || "00:00")
      .split(":")
      .map((part) => Number(part));

    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function statusClass(statusValue) {
    if (
      statusValue === "Shipped" ||
      statusValue === "Delivered" ||
      statusValue === "Confirmed"
    ) {
      return "bg-green-100 text-green-700";
    }

    if (statusValue === "Cancelled") {
      return "bg-red-100 text-red-700";
    }

    if (statusValue === "Processing") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-amber-100 text-amber-700";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.classList.remove("bg-red-600", "bg-[#CF1745]", "opacity-0");
    toast.classList.add(type === "error" ? "bg-red-600" : "bg-[#CF1745]");
    toast.classList.add("opacity-100");

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
      toast.classList.remove("opacity-100");
      toast.classList.add("opacity-0");
    }, 4000);
  }
});
