"use client";
 
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

interface Appointment {
  _id: string;
  customerName: string;
  customerEmail: string;
  whatsappNumber: string;
  service: string;
  status: "Pending" | "Confirmed" | "Cancelled";
  appointmentDate: string;
  timeSlot: string;
}

interface NormalizedAppointment extends Appointment {
  id: string;
  dateTime: Date;
  formattedDate: string;
  formattedTime: string;
}

interface State {
  appointments: NormalizedAppointment[];
  filteredAppointments: NormalizedAppointment[];
  currentPage: number;
  pageSize: number;
  statusFilter: "all" | "Pending" | "Confirmed" | "Cancelled";
  todayOnly: boolean;
  upcomingOnly: boolean;
  previousOnly: boolean;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
}

export default function ManageAppointmentsPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({
    appointments: [],
    filteredAppointments: [],
    currentPage: 1,
    pageSize: 4,
    statusFilter: "all",
    todayOnly: false,
    upcomingOnly: false,
    previousOnly: false,
    searchTerm: "",
    isLoading: true,
    error: null,
  });
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [isConnected, setIsConnected] = useState(false);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 4000);
  };

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

  // Load appointments on mount
  useEffect(() => {
    loadAppointments();
  }, []);

  // Socket.io integration
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const socket = io(apiUrl, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to appointments socket server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from appointments socket server");
    });

    socket.on("appointmentCreated", (appt: any) => {
      showToast(`New Appointment: ${appt.customerName || "Client"}`);
      playNotificationSound();
      loadAppointments(false, true); // silent = true
    });

    socket.on("appointmentUpdated", () => {
      loadAppointments(false, true);
    });

    socket.on("appointmentDeleted", () => {
      loadAppointments(false, true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Apply filters whenever state changes
  useEffect(() => {
    applyFilters();
  }, [
    state.appointments,
    state.statusFilter,
    state.todayOnly,
    state.upcomingOnly,
    state.previousOnly,
    state.searchTerm,
  ]);

  const loadAppointments = useCallback(async (showRefreshToast = false, silent = false) => {
    if (!silent) {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${apiUrl}/api/v1/appointments?limit=1000&sort=appointmentDate,timeSlot`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      const records = data?.data?.data || [];
      const normalized = records
        .map(normalizeAppointment)
        .sort(
          (left: NormalizedAppointment, right: NormalizedAppointment) =>
            left.dateTime.getTime() - right.dateTime.getTime(),
        );

      setState((prev) => ({
        ...prev,
        appointments: normalized,
        currentPage: silent ? prev.currentPage : 1,
        isLoading: false,
      }));

      if (showRefreshToast) {
        showToast("Appointments list refreshed.");
      }
    } catch (error) {
      handleLoadError(error);
    }
  }, [router]);

  const normalizeAppointment = (
    appointment: Appointment,
  ): NormalizedAppointment => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const dateTime = mergeDateAndTime(appointmentDate, appointment.timeSlot);

    return {
      ...appointment,
      id: appointment._id,
      dateTime,
      formattedDate: formatDate(appointmentDate),
      formattedTime: formatTime(appointment.timeSlot),
    };
  };

  const handleLoadError = (error: any) => {
    const errorMessage =
      error?.message || "Unable to load appointments. Please try again.";

    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: errorMessage,
    }));
  };

  const matchesStatusFilter = (appointment: NormalizedAppointment): boolean => {
    if (state.statusFilter === "all") {
      return true;
    }
    return appointment.status === state.statusFilter;
  };

  const matchesTodayFilter = (appointment: NormalizedAppointment): boolean => {
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
  };

  const matchesUpcomingFilter = (
    appointment: NormalizedAppointment,
  ): boolean => {
    if (!state.upcomingOnly) {
      return true;
    }

    const now = new Date();
    return appointment.dateTime >= now;
  };

  const matchesPreviousFilter = (
    appointment: NormalizedAppointment,
  ): boolean => {
    if (!state.previousOnly) {
      return true;
    }

    const now = new Date();
    return appointment.dateTime < now;
  };

  const matchesSearch = (appointment: NormalizedAppointment): boolean => {
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

    return haystack.includes(state.searchTerm.toLowerCase());
  };

  const applyFilters = () => {
    const filtered = state.appointments.filter((appointment) => {
      return (
        matchesTodayFilter(appointment) &&
        matchesUpcomingFilter(appointment) &&
        matchesPreviousFilter(appointment) &&
        matchesStatusFilter(appointment) &&
        matchesSearch(appointment)
      );
    });

    setState((prev) => {
      const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / prev.pageSize),
      );
      const currentPage = Math.min(prev.currentPage, totalPages);

      return {
        ...prev,
        filteredAppointments: filtered,
        currentPage,
      };
    });
  };

  const handleStatusUpdate = useCallback(
    async (appointmentId: string, nextStatus: "Confirmed" | "Cancelled") => {
      const original = state.appointments.find((a) => a.id === appointmentId);
      if (!original) return;

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(
          `${apiUrl}/api/v1/appointments/${appointmentId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ status: nextStatus }),
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to update appointment");
        }

        const data = await response.json();
        const updated = normalizeAppointment(data?.data?.data || {});
        setState((prev) => ({
          ...prev,
          appointments: prev.appointments.map((a) =>
            a.id === appointmentId ? updated : a,
          ),
        }));

        // Toast shown in parent
      } catch (error) {
        console.error("Error updating appointment:", error);
      }
    },
    [state.appointments, router],
  );

  const statusFilters: Array<"all" | "Pending" | "Confirmed" | "Cancelled"> = [
    "all",
    "Pending",
    "Confirmed",
    "Cancelled",
  ];

  const totalPages = Math.max(
    1,
    Math.ceil(state.filteredAppointments.length / state.pageSize),
  );
  const startIndex = (state.currentPage - 1) * state.pageSize;
  const currentAppointments = state.filteredAppointments.slice(
    startIndex,
    startIndex + state.pageSize,
  );

  const totalAppointments = state.filteredAppointments.length;
  const showSummary =
    totalAppointments === 0
      ? "Showing 0 appointments"
      : `Showing ${startIndex + 1} to ${Math.min(startIndex + currentAppointments.length, totalAppointments)} of ${totalAppointments} appointments`;

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
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl text-black font-bold text-slate-900">
              Manage Appointments
            </h1>
            <p className="text-slate-600 mt-1">
              View, confirm, and manage all customer appointments
            </p>
          </div>

          {/* Live Status Indicator */}
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Search Bar */}
          <div className="mb-6 relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search by name, email, service, or contact..."
              value={state.searchTerm}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  searchTerm: e.target.value,
                  currentPage: 1,
                }))
              }
              className="w-full px-4 py-2 pl-10 text-black border border-gray-300 rounded-lg focus:outline-none focus:border-[#CF1745] transition"
            />
          </div>

          {/* Date and Status Filters */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            {/* Date Filters */}
            <div className="flex flex-col gap-3">
              <p className="text-sm text-slate-500">
                Filter by appointment date
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      todayOnly: !prev.todayOnly,
                      currentPage: 1,
                    }))
                  }
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    state.todayOnly
                      ? "bg-[#CF17450A] border-[#CF174514] text-[#CF1745]"
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:border-[#CF174514]"
                  }`}
                >
                  <i className="fa-solid fa-calendar-day text-sm"></i>
                  Today
                </button>
                <button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      upcomingOnly: !prev.upcomingOnly,
                      currentPage: 1,
                    }))
                  }
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    state.upcomingOnly
                      ? "bg-[#CF17450A] border-[#CF174514] text-[#CF1745]"
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:border-[#CF174514]"
                  }`}
                >
                  <i className="fa-solid fa-calendar-days text-sm"></i>
                  Upcoming
                </button>
                <button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      previousOnly: !prev.previousOnly,
                      currentPage: 1,
                    }))
                  }
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    state.previousOnly
                      ? "bg-[#CF17450A] border-[#CF174514] text-[#CF1745]"
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:border-[#CF174514]"
                  }`}
                >
                  <i className="fa-solid fa-clock-rotate-left text-sm"></i>
                  Previous
                </button>
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-col gap-3">
              <p className="text-sm text-slate-500">
                Filter by appointment status
              </p>
              <div className="flex border-b border-[#CF174505]">
                {statusFilters.map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        statusFilter: status,
                        currentPage: 1,
                      }))
                    }
                    className={`px-4 py-2 border-b-2 text-sm font-medium transition-all capitalize ${
                      state.statusFilter === status
                        ? "border-[#CF1745] text-[#CF1745] font-bold"
                        : "border-transparent text-slate-500 hover:text-[#CF1745]"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {state.isLoading ? (
            <div className="p-8 text-center text-slate-500">
              Loading appointments...
            </div>
          ) : state.error ? (
            <div className="p-8 text-center text-red-600">{state.error}</div>
          ) : currentAppointments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              {totalAppointments === 0
                ? "No appointments match the current filters."
                : "No appointments found for this page."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentAppointments.map((appointment) => (
                      <AppointmentRow
                        key={appointment.id}
                        appointment={appointment}
                        onStatusUpdate={handleStatusUpdate}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-slate-600">
                {showSummary}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {!state.isLoading && currentAppointments.length > 0 && (
          <div className="mt-6 flex justify-center items-center gap-2">
            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  currentPage: Math.max(1, prev.currentPage - 1),
                }))
              }
              disabled={state.currentPage <= 1}
              className={`w-8 h-8 flex items-center justify-center rounded border border-gray-300 transition ${
                state.currentPage <= 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <i className="fa-solid fa-angle-left text-black"></i>
            </button>

            <div className="flex gap-1">
              {renderPaginationButtons(state.currentPage, totalPages).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() =>
                      setState((prev) => ({ ...prev, currentPage: page }))
                    }
                    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition ${
                      page === state.currentPage
                        ? "bg-[#CF1745] text-white"
                        : "border border-[#CF17450A] text-slate-600 hover:bg-white"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  currentPage: Math.min(totalPages, prev.currentPage + 1),
                }))
              }
              disabled={state.currentPage >= totalPages}
              className={`w-8 h-8 flex items-center justify-center rounded border border-gray-300 transition ${
                state.currentPage >= totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <i className="fa-solid fa-angle-right text-black"></i>
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

interface AppointmentRowProps {
  appointment: NormalizedAppointment;
  onStatusUpdate: (
    appointmentId: string,
    status: "Confirmed" | "Cancelled",
  ) => Promise<void>;
}

function AppointmentRow({ appointment, onStatusUpdate }: AppointmentRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isConfirmed = appointment.status === "Confirmed";
  const isCancelled = appointment.status === "Cancelled";

  const getStatusStyles = (status: string) => {
    if (status === "Confirmed") {
      return "bg-green-100 text-green-700";
    }
    if (status === "Cancelled") {
      return "bg-red-100 text-red-700";
    }
    return "bg-amber-100 text-amber-700";
  };

  const handleAction = async (action: "confirm" | "deny") => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(
        appointment.id,
        action === "confirm" ? "Confirmed" : "Cancelled",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <tr className="hover:bg-[#CF1745]/[0.02] transition-colors">
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-slate-900">
            {appointment.customerName}
          </p>
          <p className="text-xs text-slate-500">{appointment.customerEmail}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center rounded-full bg-[#CF17450A] px-2.5 py-0.5 text-xs font-medium text-[#CF1745]">
          {appointment.service}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm font-medium text-slate-900">
          {appointment.formattedDate}
        </p>
        <p className="text-xs text-slate-500">{appointment.formattedTime}</p>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-slate-700">{appointment.whatsappNumber}</p>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusStyles(
            appointment.status,
          )}`}
        >
          {appointment.status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleAction("deny")}
            disabled={isCancelled || isUpdating}
            className={`bg-red-600 px-6 py-2.5 rounded-lg font-semibold text-white shadow-lg shadow-red-600/20 transition ${
              isCancelled || isUpdating
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-red-700 cursor-pointer"
            }`}
          >
            {isUpdating ? "..." : "Deny"}
          </button>
          <button
            onClick={() => handleAction("confirm")}
            disabled={isConfirmed || isUpdating}
            className={`bg-green-600 px-6 py-2.5 rounded-lg font-semibold text-white shadow-lg shadow-green-600/20 transition ${
              isConfirmed || isUpdating
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-green-700 cursor-pointer"
            }`}
          >
            {isUpdating ? "..." : "Confirm"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function renderPaginationButtons(
  currentPage: number,
  totalPages: number,
): number[] {
  if (totalPages <= 1) {
    return [1];
  }

  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  const buttons: number[] = [];
  for (let page = startPage; page <= endPage; page += 1) {
    buttons.push(page);
  }

  return buttons;
}

// Helper functions
function mergeDateAndTime(dateValue: Date, timeValue: string): Date {
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

function formatDate(dateValue: Date): string {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
    return "Invalid date";
  }

  return dateValue.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeValue: string): string {
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
