import Image from "next/image";

interface ProductImageSectionProps {
  src: string;
  alt: string;
  isOutOfStock: boolean;
}

export default function ProductImageSection({
  src,
  alt,
  isOutOfStock,
}: ProductImageSectionProps) {
  return (
    <div className="w-full md:w-2/3">
      <div className="relative">
        <Image
          src={src}
          alt={alt}
          width={600}
          height={500}
          className="w-full h-[500px] rounded-lg object-cover"
        />
        {isOutOfStock && (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
            Out of Stock
          </div>
        )}
      </div>
    </div>
  );
}
