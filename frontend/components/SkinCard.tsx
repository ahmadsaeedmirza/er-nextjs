import Image from "next/image";
import Link from "next/link";

interface SkinCardProps {
  imgUrl: string;
  altText: string;
  category: string;
  title: string;
  description: string;
  price: string;
}

export default function SkinCard({
  imgUrl,
  altText,
  category,
  title,
  description,
  price,
}: SkinCardProps) {
  return (
    <div className="group flex flex-col md:flex-row bg-[#f8f6f6] rounded-xl overflow-hidden hover:shadow-2xl transition-all">
      {/* Image Container */}
      <div className="md:w-2/5 h-64 md:h-auto overflow-hidden">
        <Image
          src={imgUrl}
          alt={altText}
          width={400}
          height={320}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </div>
      {/* Content Container */}
      <div className="md:w-3/5 p-10 flex flex-col justify-center">
        <div className="text-primary text-black font-bold text-sm mb-2 uppercase tracking-widest">
          {category}
        </div>
        <h3 className="text-2xl text-black font-bold mb-4">{title}</h3>
        <p className="text-sm text-black opacity-70 mb-8 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-[#CF1745E6]">{price}</span>
          <Link
            href={`/bookAppointment?service=${title}`}
            className="bg-[#CF1745E6] text-white px-6 py-2 rounded text-xs font-bold tracking-widest hover:bg-black transition-colors"
          >
            BOOK APPOINTMENT
          </Link>
        </div>
      </div>
    </div>
  );
}
