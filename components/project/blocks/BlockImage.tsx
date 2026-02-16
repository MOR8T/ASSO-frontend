"use client";

import Image from "next/image";
import type { BlockImage as BlockImageType } from "@/lib/project-page.types";
import "@/styles/project-page.css";
import "@/styles/cards.css";

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
          className="card-hover relative cursor-pointer w-full block aspect-[21/10] focus:outline-none outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#292d32] rounded overflow-hidden"
          onClick={onImageClick}
          aria-label="Открыть в галерее"
        >
          <div className="card-hover-image absolute inset-0 bg-[#1a1d21]">
            <Image
              src={image.url}
              alt={image.alt ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1280px, height-auto"
            />
          </div>
          <div
            className="card-hover-image-fon absolute inset-0 bg-black/50"
            aria-hidden
          />
        </button>
      </div>
    </section>
  );
}
