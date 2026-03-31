import Link from "next/link";

interface NailCardProps {
  icon: string;
  title: string;
  description: string;
  price: string;
}

export default function NailCard({
  icon,
  title,
  description,
  price,
}: NailCardProps) {
  return (
    <div className="bg-white p-8 rounded-xl border border-[#cf1745]/5 shadow-sm hover:-translate-y-2 transition-transform">
      <i
        className={`${icon} text-primary text-[#CF1745E6] mb-4 text-3xl block`}
      />
      <h4 className="font-bold text-black text-lg my-2">{title}</h4>
      <p className="text-sm text-black opacity-70 mb-6">{description}</p>
      <div className="flex justify-between items-center border-t border-[#cf1745]/20 pt-4">
        <span className="font-bold text-[#CF1745E6]">{price}</span>
        <Link
          href={`/bookAppointment?service=${title}`}
          className="text-xs text-black font-bold uppercase tracking-tighter hover:text-[#CF1745E6]"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
