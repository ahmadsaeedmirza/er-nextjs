document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("appointmentTableBody");
  const searchInput = document.getElementById("appointmentSearch");
  const reloadButton = document.getElementById("reloadAppointments");
  const todayFilterButton = document.getElementById("appointmentTodayFilter");
  const upcomingFilterButton = document.getElementById(
    "appointmentUpcomingFilter",
  );
  const previousFilterButton = document.getElementById(
    "appointmentPreviousFilter",
  );
  const statusFilters = Array.from(
    document.querySelectorAll("[data-status-filter]"),
  );
  const summary = document.getElementById("appointmentPaginationSummary");
  const paginationNumbers = document.getElementById(
    "appointmentPaginationNumbers",
  );
  const previousPageButton = document.getElementById("appointmentPrevPage");
  const nextPageButton = document.getElementById("appointmentNextPage");

  if (!tableBody) {
    return;
  }

  const state = {
    appointments: [],
    filteredAppointments: [],
    currentPage: 1,
    pageSize: 4,
    todayOnly: false,
    upcomingOnly: false,
    previousOnly: false,
    statusFilter: "all",
    searchTerm: "",
    isLoading: false,
  };

  searchInput?.addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    state.currentPage = 1;
    applyFilters();
  });

  reloadButton?.addEventListener("click", () => {
    loadAppointments(true);
  });

  todayFilterButton?.addEventListener("click", () => {
    state.todayOnly = !state.todayOnly;
    if (state.todayOnly) {
      state.upcomingOnly = false;
      state.previousOnly = false;
    }
    state.currentPage = 1;
    syncTodayFilterButton();
    syncUpcomingFilterButton();
    syncPreviousFilterButton();
    applyFilters();
  });

  upcomingFilterButton?.addEventListener("click", () => {
    state.upcomingOnly = !state.upcomingOnly;
    if (state.upcomingOnly) {
      state.todayOnly = false;
      state.previousOnly = false;
    }
    state.currentPage = 1;
    syncUpcomingFilterButton();
    syncTodayFilterButton();
    syncPreviousFilterButton();
    applyFilters();
  });

  previousFilterButton?.addEventListener("click", () => {
    state.previousOnly = !state.previousOnly;
    if (state.previousOnly) {
      state.todayOnly = false;
      state.upcomingOnly = false;
    }
    state.currentPage = 1;
    syncPreviousFilterButton();
    syncTodayFilterButton();
    syncUpcomingFilterButton();
    applyFilters();
  });

  statusFilters.forEach((button) => {
    button.addEventListener("click", () => {
      state.statusFilter = button.dataset.statusFilter || "all";
      state.currentPage = 1;
      syncStatusFilterButtons();
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

    const pageButton = event.target.closest("[data-page]");
    if (!pageButton) {
      return;
    }

    goToPage(Number(pageButton.dataset.page));
  });

  tableBody.addEventListener("click", async (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) {
      return;
    }

    const appointmentId = actionButton.dataset.id;
    const nextStatus =
      actionButton.dataset.action === "confirm" ? "Confirmed" : "Cancelled";

    if (!appointmentId) {
      return;
    }

    await updateAppointmentStatus(appointmentId, nextStatus, actionButton);
  });

  syncStatusFilterButtons();
  syncTodayFilterButton();
  syncUpcomingFilterButton();
  syncPreviousFilterButton();
  loadAppointments();

  async function loadAppointments(showRefreshToast = false) {
    state.isLoading = true;
    renderLoadingState();

    try {
      const response = await axios.get(
        "/api/v1/appointments?limit=1000&sort=appointmentDate,timeSlot",
      );

      const records = response.data?.data?.data || [];
      state.appointments = records
        .map(normalizeAppointment)
        .sort((left, right) => left.dateTime - right.dateTime);
      state.currentPage = 1;
      applyFilters();

      if (showRefreshToast) {
        showToast("Appointments refreshed.");
      }
    } catch (error) {
      handleLoadError(error);
    } finally {
      state.isLoading = false;
    }
  }

  function applyFilters() {
    state.filteredAppointments = state.appointments.filter((appointment) => {
      return (
        matchesTodayFilter(appointment) &&
        matchesUpcomingFilter(appointment) &&
        matchesPreviousFilter(appointment) &&
        matchesStatusFilter(appointment) &&
        matchesSearch(appointment)
      );
    });

    const totalPages = getTotalPages();
    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }

    renderAppointments();
  }

  function renderAppointments() {
    const totalAppointments = state.filteredAppointments.length;
    const totalPages = getTotalPages();
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const currentAppointments = state.filteredAppointments.slice(
      startIndex,
      startIndex + state.pageSize,
    );

    if (!currentAppointments.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-10 text-center text-sm text-slate-500">
            ${totalAppointments === 0 ? "No appointments match the current filters." : "No appointments found for this page."}
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = currentAppointments
        .map(buildAppointmentRow)
        .join("");
    }

    if (totalAppointments === 0) {
      summary.textContent = "Showing 0 appointments";
    } else {
      summary.textContent = `Showing ${startIndex + 1} to ${Math.min(startIndex + currentAppointments.length, totalAppointments)} of ${totalAppointments} appointments`;
    }

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    const disablePrevious = state.currentPage <= 1;
    const disableNext = state.currentPage >= totalPages;

    previousPageButton.disabled = disablePrevious;
    nextPageButton.disabled = disableNext;

    previousPageButton.classList.toggle("opacity-50", disablePrevious);
    previousPageButton.classList.toggle("cursor-not-allowed", disablePrevious);
    nextPageButton.classList.toggle("opacity-50", disableNext);
    nextPageButton.classList.toggle("cursor-not-allowed", disableNext);

    previousPageButton.classList.toggle("cursor-pointer", !disablePrevious);
    nextPageButton.classList.toggle("cursor-pointer", !disableNext);

    paginationNumbers.innerHTML = buildPaginationButtons(totalPages);
  }

  function goToPage(requestedPage) {
    const totalPages = getTotalPages();
    const safePage = Math.min(
      Math.max(1, Number(requestedPage) || 1),
      totalPages,
    );

    if (safePage === state.currentPage) {
      return;
    }

    state.currentPage = safePage;
    renderAppointments();
  }

  function buildPaginationButtons(totalPages) {
    if (totalPages <= 1) {
      return `
        <button type="button" data-page="1" class="size-8 flex items-center justify-center rounded bg-[#CF1745] text-xs font-bold text-white">1</button>
      `;
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
          : "border border-[#CF17450A] text-slate-600 hover:bg-white transition-colors";
      buttons.push(`
        <button type="button" data-page="${page}" class="size-8 flex items-center justify-center rounded text-xs font-bold ${activeClass}">${page}</button>
      `);
    }

    return buttons.join("");
  }

  function buildAppointmentRow(appointment) {
    const isConfirmed = appointment.status === "Confirmed";
    const isCancelled = appointment.status === "Cancelled";
    const statusClass = getStatusClassName(appointment.status);

    return `
      <tr class="hover:bg-[#CF1745]/[0.02] transition-colors">
        <td class="px-6 py-4">
          <div class="flex flex-col gap-1">
            <p class="font-semibold text-slate-900">${escapeHtml(appointment.customerName)}</p>
            <p class="text-xs text-slate-500">${escapeHtml(appointment.customerEmail)}</p>
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="inline-flex items-center rounded-full bg-[#CF17450A] px-2.5 py-0.5 text-xs font-medium text-[#CF1745]">
            ${escapeHtml(appointment.service)}
          </span>
        </td>
        <td class="px-6 py-4">
          <p class="text-sm font-medium text-slate-900">${escapeHtml(appointment.formattedDate)}</p>
          <p class="text-xs text-slate-500">${escapeHtml(appointment.formattedTime)}</p>
        </td>
        <td class="px-6 py-4">
          <p class="text-sm text-slate-700">${escapeHtml(appointment.whatsappNumber)}</p>
        </td>
        <td class="px-6 py-4">
          <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass}">
            ${escapeHtml(appointment.status)}
          </span>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex justify-end gap-2">
            <button type="button" data-action="deny" data-id="${appointment.id}" class="bg-[#FF0000] px-6 py-2.5 rounded-lg font-semibold text-white shadow-lg shadow-[#CF174514] transition-all hover:bg-[#DC2626] ${isCancelled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}" ${isCancelled ? "disabled" : ""}>
              Deny
            </button>
            <button type="button" data-action="confirm" data-id="${appointment.id}" class="bg-[#10B981] px-6 py-2.5 rounded-lg font-semibold text-white shadow-lg shadow-[#CF174514] transition-all hover:bg-[#059669] ${isConfirmed ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}" ${isConfirmed ? "disabled" : ""}>
              Confirm
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  async function updateAppointmentStatus(
    appointmentId,
    nextStatus,
    actionButton,
  ) {
    const originalMarkup = actionButton.innerHTML;
    const siblingButton = Array.from(
      actionButton.parentElement?.querySelectorAll(
        `[data-id="${appointmentId}"]`,
      ) || [],
    ).find((button) => button.dataset.action !== actionButton.dataset.action);

    actionButton.disabled = true;
    actionButton.innerHTML = "Saving...";
    if (siblingButton) {
      siblingButton.disabled = true;
    }

    try {
      const response = await axios.patch(
        `/api/v1/appointments/${appointmentId}`,
        {
          status: nextStatus,
        },
      );

      const updatedAppointment = normalizeAppointment(
        response.data?.data?.data || {},
      );
      const appointmentIndex = state.appointments.findIndex(
        (appointment) => appointment.id === appointmentId,
      );

      if (appointmentIndex !== -1) {
        state.appointments[appointmentIndex] = updatedAppointment;
        state.appointments.sort(
          (left, right) => left.dateTime - right.dateTime,
        );
      }

      applyFilters();
      showToast(
        nextStatus === "Confirmed"
          ? "Appointment confirmed."
          : "Appointment denied.",
      );
    } catch (error) {
      if (error.response?.status === 401) {
        window.location.assign("/login");
        return;
      }

      const errorMessage =
        error.response?.data?.message ||
        "Unable to update appointment status right now.";
      showToast(errorMessage, "error");
      actionButton.disabled = false;
      actionButton.innerHTML = originalMarkup;
      if (siblingButton) {
        siblingButton.disabled = false;
      }
    }
  }

  function renderLoadingState() {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-10 text-center text-sm text-slate-500">Loading appointments...</td>
      </tr>
    `;
    summary.textContent = "Loading appointments...";
    paginationNumbers.innerHTML = "";
    previousPageButton.disabled = true;
    nextPageButton.disabled = true;
  }

  function handleLoadError(error) {
    if (error.response?.status === 401) {
      window.location.assign("/login");
      return;
    }

    const errorMessage =
      error.response?.data?.message ||
      "Unable to load appointments. Please try again.";

    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-10 text-center text-sm text-red-600">${escapeHtml(errorMessage)}</td>
      </tr>
    `;
    summary.textContent = "Unable to load appointments";
    paginationNumbers.innerHTML = "";
    showToast(errorMessage, "error");
  }

  function normalizeAppointment(appointment) {
    const appointmentDate = new Date(appointment.appointmentDate);
    const dateTime = mergeDateAndTime(appointmentDate, appointment.timeSlot);

    return {
      id: appointment._id,
      customerName: appointment.customerName || "Unknown client",
      customerEmail: appointment.customerEmail || "No email provided",
      whatsappNumber: appointment.whatsappNumber || "No contact number",
      service: appointment.service || "Service not set",
      status: appointment.status || "Pending",
      appointmentDate,
      timeSlot: appointment.timeSlot || "",
      dateTime,
      formattedDate: formatDate(appointmentDate),
      formattedTime: formatTime(appointment.timeSlot),
    };
  }

  function matchesStatusFilter(appointment) {
    if (state.statusFilter === "all") {
      return true;
    }

    return appointment.status === state.statusFilter;
  }

  function matchesTodayFilter(appointment) {
    if (!state.todayOnly) {
      return true;
    }

    const today = new Date();
    const appointmentDate = new Date(appointment.dateTime);

    return (
      appointmentDate.getFullYear() === today.getFullYear() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getDate() === today.getDate()
    );
  }

  function matchesUpcomingFilter(appointment) {
    if (!state.upcomingOnly) {
      return true;
    }

    const now = new Date();
    return appointment.dateTime >= now;
  }

  function matchesPreviousFilter(appointment) {
    if (!state.previousOnly) {
      return true;
    }

    const now = new Date();
    return appointment.dateTime < now;
  }

  function matchesSearch(appointment) {
    if (!state.searchTerm) {
      return true;
    }

    const haystack = [
      appointment.customerName,
      appointment.customerEmail,
      appointment.whatsappNumber,
      appointment.service,
      appointment.status,
      appointment.formattedDate,
      appointment.formattedTime,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(state.searchTerm);
  }

  function syncStatusFilterButtons() {
    statusFilters.forEach((button) => {
      const isActive = button.dataset.statusFilter === state.statusFilter;
      button.classList.toggle("border-[#CF1745]", isActive);
      button.classList.toggle("text-[#CF1745]", isActive);
      button.classList.toggle("font-bold", isActive);
      button.classList.toggle("border-transparent", !isActive);
      button.classList.toggle("text-slate-500", !isActive);
    });
  }

  function syncTodayFilterButton() {
    if (!todayFilterButton) {
      return;
    }

    todayFilterButton.classList.toggle("bg-[#CF17450A]", state.todayOnly);
    todayFilterButton.classList.toggle("text-[#CF1745]", state.todayOnly);
    todayFilterButton.classList.toggle("font-semibold", state.todayOnly);
    todayFilterButton.classList.toggle("border-[#CF174514]", state.todayOnly);
    todayFilterButton.classList.toggle("text-slate-600", !state.todayOnly);
  }

  function syncUpcomingFilterButton() {
    if (!upcomingFilterButton) {
      return;
    }

    upcomingFilterButton.classList.toggle("bg-[#CF17450A]", state.upcomingOnly);
    upcomingFilterButton.classList.toggle("text-[#CF1745]", state.upcomingOnly);
    upcomingFilterButton.classList.toggle("font-semibold", state.upcomingOnly);
    upcomingFilterButton.classList.toggle(
      "border-[#CF174514]",
      state.upcomingOnly,
    );
    upcomingFilterButton.classList.toggle(
      "text-slate-600",
      !state.upcomingOnly,
    );
  }

  function syncPreviousFilterButton() {
    if (!previousFilterButton) {
      return;
    }

    previousFilterButton.classList.toggle("bg-[#CF17450A]", state.previousOnly);
    previousFilterButton.classList.toggle("text-[#CF1745]", state.previousOnly);
    previousFilterButton.classList.toggle("font-semibold", state.previousOnly);
    previousFilterButton.classList.toggle(
      "border-[#CF174514]",
      state.previousOnly,
    );
    previousFilterButton.classList.toggle(
      "text-slate-600",
      !state.previousOnly,
    );
  }

  function getTotalPages() {
    return Math.max(
      1,
      Math.ceil(state.filteredAppointments.length / state.pageSize),
    );
  }

  function mergeDateAndTime(dateValue, timeValue) {
    const mergedDate = new Date(dateValue);
    if (Number.isNaN(mergedDate.getTime())) {
      return new Date(0);
    }

    const [hours, minutes] = String(timeValue || "00:00")
      .split(":")
      .map((value) => Number(value));

    mergedDate.setHours(hours || 0, minutes || 0, 0, 0);
    return mergedDate;
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

  function formatTime(timeValue) {
    const [hours, minutes] = String(timeValue || "00:00")
      .split(":")
      .map((value) => Number(value));

    const dateValue = new Date();
    dateValue.setHours(hours || 0, minutes || 0, 0, 0);

    return dateValue.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getStatusClassName(status) {
    if (status === "Confirmed") {
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
