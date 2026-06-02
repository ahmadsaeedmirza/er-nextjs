"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TimeSlotSelector from "@/components/TimeSlotSelector";
import AppointmentForm, { AppointmentData } from "@/components/AppointmentForm";

export const dynamic = "force-dynamic";

const SERVICE_PRICES: Record<string, number> = {
  "Signature Haircut & Styling": 85,
  "Bespoke Color Treatment": 210,
  "Rejuvenating Facial": 185,
  "Deep Tissue Stone Massage": 220,
  "Deluxe Manicure & Pedicure": 150,
  "Classic Manicure": 45,
  "Gel Extensions": 85,
  "Signature Pedicure": 65,
  "Custom Nail Art": 20,
  "Chemical Resurfacing": 150,
  "Diamond Glow Facial": 185,
};

const OPENING_HOURS: Record<string, { start: string; end: string }> = {
  Sunday: { start: "09:00 AM", end: "02:00 PM" },
  Monday: { start: "09:00 AM", end: "05:00 PM" },
  Tuesday: { start: "09:00 AM", end: "05:00 PM" },
  Wednesday: { start: "09:00 AM", end: "05:00 PM" },
  Thursday: { start: "09:00 AM", end: "06:30 PM" },
  Friday: { start: "08:00 AM", end: "06:30 PM" },
  Saturday: { start: "08:00 AM", end: "05:00 PM" },
};

interface CalendarDay {
  type: "empty" | "day";
  day?: number;
  date?: Date;
  isPast?: boolean;
  isSelected?: boolean;
}

export default function BookAppointment() {
  const searchParams = useSearchParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState(
    "Signature Haircut & Styling",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const selectedPrice = SERVICE_PRICES[selectedService] || 0;

  // Read service from URL query parameter
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    if (serviceParam) {
      setSelectedService(serviceParam);
    }
  }, [searchParams]);

  // Update document title for SEO
  useEffect(() => {
    document.title = "Book Appointment - E & R Salon";
  }, []);

  // Render calendar on current date change
  useEffect(() => {
    renderCalendar();
  }, [currentDate, selectedDate]);

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: CalendarDay[] = [];

    // Empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push({ type: "empty" });
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      const isSelected =
        selectedDate !== null &&
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getDate() === selectedDate.getDate();

      days.push({
        type: "day",
        day,
        date,
        isPast,
        isSelected,
      });
    }

    setCalendarDays(days);
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (formData: AppointmentData) => {
    if (!selectedDate || !selectedTime) {
      showToast("Please select both date and time", "error");
      return;
    }

    setIsLoading(true);

    try {
      // Format date as YYYY-MM-DD
      const date = selectedDate;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      // Convert 12-hour time to 24-hour format
      const [time, modifier] = selectedTime.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      const timeSlot = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

      const appointmentData = {
        customerName: formData.name,
        customerEmail: formData.email,
        whatsappNumber: formData.phone,
        service: formData.service,
        appointmentDate: formattedDate,
        timeSlot: timeSlot,
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/appointments/book`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();

      if (data.status === "success") {
        showToast("Appointment booked successfully!", "success");
        // Reset form
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedService("Signature Haircut & Styling");
      } else {
        showToast(data.message || "Failed to book appointment", "error");
      }
    } catch (error) {
      console.error("Booking error:", error);
      showToast("Failed to book appointment. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-[#faebe4] from-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-[169px] pb-24">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* LEFT COLUMN: CALENDAR */}
          <div className="lg:w-7/12 bg-white/60 rounded-xl p-8 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-light tracking-tight text-black">
                  Select your{" "}
                  <span className="font-bold text-[#cf1745]">
                    Preferred Date
                  </span>
                </h1>
                <p className="text-slate-500 mt-1 text-black">
                  Available slots for Hair, Nails, and Spa treatments.
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-full border border-[#cf1745]/20 hover:bg-[#cf1745]/10 text-[#cf1745]"
                >
                  <i className="fa-solid fa-chevron-left text-sm" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-full border border-[#cf1745]/20 hover:bg-[#cf1745]/10 text-[#cf1745]"
                >
                  <i className="fa-solid fa-chevron-right text-sm" />
                </button>
              </div>
            </div>

            <div className="mb-6 text-black">
              <h2 className="text-lg font-semibold mb-4 text-center uppercase tracking-widest">
                {currentDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>

              <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-4 tracking-tighter">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                  (day) => (
                    <span key={day}>{day}</span>
                  ),
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((dayObj, idx) => {
                  if (dayObj.type === "empty") {
                    return <div key={`empty-${idx}`} className="h-14" />;
                  }

                  const { day, date, isPast, isSelected } = dayObj;
                  return (
                    <div
                      key={day}
                      onClick={() => !isPast && handleDateClick(date!)}
                      className={`h-14 border rounded-lg flex items-center justify-center cursor-pointer text-sm font-semibold transition-all ${
                        isPast
                          ? "text-slate-300 cursor-not-allowed"
                          : isSelected
                            ? "bg-[#CF1745] text-white border-[#CF1745]"
                            : "bg-white/40 border-slate-200 hover:border-[#CF1745]"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Slots in same section */}
            <TimeSlotSelector
              selectedDate={selectedDate}
              onTimeSelect={setSelectedTime}
              selectedTime={selectedTime}
            />
          </div>

          {/* RIGHT COLUMN: BOOKING FORM */}
          <div className="lg:w-5/12 flex flex-col">
            <div className="flex-grow bg-white rounded-xl shadow-xl border border-[#cf1745]/10 p-8 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#cf1745]/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-2xl text-black font-bold tracking-tight">
                    Reserve Your{" "}
                    <span className="text-[#cf1745] italic">Experience</span>
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Fill in your details to secure your artisan.
                  </p>
                </div>

                <AppointmentForm
                  onSubmit={handleSubmit}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  selectedService={selectedService}
                  selectedPrice={selectedPrice}
                  isLoading={isLoading}
                  onServiceChange={setSelectedService}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg text-white font-semibold transition-all ${
            toast.type === "error" ? "bg-red-600" : "bg-[#CF1745]"
          } shadow-xl`}
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}
