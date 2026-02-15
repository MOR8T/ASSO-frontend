"use client";

import Image from "next/image";
import type {
  BlockGallery as BlockGalleryType,
  GalleryCardSize,
} from "@/lib/project-page.types";
import "@/styles/project-page.css";
import "@/styles/cards.css";

type BlockGalleryProps = {
  data: BlockGalleryType["data"];
  startIndex: number;
  onPhotoClick: (index: number) => void;
};

const sizeClass: Record<GalleryCardSize, string> = {
  "1x1": "project-gallery-item-1x1",
  "2x1": "project-gallery-item-2x1",
  "1x2": "project-gallery-item-1x2",
  "2x2": "project-gallery-item-2x2",
};

export default function BlockGallery({
  data,
  startIndex,
  onPhotoClick,
}: BlockGalleryProps) {
  return (
    <section className="project-section-dark w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-6">
        <div className="project-gallery-grid">
          {data.items.map((item, i) => (
            <button
              key={`${startIndex}-${i}`}
              type="button"
              className={`card-hover relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-inset min-h-[200px] ${sizeClass[item.size]}`}
              onClick={() => onPhotoClick(startIndex + i)}
              aria-label={item.image.alt ?? "Открыть в галерее"}
            >
              <div className="card-hover-image absolute inset-0 bg-[#1a1d21]">
                <Image
                  src={item.image.url}
                  alt={item.image.alt ?? ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div
                className="card-hover-image-fon absolute inset-0 bg-black/50"
                aria-hidden
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
