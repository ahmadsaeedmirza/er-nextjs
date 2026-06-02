import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order Confirmed - E & R Salon",
  description: "Your order has been placed successfully. Thank you for shopping with E & R Salon.",
};

export default function OrderConfirmationPage() {
  return (
    <main className="min-h-screen bg-[#F8F6F6] pt-[169px] pb-24 flex items-center justify-center">
      <div className="max-w-xl w-full mx-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
        {/* Checkmark Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
            <svg
              className="w-10 h-10 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Header */}
        <h1 className="text-3xl text-slate-900 font-extrabold tracking-tight mb-4">
          Order Placed Successfully!
        </h1>
        <p className="text-slate-500 mb-8 text-base leading-relaxed">
          Thank you for your order! We have received your request, and a confirmation email has been sent to your inbox with all your purchase details.
        </p>

        {/* Pickup Details Box */}
        <div className="bg-[#CF1745]/[0.02] border border-[#CF1745]/10 rounded-xl p-6 text-left mb-8">
          <h2 className="text-[#CF1745] font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
            <i className="fa-solid fa-location-dot"></i> Pickup Location & Info
          </h2>
          <p className="text-slate-800 font-medium mb-1 text-sm">E&R Salon</p>
          <p className="text-slate-600 text-sm leading-relaxed mb-3">
            3180 Colima Rd Suite F,
            <br />
            Hacienda Heights, CA 91745
          </p>
          
          <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-4 items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold">
              <i className="fa-solid fa-phone mr-1"></i> +1 (626) 333-6814
            </p>
            <a
              href="https://maps.app.goo.gl/QrYeabnGPKS1rkV6A"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold uppercase tracking-widest text-[#CF1745] hover:text-[#b01235] transition-colors"
            >
              Open with Google Maps &rarr;
            </a>
          </div>
        </div>

        {/* Timings Box */}
        <div className="border border-slate-100 rounded-xl p-6 text-left mb-10">
          <h2 className="text-slate-900 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
            <i className="fa-solid fa-clock"></i> Salon Hours
          </h2>
          <ul className="space-y-2 text-slate-600 text-sm">
            <li className="flex justify-between">
              <span>Mon - Wed</span>
              <span className="font-semibold text-slate-800">09:00 AM - 05:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Thursday</span>
              <span className="font-semibold text-slate-800">09:00 AM - 06:30 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Friday</span>
              <span className="font-semibold text-slate-800">08:00 AM - 06:30 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Saturday</span>
              <span className="font-semibold text-slate-800">08:00 AM - 05:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Sunday</span>
              <span className="font-semibold text-slate-800">09:00 AM - 02:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="px-6 py-3.5 bg-[#CF1745] text-white rounded-xl text-sm font-semibold uppercase tracking-widest hover:scale-105 hover:bg-[#b01235] transition-all text-center shadow-lg shadow-[#CF1745]/20"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="px-6 py-3.5 border-2 border-slate-200 text-slate-600 rounded-xl text-sm font-semibold uppercase tracking-widest hover:bg-slate-50 transition-all text-center"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
