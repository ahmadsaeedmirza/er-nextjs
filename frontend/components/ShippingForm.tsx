"use client";

import React, { FormEvent, useState } from "react";

interface ShippingFormData {
  fullName: string;
  email: string;
  phone: string;
}

interface ShippingFormProps {
  onSubmit: (formData: ShippingFormData) => void;
  isLoading?: boolean;
}

const ShippingForm = React.forwardRef<HTMLFormElement, ShippingFormProps>(
  ({ onSubmit, isLoading = false }, ref) => {
    const [formData, setFormData] = useState<ShippingFormData>({
      fullName: "",
      email: "",
      phone: "",
    });

    const [errors, setErrors] = useState<Partial<ShippingFormData>>({});

    const validateForm = (): boolean => {
      const newErrors: Partial<ShippingFormData> = {};

      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email address is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Clear error for this field
      if (errors[name as keyof ShippingFormData]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (validateForm()) {
        onSubmit(formData);
      }
    };

    return (
      <div className="flex-1 bg-white border border-slate-100 shadow-sm rounded-2xl p-8 text-black">
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Pickup Details</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          E & R Salon operates on a **pickup-only** basis. Please enter your contact information below.
        </p>

        {/* Info Alert Box */}
        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 mb-6 text-amber-800 text-xs flex gap-3 items-start">
          <i className="fa-solid fa-circle-info text-amber-600 text-base mt-0.5"></i>
          <div>
            <p className="font-semibold mb-1 text-amber-900">Pickup Location:</p>
            <p className="text-amber-800/90 leading-relaxed">
              3180 Colima Rd Suite F, Hacienda Heights, CA 91745
              <br />
              <a
                className="text-xs font-bold uppercase tracking-widest text-[#CF1745]/60 hover:text-[#CF1745] mt-2 inline-block transition-colors"
                href="https://maps.app.goo.gl/QrYeabnGPKS1rkV6A"
                target="_blank"
                rel="noreferrer"
              >
                View on Google Maps
              </a>
            </p>
          </div>
        </div>

        <form
          ref={ref}
          onSubmit={handleSubmit}
          className="space-y-4 w-full"
        >
          {/* Full Name */}
          <div>
            <label className="block text-sm text-slate-500 font-semibold mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full border rounded-xl px-4 py-3.5 text-slate-900 bg-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-[#CF174514] focus:border-[#CF1745] outline-none transition-all ${errors.fullName ? "border-red-500" : "border-slate-200"
                }`}
              required
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1.5">{errors.fullName}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm text-slate-500 font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border rounded-xl px-4 py-3.5 text-slate-900 bg-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-[#CF174514] focus:border-[#CF1745] outline-none transition-all ${errors.email ? "border-red-500" : "border-slate-200"
                }`}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm text-slate-500 font-semibold mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="(123) 456-7890"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full border rounded-xl px-4 py-3.5 text-slate-900 bg-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-[#CF174514] focus:border-[#CF1745] outline-none transition-all ${errors.phone ? "border-red-500" : "border-slate-200"
                }`}
              required
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>
            )}
          </div>
        </form>
      </div>
    );
  },
);

ShippingForm.displayName = "ShippingForm";

export default ShippingForm;
