import Link from "next/link";

export default function ServicesHero() {
  return (
    <header className="relative text-black pb-24 pt-[169px] bg-[#faebe4] from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <span className="text-primary font-bold tracking-[0.4em] uppercase text-xs mb-4 block">
          Exquisite Care
        </span>
        <h1 className="text-5xl md:text-6xl font-extralight mb-6">
          Services &amp;{" "}
          <span className="text-5xl md:text-6xl mb-6 font-bold text-primary italic">
            Pricing
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg opacity-80 font-light leading-relaxed mb-12">
          Indulge in our curated selection of high-end beauty treatments. Every
          service is tailored to your unique profile using the world's finest
          organic products.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="#hair"
            className="px-6 py-2 rounded-full border border-[#cf174533] hover:bg-[#cf17451A] transition-colors text-sm font-medium"
          >
            Hair Care
          </Link>
          <Link
            href="#skin"
            className="px-6 py-2 rounded-full border border-[#cf174533] hover:bg-[#cf17451A] transition-colors text-sm font-medium"
          >
            Skin Therapy
          </Link>
          <Link
            href="#nails"
            className="px-6 py-2 rounded-full border border-[#cf174533] hover:bg-[#cf17451A] transition-colors text-sm font-medium"
          >
            Nail Artistry
          </Link>
        </div>
      </div>
    </header>
  );
}
