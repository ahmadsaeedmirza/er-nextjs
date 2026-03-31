import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-primary/10 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="relative col-span-1">
            <Link
              className="text-3xl font-extrabold tracking-tighter text-primary block mb-6"
              href="/"
            >
              <div className="relative h-20 w-48">
                <Image
                  src="/images/logo-3.png"
                  alt="Salon Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-slate-500 font-light leading-relaxed">
              Defining the standards of luxury beauty through exceptional
              service and artistic innovation since 2012.
            </p>
          </div>
          <div>
            <h5 className="text-sm text-black font-bold uppercase tracking-widest mb-6">
              Explore
            </h5>
            <ul className="space-y-4">
              <li>
                <Link
                  className="text-slate-500 hover:text-[#CF1745] transition-colors font-light"
                  href="/"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-500 hover:text-[#CF1745] transition-colors font-light"
                  href="/services"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-500 hover:text-[#CF1745] transition-colors font-light"
                  href="/products"
                >
                  Our Products
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-500 hover:text-[#CF1745] transition-colors font-light"
                  href="/bookAppointment"
                >
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-500 hover:text-[#CF1745] transition-colors font-light"
                  href="/contactUs"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm text-black font-bold uppercase tracking-widest mb-6">
              Visit Us
            </h5>
            <ul className="space-y-4 text-slate-500 font-light">
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-location-dot mt-1 text-primary"></i>
                <span>
                  124 Madison Avenue
                  <br />
                  New York, NY 10016
                </span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fa-solid fa-phone text-primary"></i>
                <span>+1 (212) 555-0198</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fa-regular fa-envelope text-primary"></i>
                <span>contact@eandrsalon.com</span>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm text-black font-bold uppercase tracking-widest mb-6">
              Hours
            </h5>
            <ul className="space-y-4 text-slate-500 font-light">
              <li className="flex justify-between">
                <span>Mon - Wed</span>
                <span className="font-semibold">09:00 AM - 05:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Thursday</span>
                <span className="font-semibold">09:00 AM - 06:30 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Friday</span>
                <span className="font-semibold">08:00 AM - 06:30 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span className="font-semibold">08:00 AM - 05:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="font-semibold">09:00 AM - 02:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-black pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            © 2026 E & R Salon. ALL RIGHTS RESERVED. POWERED BY{" "}
            <a
              href="https://www.linkedin.com/in/ahmad-saeed-057a952a1/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Ahmad Saeed
            </a>
          </p>
          <div className="flex gap-6">
            <a
              className="text-slate-400 hover:text-primary transition-colors"
              href="#"
            >
              <i className="fa-brands fa-facebook"></i>
            </a>
            <a
              className="text-slate-400 hover:text-primary transition-colors"
              href="#"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a
              className="text-slate-400 hover:text-primary transition-colors"
              href="#"
            >
              <i className="fa-solid fa-at"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
