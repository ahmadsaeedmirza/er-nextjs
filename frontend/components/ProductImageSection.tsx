"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageSectionProps {
  src: string;
  alt: string;
  isOutOfStock: boolean;
  additionalImages?: string[];
}

export default function ProductImageSection({
  src,
  alt,
  isOutOfStock,
  additionalImages = [],
}: ProductImageSectionProps) {
  // Combine cover image with additional images
  const allImages = [
    src,
    ...(additionalImages || []).map((img) => `/images/products/${img}`),
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const showControls = allImages.length > 1;

  return (
    <div className="w-full md:w-1/2 flex flex-col gap-4">
      {/* Main Large Image */}
      <div className="relative aspect-[4/5] w-full group rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-white">
        <Image
          src={allImages[activeIndex]}
          alt={`${alt} - Image ${activeIndex + 1}`}
          fill
          priority
          className="object-cover transition-all duration-500"
        />

        {/* Out of Stock tag */}
        {isOutOfStock && (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest z-10 shadow">
            Out of Stock
          </div>
        )}

        {/* Navigation Arrows */}
        {showControls && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <i className="fa-solid fa-chevron-left text-sm"></i>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <i className="fa-solid fa-chevron-right text-sm"></i>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Bar */}
      {showControls && (
        <div className="flex gap-2 overflow-x-auto py-2 pr-4 scrollbar-thin">
          {allImages.map((image, index) => (
            <button
              type="button"
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative w-20 aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                index === activeIndex
                  ? "border-[#CF1745] scale-95 ring-2 ring-[#CF1745]/10"
                  : "border-slate-200/80 hover:border-slate-400"
              }`}
            >
              <Image
                src={image}
                alt={`${alt} Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
