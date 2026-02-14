// app/page.tsx
import OurServices from "@/components/cards/our-services";
import OurWorks from "@/components/cards/our-works";
import HeroSlider, { SlideItem } from "@/components/slider/Heroslider";
import text_image from "@/public/images/test_slider.jpg";

const slides: SlideItem[] = [
  // ── 1. Regular image ──────────────────────────────────────────────────────
  {
    id: 1,
    type: "image", // optional — auto-detected from .jpg extension
    src: text_image,
    alt: "Modern urban park",
  },
  {
    id: 11,
    type: "image",
    src: text_image,
    alt: "Modern urban park",
  },
  /*
  // ── 2. MP4 video ──────────────────────────────────────────────────────────
  {
    id: 2,
    type: "video", // explicit; or omit — .mp4 is auto-detected
    src: "/slides/promo.mp4",
    poster: "/slides/promo-poster.jpg", // thumbnail shown before play
    alt: "Promo video",
  },

  // ── 3. GIF (treated as video for object-fit: cover rendering) ────────────
  {
    id: 3,
    src: "/slides/animation.gif", // .gif → auto-detected as "video"
    alt: "Animated landscape",
  },

  // ── 4. Multi-format video (webm first = smaller; mp4 = fallback) ─────────
  {
    id: 4,
    src: "/slides/hero.mp4", // final fallback
    alt: "Drone flyover",
    poster: "/slides/hero-poster.jpg",
    sources: [
      { src: "/slides/hero.webm", type: "video/webm" },
      { src: "/slides/hero.mp4", type: "video/mp4" },
    ],
  },

  // ── 5. Image with no overlay ──────────────────────────────────────────────
  {
    id: 5,
    src: "/slides/landscape.jpg",
    alt: "Landscape architecture",
  },*/
];

export default function HomePage() {
  return (
    <main className="w-full ">
      <HeroSlider
        slides={slides}
        autoplayDelay={5000}
        loop={true}
        aspectRatio="16/9" // "21/9" for cinematic, "4/3" for square-ish
      />
      <OurServices />
      <OurWorks />
    </main>
  );
}
