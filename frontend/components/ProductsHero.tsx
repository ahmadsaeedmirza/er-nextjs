import Link from "next/link";

export default function ProductsHero() {
  return (
    <section className="relative pb-24 pt-[169px] bg-[#faebe4] flex items-center justify-center overflow-hidden from-slate-50 to-white">
      <div className="text-center z-10">
        <span className="text-primary text-black font-bold tracking-[0.4em] uppercase text-xs mb-4 block">
          EXCLUSIVE SELECTION
        </span>
        <h1 className="text-5xl md:text-6xl font-bold italic mb-6 text-black">
          Signature{" "}
          <span className="text-5xl md:text-6xl mb-6 font-extralight text-primary">
            Collection
          </span>
        </h1>
        <p className="max-w-lg mx-auto font-light text-lg italic mb-12 text-black">
          Elevate your daily beauty ritual with our hand-selected range of
          premium, high-performance essentials.
        </p>
      </div>
    </section>
  );
}
