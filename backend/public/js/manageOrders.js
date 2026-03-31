document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("ordersTableBody");
  const searchInput = document.getElementById("orderSearch");
  const reloadButton = document.getElementById("reloadOrders");
  const statusFilters = Array.from(
    document.querySelectorAll("[data-order-status]"),
  );
  const summary = document.getElementById("ordersPaginationSummary");
  const paginationNumbers = document.getElementById("ordersPaginationNumbers");
  const previousPageButton = document.getElementById("ordersPrevPage");
  const nextPageButton = document.getElementById("ordersNextPage");

  if (!tableBody) {
    return;
  }

  const state = {
    orders: [],
    filteredOrders: [],
    productsMap: new Map(),
    currentPage: 1,
    pageSize: 6,
    statusFilter: "all",
    searchTerm: "",
  };

  searchInput?.addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    state.currentPage = 1;
    applyFilters();
  });

  reloadButton?.addEventListener("click", () => {
    loadOrders(true);
  });

  statusFilters.forEach((button) => {
    button.addEventListener("click", () => {
      state.statusFilter = button.dataset.orderStatus || "all";
      state.currentPage = 1;
      syncStatusButtons();
      applyFilters();
    });
  });

  previousPageButton?.addEventListener("click", () => {
    goToPage(state.currentPage - 1);
  });

  nextPageButton?.addEventListener("click", () => {
    goToPage(state.currentPage + 1);
  });

  paginationNumbers?.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const pageButton = event.target.closest("[data-order-page]");
    if (!pageButton) {
      return;
    }

    goToPage(Number(pageButton.dataset.orderPage));
  });

  tableBody.addEventListener("click", async (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const actionButton = event.target.closest("[data-order-action]");
    if (!actionButton) {
      return;
    }

    const orderId = actionButton.dataset.orderId;
    const actionType = actionButton.dataset.orderAction;

    if (!orderId || actionType !== "ship") {
      return;
    }

    await updateOrderStatus(orderId, "Shipped", actionButton);
  });

  syncStatusButtons();
  loadOrders();

  async function loadOrders(showToastAfterReload = false) {
    renderLoadingState();

    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        axios.get("/api/v1/orders?limit=1000&sort=-createdAt"),
        axios.get("/api/v1/products?limit=1000"),
      ]);

      const products = productsResponse.data?.data?.data || [];
      state.productsMap = new Map(
        products.map((product) => [String(product._id), product.name]),
      );

      const orders = ordersResponse.data?.data?.data || [];
      state.orders = orders.map(normalizeOrder);
      state.currentPage = 1;
      applyFilters();

      if (showToastAfterReload) {
        showToast("Orders refreshed.");
      }
    } catch (error) {
      handleLoadError(error);
    }
  }

  function normalizeOrder(order) {
    const createdAtDate = new Date(order.createdAt);
    const normalizedItems = (order.items || []).map((item) => {
      const productValue = item?.product;
      const productId =
        typeof productValue === "object" && productValue !== null
          ? String(productValue._id || "")
          : String(productValue || "");

      const productName =
        (typeof productValue === "object" && productValue?.name) ||
        state.productsMap.get(productId) ||
        "Product";

      return {
        productId,
        productName,
        quantity: Number(item?.quantity || 0),
      };
    });

    return {
      id: String(order._id),
      displayId: `#ord-${String(order._id).slice(-6).toUpperCase()}`,
      customerName: order.customerName || "Unknown customer",
      customerEmail: order.customerEmail || "No email",
      totalPrice: Number(order.totalPrice || 0),
      status: order.status || "Pending",
      items: normalizedItems,
      itemCount: normalizedItems.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: createdAtDate,
      createdAtLabel: formatDate(createdAtDate),
      searchText: buildSearchText(order, normalizedItems),
    };
  }

  function buildSearchText(order, normalizedItems) {
    const itemNames = normalizedItems.map((item) => item.productName).join(" ");
    return [
      order._id,
      order.customerName,
      order.customerEmail,
      order.status,
      itemNames,
    ]
      .join(" ")
      .toLowerCase();
  }

  function applyFilters() {
    state.filteredOrders = state.orders.filter((order) => {
      return matchesStatusFilter(order) && matchesSearch(order);
    });

    const totalPages = getTotalPages();
    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }

    renderOrders();
  }

  function matchesStatusFilter(order) {
    if (state.statusFilter === "all") {
      return true;
    }

    return order.status === state.statusFilter;
  }

  function matchesSearch(order) {
    if (!state.searchTerm) {
      return true;
    }

    return order.searchText.includes(state.searchTerm);
  }

  function renderOrders() {
    const totalOrders = state.filteredOrders.length;
    const totalPages = getTotalPages();
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const currentOrders = state.filteredOrders.slice(
      startIndex,
      startIndex + state.pageSize,
    );

    if (!currentOrders.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-10 text-center text-slate-500">No orders match the current filters.</td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = currentOrders.map(buildOrderRow).join("");
    }

    if (totalOrders === 0) {
      summary.textContent = "Showing 0 orders";
    } else {
      summary.textContent = `Showing ${startIndex + 1} to ${Math.min(startIndex + currentOrders.length, totalOrders)} of ${totalOrders} orders`;
    }

    renderPagination(totalPages);
  }

  function buildOrderRow(order) {
    const isShipped = order.status === "Shipped";
    const canShip = !["Shipped", "Delivered", "Cancelled"].includes(
      order.status,
    );

    return `
      <tr class="hover:bg-slate-50/50 transition-colors">
        <td class="px-6 py-4">
          <span class="text-sm font-bold text-primary">${escapeHtml(order.displayId)}</span>
          <p class="text-xs text-slate-500 mt-1">${escapeHtml(order.createdAtLabel)}</p>
        </td>
        <td class="px-6 py-4">
          <p class="text-sm font-medium text-slate-900">${escapeHtml(order.customerName)}</p>
          <p class="text-xs text-slate-500">${escapeHtml(order.customerEmail)}</p>
        </td>
        <td class="px-6 py-4 text-sm text-slate-600">${order.itemCount} item${order.itemCount === 1 ? "" : "s"}</td>
        <td class="px-6 py-4 text-sm font-semibold">$${formatCurrency(order.totalPrice)}</td>
        <td class="px-6 py-4 text-sm">
          <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(order.status)}">${escapeHtml(order.status)}</span>
          ${canShip ? `<button type="button" data-order-action="ship" data-order-id="${order.id}" class="block mt-2 text-xs font-medium text-primary hover:underline">Change to shipped?</button>` : ""}
          ${isShipped ? `<p class="text-xs mt-2 text-slate-500">Already shipped</p>` : ""}
        </td>
        <td class="px-6 py-4 text-right">
          <ul class="text-sm text-slate-600 space-y-1 list-none">
            ${order.items.length ? order.items.map((item) => `<li>${escapeHtml(item.productName)} | ${item.quantity}</li>`).join("") : "<li>No items</li>"}
          </ul>
        </td>
      </tr>
    `;
  }

  async function updateOrderStatus(orderId, status, actionButton) {
    const originalText = actionButton.textContent;
    actionButton.disabled = true;
    actionButton.textContent = "Updating...";

    try {
      const response = await axios.patch(`/api/v1/orders/${orderId}`, {
        status,
      });
      const updatedOrder = response.data?.data?.data;

      if (!updatedOrder) {
        throw new Error("No order data returned from server");
      }

      const normalized = normalizeOrder(updatedOrder);
      const existingIndex = state.orders.findIndex(
        (order) => order.id === orderId,
      );

      if (existingIndex !== -1) {
        state.orders[existingIndex] = normalized;
      } else {
        state.orders.unshift(normalized);
      }

      applyFilters();
      showToast("Order status updated to shipped.");
    } catch (error) {
      if (error.response?.status === 401) {
        window.location.assign("/login");
        return;
      }

      const message =
        error.response?.data?.message || "Failed to update order status.";
      showToast(message, "error");
      actionButton.disabled = false;
      actionButton.textContent = originalText;
    }
  }

  function renderLoadingState() {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-10 text-center text-slate-500">Loading orders...</td>
      </tr>
    `;
    summary.textContent = "Loading orders...";
    paginationNumbers.innerHTML = "";
    previousPageButton.disabled = true;
    nextPageButton.disabled = true;
  }

  function renderPagination(totalPages) {
    const disablePrevious = state.currentPage <= 1;
    const disableNext = state.currentPage >= totalPages;

    previousPageButton.disabled = disablePrevious;
    nextPageButton.disabled = disableNext;

    paginationNumbers.innerHTML = buildPaginationButtons(totalPages);
  }

  function buildPaginationButtons(totalPages) {
    if (totalPages <= 1) {
      return `<button type="button" data-order-page="1" class="px-3 py-1 bg-[#CF1745] text-white rounded text-sm font-bold">1</button>`;
    }

    const maxButtons = 5;
    let startPage = Math.max(1, state.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    const buttons = [];
    for (let page = startPage; page <= endPage; page += 1) {
      const activeClass =
        page === state.currentPage
          ? "bg-[#CF1745] text-white"
          : "border border-slate-200 text-slate-700 hover:bg-white";
      buttons.push(
        `<button type="button" data-order-page="${page}" class="px-3 py-1 rounded text-sm font-bold ${activeClass}">${page}</button>`,
      );
    }

    return buttons.join("");
  }

  function goToPage(pageNumber) {
    const totalPages = getTotalPages();
    const safePage = Math.min(Math.max(1, Number(pageNumber) || 1), totalPages);

    if (safePage === state.currentPage) {
      return;
    }

    state.currentPage = safePage;
    renderOrders();
  }

  function getTotalPages() {
    return Math.max(1, Math.ceil(state.filteredOrders.length / state.pageSize));
  }

  function syncStatusButtons() {
    statusFilters.forEach((button) => {
      const isActive = button.dataset.orderStatus === state.statusFilter;
      button.classList.toggle("bg-white", isActive);
      button.classList.toggle("shadow-sm", isActive);
      button.classList.toggle("font-bold", isActive);
      button.classList.toggle("text-slate-900", isActive);
      button.classList.toggle("font-medium", !isActive);
      button.classList.toggle("text-slate-500", !isActive);
    });
  }

  function handleLoadError(error) {
    if (error.response?.status === 401) {
      window.location.assign("/login");
      return;
    }

    const message =
      error.response?.data?.message ||
      "Unable to load orders. Please try again.";

    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-10 text-center text-red-600">${escapeHtml(message)}</td>
      </tr>
    `;
    summary.textContent = "Unable to load orders";
    paginationNumbers.innerHTML = "";
    showToast(message, "error");
  }

  function formatDate(dateValue) {
    if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
      return "Invalid date";
    }

    return dateValue.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatCurrency(value) {
    return Number(value || 0).toFixed(2);
  }

  function statusClass(status) {
    if (status === "Shipped" || status === "Delivered") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Cancelled") {
      return "bg-red-100 text-red-700";
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
