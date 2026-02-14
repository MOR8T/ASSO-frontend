"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaType = "image" | "video";

const VIDEO_EXTS = /\.(mp4|webm|ogg|mov|avi|gif)(\?.*)?$/i;
const detectType = (src: string): MediaType =>
  VIDEO_EXTS.test(src) ? "video" : "image";

export interface SlideItem {
  id: string | number;
  src: string;
  type?: MediaType;
  alt: string;
  /** Thumbnail shown before video loads */
  poster?: string;
  /** Multiple source formats: [{ src, type }] — webm first, mp4 fallback */
  sources?: Array<{ src: string; type: string }>;
}

export interface SliderProps {
  slides: SlideItem[];
  /** Auto-advance delay in ms. Default: 5000 */
  autoplayDelay?: number;
  /** Infinite loop. Default: true */
  loop?: boolean;
  /** CSS aspect-ratio. Default: "16/9" */
  aspectRatio?: string;
  className?: string;
}

// ─── VideoSlide ───────────────────────────────────────────────────────────────

const VideoSlide: React.FC<{ slide: SlideItem; isActive: boolean }> = ({
  slide,
  isActive,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      className="s-media"
      poster={slide.poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={slide.alt}
    >
      {slide.sources?.map((s) => (
        <source key={s.src} src={s.src} type={s.type} />
      ))}
      {!slide.sources && <source src={slide.src} />}
    </video>
  );
};

// ─── Slider ───────────────────────────────────────────────────────────────────

export const Slider: React.FC<SliderProps> = ({
  slides,
  autoplayDelay = 5000,
  loop = true,
  aspectRatio = "16/9",
  className = "",
}) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <>
      <style>{`
        .s-root {
          position: relative;
          width: 100%;
          aspect-ratio: ${aspectRatio};
          overflow: hidden;
          background: #0d0d0d;
          user-select: none;
          height: calc(100vh - 101.65px);
          max-height: 850px;
        }
        .s-root .swiper,
        .s-root .swiper-wrapper,
        .s-root .swiper-slide { height: calc(100vh - 101.65px); max-height: 850px; }

        .s-media {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      `}</style>

      <div
        className={`s-root ${className}`}
        role="region"
        aria-label="Media slider"
      >
        <Swiper
          modules={[Autoplay, Keyboard]}
          onSwiper={(s) => {
            swiperRef.current = s;
          }}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          loop={loop}
          speed={700}
          grabCursor
          keyboard={{ enabled: true }}
          autoplay={{ delay: autoplayDelay, disableOnInteraction: false }}
          className=""
        >
          {slides.map((slide, i) => {
            const mediaType = slide.type ?? detectType(slide.src);
            return (
              <SwiperSlide key={slide.id}>
                {mediaType === "video" ? (
                  <VideoSlide slide={slide} isActive={activeIndex === i} />
                ) : (
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    className="s-media"
                    priority={i === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1400px"
                    quality={90}
                  />
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </>
  );
};

export default Slider;
