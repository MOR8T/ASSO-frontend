"use client";

import Image from "next/image";
import type { ProjectHero as ProjectHeroType } from "@/lib/project-page.types";
import "@/styles/project-page.css";

type ProjectHeroProps = {
  hero: ProjectHeroType;
  onImageClick?: () => void;
};

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const id =
      u.searchParams.get("v") ||
      (u.hostname === "youtu.be" ? u.pathname.slice(1) : null);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=0` : null;
  } catch {
    return null;
  }
}

export default function ProjectHero({ hero, onImageClick }: ProjectHeroProps) {
  const isVideo = hero.mediaType === "video" && hero.videoUrl;
  const embedUrl = isVideo && hero.videoUrl ? getYouTubeEmbedUrl(hero.videoUrl) : null;

  return (
    <section className="relative w-full h-100 overflow-hidden project-hero-media bg-[#1a1d21]">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title="Видео проекта"
          className="absolute inset-0 w-full h-full object-cover"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className=" inset-0 w-full h-full block focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 relative"
          onClick={hero.mediaType === "image" ? onImageClick : undefined}
          aria-label="Открыть в галерее"
        >
          <Image
            src={hero.image.url}
            alt={hero.image.alt ?? hero.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </button>
      )}
      <div className="absolute inset-0 project-hero-overlay flex items-end">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-24">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-semibold uppercase tracking-wide">
            {hero.title}
          </h1>
          <p className="text-white/90 text-md sm:text-lg mt-2 uppercase tracking-wide">
            {hero.location}
          </p>
        </div>
      </div>
    </section>
  );
}
