"use client";

import ServiceCard from "@/components/ServiceCard";
import SkinCard from "@/components/SkinCard";
import NailCard from "@/components/NailCard";
import ServicesHero from "@/components/ServicesHero";
import QuoteSection from "@/components/QuoteSection";

export default function Services() {
  return (
    <div>
      {/* HERO SECTION */}
      <ServicesHero />

      {/* HAIR CARE SECTION */}
      <section className="py-24 bg-white" id="hair">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-3xl text-black font-bold mb-2">
                Hair Design
              </h2>
              <div className="h-1 w-20 bg-[#cf1745]/30" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <ServiceCard
              imgUrl="/images/manicure.jpg"
              altText="Professional stylist cutting long hair in salon"
              price="85"
              title="Signature Haircut & Styling"
              description="Personalized consultation, luxury wash, precision cut, and professional blowout."
              duration={60}
            />
            <ServiceCard
              imgUrl="/images/manicure.jpg"
              altText="Model with professional balayage blonde hair highlights"
              price="210"
              title="Bespoke Color Treatment"
              description="Hand-painted highlights for a natural, sun-kissed look. Includes toner and treatment."
              duration={180}
            />
            <ServiceCard
              imgUrl="/images/manicure.jpg"
              altText="Hair treatment being applied in salon bowl"
              price="185"
              title="Rejuvenating Facial"
              description="Deep reparative treatment to eliminate frizz and restore shine for up to 3 months."
              duration={90}
            />
          </div>
        </div>
      </section>

      {/* QUOTE SECTION */}
      <QuoteSection />

      {/* SKIN CARE SECTION */}
      <section className="py-24 bg-white" id="skin">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-3xl text-black font-bold mb-2">
                Skin Therapy
              </h2>
              <div className="h-1 w-20 bg-[#cf1745]/30" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <SkinCard
              imgUrl="/images/manicure.jpg"
              altText="Woman receiving relaxing facial treatment with steam"
              category="Aesthetic Skin"
              title="Diamond Glow Facial"
              description="A transformative 3-in-1 technology that simultaneously exfoliates, extracts, and infuses skin with condition-specific serums."
              price="$185"
            />
            <SkinCard
              imgUrl="/images/manicure.jpg"
              altText="Detailed view of luxury skincare products"
              category="Medical Grade"
              title="Chemical Resurfacing"
              description="Professional-grade peels designed to target pigmentation, acne, and fine lines. Includes post-care kit and consultation."
              price="$150"
            />
          </div>
        </div>
      </section>

      {/* NAIL SECTION */}
      <section className="py-24 bg-[#cf1745]/5" id="nails">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#CF1745E6] font-bold tracking-[0.4em] uppercase text-xs mb-2 block">
              The Finishing Touch
            </span>
            <h2 className="text-4xl text-black font-bold mb-4">
              Nail Artistry
            </h2>
            <div className="h-1 w-24 bg-[#cf1745] mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <NailCard
              icon="fa-solid fa-spa"
              title="Classic Manicure"
              description="Cuticle care, nail shaping, massage, and polish."
              price="$45"
            />
            <NailCard
              icon="fa-solid fa-paintbrush"
              title="Gel Extensions"
              description="Full set sculpted extensions with chip-resistant gel."
              price="$85"
            />
            <NailCard
              icon="fa-solid fa-star"
              title="Signature Pedicure"
              description="Hot stone massage and aromatherapy soak."
              price="$65"
            />
            <NailCard
              icon="fa-solid fa-palette"
              title="Custom Nail Art"
              description="Hand-painted designs, foils, and embellishments."
              price="$20"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
