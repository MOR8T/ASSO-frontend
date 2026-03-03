// app/page.tsx
import OurServices from "@/components/cards/our-services";
import OurWorks from "@/components/cards/our-works";
import HeroSlider, { SlideItem } from "@/components/slider/Heroslider";
import { getMenuData } from "@/lib/menuData";
import { getProjectsByCategory } from "@/lib/getProjectsByCategory";
import { getHomeSliderList } from "@/api/slider";
import text_image_1 from "@/public/images/test-slider-1.jpeg";
import text_image_2 from "@/public/images/test-slider-2.jpg";
import text_image_3 from "@/public/images/test-slider-3.jpg";

const fallbackSlides: SlideItem[] = [
  { id: 1, type: "image", src: text_image_1, alt: "Архитектура" },
  { id: 2, type: "image", src: text_image_2, alt: "Дизайн интерьера" },
  { id: 11, type: "image", src: text_image_3, alt: "Строительство" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const apiOrigin = API_BASE.replace(/\/$/, "");

function toAbsoluteMediaUrl(path: string): string {
  if (!path || path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}

export default async function HomePage() {
  let slides: SlideItem[];
  try {
    const list = await getHomeSliderList();
    slides = list.map((s) => ({
      id: s.id,
      type: s.type,
      src: toAbsoluteMediaUrl(s.src),
      alt: s.alt,
      poster: s.poster ? toAbsoluteMediaUrl(s.poster) : undefined,
      sources: s.sources?.map((src) => ({ ...src, src: toAbsoluteMediaUrl(src.src) })),
    }));
  } catch {
    slides = fallbackSlides;
  }

  const menu = await getMenuData();
  const firstCategory = menu[0]?.url ?? "archetectur_project";
  const allProjects = await getProjectsByCategory(firstCategory);
  const lastThreeProjects = allProjects.slice(-3);

  return (
    <main className="w-full ">
      <HeroSlider
        slides={slides}
        autoplayDelay={5000}
        loop={true}
        aspectRatio="16/9"
      />
      <OurServices />
      <OurWorks projects={lastThreeProjects} />
    </main>
  );
}
