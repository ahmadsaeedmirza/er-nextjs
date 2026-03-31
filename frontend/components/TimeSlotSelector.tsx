"use client";

import { useEffect, useState } from "react";

interface TimeSlotSelectorProps {
  selectedDate: Date | null;
  onTimeSelect: (time: string) => void;
  selectedTime: string | null;
}

const TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
];

const OPENING_HOURS: Record<string, { start: string; end: string }> = {
  Sunday: { start: "09:00 AM", end: "02:00 PM" },
  Monday: { start: "09:00 AM", end: "05:00 PM" },
  Tuesday: { start: "09:00 AM", end: "05:00 PM" },
  Wednesday: { start: "09:00 AM", end: "05:00 PM" },
  Thursday: { start: "09:00 AM", end: "06:30 PM" },
  Friday: { start: "08:00 AM", end: "06:30 PM" },
  Saturday: { start: "08:00 AM", end: "05:00 PM" },
};

function parseTime(timeStr: string): number {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export default function TimeSlotSelector({
  selectedDate,
  onTimeSelect,
  selectedTime,
}: TimeSlotSelectorProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const dayName = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const hours = OPENING_HOURS[dayName];

    if (!hours) {
      setAvailableSlots([]);
      return;
    }

    const startTime = parseTime(hours.start);
    const endTime = parseTime(hours.end);

    const available = TIME_SLOTS.filter((slot) => {
      const slotTime = parseTime(slot);
      return slotTime >= startTime && slotTime <= endTime;
    });

    setAvailableSlots(available);
  }, [selectedDate]);

  return (
    <div className="mt-8 pt-8 text-black border-t border-[#cf1745]/10">
      <h3 className="text-sm font-bold uppercase tracking-widest mb-4">
        Select Time
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {TIME_SLOTS.map((time) => {
          const isAvailable = availableSlots.includes(time);
          const isSelected = selectedTime === time;

          return (
            <button
              key={time}
              onClick={() => isAvailable && onTimeSelect(time)}
              disabled={!isAvailable}
              className={`py-3 px-4 rounded-lg border text-sm text-black font-medium transition-all ${
                !isAvailable
                  ? "opacity-30 cursor-not-allowed border-slate-300 bg-slate-100"
                  : isSelected
                    ? "bg-[#CF1745] text-white border-[#CF1745]"
                    : "border-[#CF1745]/20 bg-white/40 hover:border-[#CF1745] cursor-pointer"
              }`}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
