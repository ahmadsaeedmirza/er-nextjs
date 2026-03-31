import Image from "next/image";

interface InstagramPostProps {
  imgUrl: string;
  altText: string;
}

export default function InstagramPost({ imgUrl, altText }: InstagramPostProps) {
  return (
    <div className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg">
      <Image
        src={imgUrl}
        alt={altText}
        fill
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-[#CF1745] opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <i className="fa-solid fa-heart text-white text-3xl" />
      </div>
    </div>
  );
}
