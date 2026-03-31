"use client";

import React, { FormEvent, useState } from "react";

interface ShippingFormData {
  fullName: string;
  streetAddress: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface ShippingFormProps {
  onSubmit: (formData: ShippingFormData) => void;
  isLoading?: boolean;
}

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

const ShippingForm = React.forwardRef<HTMLFormElement, ShippingFormProps>(
  ({ onSubmit, isLoading = false }, ref) => {
    const [formData, setFormData] = useState<ShippingFormData>({
      fullName: "",
      streetAddress: "",
      apartment: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
    });

    const [errors, setErrors] = useState<Partial<ShippingFormData>>({});

    const validateForm = (): boolean => {
      const newErrors: Partial<ShippingFormData> = {};

      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
      if (!formData.streetAddress.trim()) {
        newErrors.streetAddress = "Street address is required";
      }
      if (!formData.city.trim()) {
        newErrors.city = "City is required";
      }
      if (!formData.state) {
        newErrors.state = "State is required";
      }
      if (!formData.zipCode.match(/^[0-9]{5}(-[0-9]{4})?$/)) {
        newErrors.zipCode = "ZIP code must be 5 digits";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
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
      <div className="flex-1 bg-[#E7E5E4]/60 shadow-2xl text-black bg-white rounded-xl p-16">
        <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
        <form
          ref={ref}
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
        >
          {/* Full Name */}
          <div className="md:col-span-2">
            <label className="block text-sm text-stone-400 font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-4 text-sm focus:ring-1 focus:ring-[#CF1745] focus:border-[#CF1745] transition-all ${
                errors.fullName ? "border-red-500" : "border-stone-200"
              }`}
              required
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Street Address */}
          <div className="md:col-span-2">
            <label className="block text-sm text-stone-400 font-medium mb-1">
              Street Address
            </label>
            <input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-4 text-sm focus:ring-1 focus:ring-[#CF1745] focus:border-[#CF1745] transition-all ${
                errors.streetAddress ? "border-red-500" : "border-stone-200"
              }`}
              required
            />
            {errors.streetAddress && (
              <p className="text-red-500 text-xs mt-1">
                {errors.streetAddress}
              </p>
            )}
          </div>

          {/* Apartment, Suite (Optional) */}
          <div className="md:col-span-2">
            <input
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              placeholder="Apartment, suite, etc. (optional)"
              className="w-full border border-stone-200 rounded-lg px-4 py-4 text-sm focus:ring-1 focus:ring-[#CF1745] focus:border-[#CF1745] transition-all"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm text-stone-400 font-medium mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-4 text-sm focus:ring-1 focus:ring-[#CF1745] focus:border-[#CF1745] transition-all ${
                errors.city ? "border-red-500" : "border-stone-200"
              }`}
              required
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm text-stone-400 font-medium mb-1">
              State
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-4 text-sm focus:ring-1 focus:ring-[#CF1745] focus:border-[#CF1745] transition-all ${
                errors.state ? "border-red-500" : "border-stone-200"
              }`}
              required
            >
              <option value="">Select State</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {STATE_NAMES[state]}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-red-500 text-xs mt-1">{errors.state}</p>
            )}
          </div>

          {/* ZIP Code */}
          <div>
            <label className="block text-sm text-stone-400 font-medium mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              pattern="[0-9]{5}(-[0-9]{4})?"
              placeholder="12345 or 12345-6789"
              className={`w-full border rounded-lg px-4 py-4 text-sm focus:ring-1 focus:ring-[#CF1745] focus:border-[#CF1745] transition-all ${
                errors.zipCode ? "border-red-500" : "border-stone-200"
              }`}
              required
            />
            {errors.zipCode && (
              <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm text-stone-400 font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-4 text-sm focus:ring-1 focus:ring-[#CF1745] focus:border-[#CF1745] transition-all ${
                errors.phone ? "border-red-500" : "border-stone-200"
              }`}
              required
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
        </form>
      </div>
    );
  },
);

ShippingForm.displayName = "ShippingForm";

export default ShippingForm;
