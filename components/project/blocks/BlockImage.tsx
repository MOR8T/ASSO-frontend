"use client";

import Image from "next/image";
import type { BlockImage as BlockImageType } from "@/lib/project-page.types";
import "@/styles/project-page.css";

type BlockImageProps = {
  data: BlockImageType["data"];
  onImageClick?: () => void;
};

export default function BlockImage({ data, onImageClick }: BlockImageProps) {
  const { image } = data;

  return (
    <section className="w-full project-section-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-6">
        <button
          type="button"
          className="relative cursor-pointer w-full block h-auto focus:outline-none outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#292d32] rounded overflow-hidden"
          onClick={onImageClick}
          aria-label="Открыть в галерее"
        >
          <div className="relative w-full aspect-[21/10] h-auto">
            <Image
              src={image.url}
              alt={image.alt ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1280px, height-auto"
            />
          </div>
        </button>
      </div>
    </section>
  );
}
