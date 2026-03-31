"use client";

import { useEffect, useState } from "react";

interface CalendarSectionProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

const OPENING_HOURS: Record<string, { start: string; end: string }> = {
  Sunday: { start: "09:00 AM", end: "02:00 PM" },
  Monday: { start: "09:00 AM", end: "05:00 PM" },
  Tuesday: { start: "09:00 AM", end: "05:00 PM" },
  Wednesday: { start: "09:00 AM", end: "05:00 PM" },
  Thursday: { start: "09:00 AM", end: "06:30 PM" },
  Friday: { start: "08:00 AM", end: "06:30 PM" },
  Saturday: { start: "08:00 AM", end: "05:00 PM" },
};

export default function CalendarSection({
  onDateSelect,
  selectedDate,
}: CalendarSectionProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<any[]>([]);

  useEffect(() => {
    renderCalendar();
  }, [currentDate]);

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: any[] = [];

    // Empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push({ type: "empty" });
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      const isSelected =
        selectedDate &&
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
    onDateSelect(date);
  };

  return (
    <div className="lg:w-7/12 bg-white/60 rounded-xl p-8 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight">
            Select your{" "}
            <span className="font-bold text-[#cf1745]">Preferred Date</span>
          </h1>
          <p className="text-slate-500 mt-1">
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

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 text-center uppercase tracking-widest">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-4 tracking-tighter">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
            <span key={day}>{day}</span>
          ))}
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
                onClick={() => !isPast && handleDateClick(date)}
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
    </div>
  );
}
