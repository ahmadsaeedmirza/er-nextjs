"use client";

import { FormEvent, useState, ChangeEvent } from "react";

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Special Events & Bridal",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Please enter your name", "error");
      return;
    }

    if (!formData.email.trim()) {
      showToast("Please enter your email", "error");
      return;
    }

    if (!formData.message.trim()) {
      showToast("Please enter your message", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Message sent successfully!", "success");
        setFormData({
          name: "",
          email: "",
          subject: "Special Events & Bridal",
          message: "",
        });
      } else {
        showToast(data.message || "Failed to send message", "error");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      showToast("Failed to send message. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 px-6 bg-[#F8F6F6]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#CF1745] mb-4">
            Inquiry
          </h2>
          <h3 className="text-4xl font-extralight">
            Send us a <span className="font-semibold italic">Message</span>
          </h3>
          <div className="w-12 h-1 bg-[#CF1745] mx-auto mt-6" />
        </div>

        <div className="bg-[#ffffff66] backdrop-blur-xl p-8 lg:p-16 rounded-xl shadow-2xl">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 px-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Johnathan Doe"
                className="w-full bg-white border border-stone-200 rounded-lg px-4 py-4 text-sm focus:ring-1 focus:ring-[#CF1745] focus:border-[#CF1745] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 px-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full bg-white border border-stone-200 rounded-lg px-4 py-4 text-sm focus:ring-1 focus:ring-[#CF1745] focus:border-[#CF1745] transition-all"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 px-1">
                Subject
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-white border border-stone-200 rounded-lg px-4 py-4 text-sm focus:ring-1 focus:ring-[#CF1745] focus:border-[#CF1745] transition-all appearance-none"
              >
                <option>Special Events & Bridal</option>
                <option>Corporate Bookings</option>
                <option>Career Opportunities</option>
                <option>Other Inquiry</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 px-1">
                How can we help?
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your request..."
                rows={5}
                className="w-full bg-white/50 border border-stone-200 rounded-lg px-4 py-4 text-sm focus:ring-1 focus:ring-[#CF1745] focus:border-[#CF1745] transition-all"
              />
            </div>

            <div className="md:col-span-2 text-center pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#CF1745] hover:bg-[#CF1745]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-12 py-4 rounded-full text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-xl shadow-[#CF1745]/30 flex items-center justify-center mx-auto space-x-2"
              >
                <span>{isLoading ? "Sending..." : "Send Inquiry"}</span>
                <i className="fa-solid fa-arrow-right" />
              </button>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-6">
                We typically respond within 24 business hours
              </p>
            </div>
          </form>
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
    </section>
  );
}
