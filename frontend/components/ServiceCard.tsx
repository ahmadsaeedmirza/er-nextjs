import Image from "next/image";
import Link from "next/link";

interface ServiceCardProps {
  imgUrl: string;
  altText: string;
  price: string;
  title: string;
  description: string;
  duration: number;
}

export default function ServiceCard({
  imgUrl,
  altText,
  price,
  title,
  description,
  duration,
}: ServiceCardProps) {
  return (
    <div className="service-card group bg-[#f8f6f6] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
      <div className="h-64 overflow-hidden relative">
        <Image
          src={imgUrl}
          alt={altText}
          fill
          className="service-image w-full h-full object-cover transition-transform duration-700 hover:scale-[1.05]"
        />
        <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded text-primary font-bold text-black text-sm">
          From ${price}
        </div>
      </div>
      <div className="p-8">
        <h3 className="text-xl text-black font-bold mb-2">{title}</h3>
        <p className="text-sm text-black opacity-70 mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-black font-semibold uppercase tracking-widest opacity-50">
            {duration} Minutes
          </span>
          <Link
            href={`/bookAppointment?service=${title}`}
            className="flex items-center gap-2 text-primary cursor-pointer font-bold text-[#CF1745E6] group-hover:translate-x-1 transition-transform"
          >
            BOOK NOW
            <i className="fa-solid fa-chevron-right text-[#CF1745E6] text-sm" />
          </Link>
        </div>
      </div>
    </div>
  );
}
