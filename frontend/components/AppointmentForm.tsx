"use client";

import { ChangeEvent, FormEvent, useState, useEffect } from "react";

interface AppointmentFormProps {
  onSubmit: (data: AppointmentData) => Promise<void>;
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedService: string;
  selectedPrice: number;
  isLoading: boolean;
  onServiceChange?: (service: string) => void;
}

export interface AppointmentData {
  name: string;
  phone: string;
  email: string;
  service: string;
}

const SERVICES = [
  "Signature Haircut & Styling",
  "Bespoke Color Treatment",
  "Rejuvenating Facial",
  "Deep Tissue Stone Massage",
  "Deluxe Manicure & Pedicure",
  "Classic Manicure",
  "Gel Extensions",
  "Signature Pedicure",
  "Custom Nail Art",
  "Chemical Resurfacing",
  "Diamond Glow Facial",
];

export default function AppointmentForm({
  onSubmit,
  selectedDate,
  selectedTime,
  selectedService,
  selectedPrice,
  isLoading,
  onServiceChange,
}: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: selectedService || SERVICES[0],
  });

  // Update form data when selectedService prop changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      service: selectedService || SERVICES[0],
    }));
  }, [selectedService]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Call the callback if service was changed
    if (name === "service" && onServiceChange) {
      onServiceChange(value);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Please enter your phone number");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (!formData.service) {
      alert("Please select a service");
      return;
    }

    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    if (!selectedTime) {
      alert("Please select a time");
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="w-full px-4 py-3 bg-slate-50 text-black border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#CF1745] transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            className="w-full px-4 py-3 bg-slate-50 text-black border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#cf1745] transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e&r@luxury.com"
            className="w-full px-4 py-3 text-black bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#CF1745] transition-all"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Service Category
        </label>
        <select
          name="service"
          value={formData.service}
          onChange={handleChange}
          className="w-full px-4 py-3 text-black bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#CF1745] focus:border-transparent outline-none transition-all appearance-none"
        >
          {SERVICES.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-[#CF1745]/5 rounded-xl p-4 border border-[#CF1745]/10">
        <h4 className="text-xs font-bold uppercase tracking-widest text-[#CF1745] mb-2">
          Selection Summary
        </h4>
        <div className="flex justify-between items-center text-black text-sm">
          <div>
            <p className="font-bold">
              {selectedDate
                ? selectedDate.toLocaleDateString()
                : "Select a date"}
            </p>
            <p className="text-slate-500">
              {selectedTime ? `at ${selectedTime}` : "Select a time"}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold">{selectedService || "Select a service"}</p>
            <p className="text-[#CF1745] font-bold">
              ${selectedPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full cursor-pointer bg-[#cf1745] hover:bg-[#cf1745]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg shadow-xl transition-all flex items-center justify-center space-x-2"
      >
        <span className="uppercase tracking-widest">
          {isLoading ? "Booking..." : "Confirm Appointment"}
        </span>
        <i className="fa-solid fa-arrow-right pl-2" />
      </button>
    </form>
  );
}
