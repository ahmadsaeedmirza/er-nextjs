import ContactHero from "@/components/ContactHero";
import MapSection from "@/components/MapSection";
import InquiryForm from "@/components/InquiryForm";

export default function ContactUs() {
  return (
    <main className="font-display bg-background-light text-stone-800 antialiased transition-colors duration-300 min-h-screen">
      {/* Hero Split Section */}
      <section className="relative min-h-[600px] flex flex-col md:flex-row bg-[#F8F6F6] pt-[100px]">
        <ContactHero />
        <MapSection />
      </section>

      {/* Inquiry Form Section */}
      <InquiryForm />
    </main>
  );
}
