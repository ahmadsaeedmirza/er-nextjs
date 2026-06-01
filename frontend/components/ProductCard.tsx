import Image from "next/image";

interface ProductCardProps {
  image: string;
  title: string;
  description: string;
}

export default function ProductCard({
  image,
  title,
  description,
}: ProductCardProps) {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-all duration-500">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </div>
      <div className="p-8">
        <h4 className="text-xl text-black font-semibold mb-2 line-clamp-2 h-14 capitalize">
          {title}
        </h4>
        <p className="text-sm text-slate-400 mb-6 font-light leading-relaxed line-clamp-1">
          {description}
        </p>
        <button className="px-6 py-2 bg-[#CF1745E6] text-white rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#CF1745] transition-colors">
          Buy Now
        </button>
      </div>
    </div>
  );
}
