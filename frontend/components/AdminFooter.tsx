export default function AdminFooter() {
  return (
    <footer className="bg-white border-t border-[#CF1745]/10 pb-6">
      <div className="px-6">
        <div className="border-t border-[#CF1745]/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            © 2026 E & R Salon. ALL RIGHTS RESERVED. POWERED BY{" "}
            <a
              href="https://www.devitytechnologies.com/"
              target="_blank"
              rel="noopener"
              className="underline"
            >
              Devity Technologies
            </a>
          </p>
          <div className="flex gap-6">
            <a
              className="text-slate-400 hover:text-[#CF1745] transition-colors"
              href="#"
            >
              <i className="fa-brands fa-facebook"></i>
            </a>
            <a
              className="text-slate-400 hover:text-[#CF1745] transition-colors"
              href="#"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a
              className="text-slate-400 hover:text-[#CF1745] transition-colors"
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
