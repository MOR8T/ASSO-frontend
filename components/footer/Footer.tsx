import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import "@/styles/footer.css";
import footer_logo from "../../public/images/logos/footer_logo.svg";
import footerVideoThumb from "../../public/images/projects/tp-2-2.jpg";
import YouTubePlayer from "./YouTubePlayer";
import partner_1 from "../../public/images/logos/partner_1.svg";
import partner_2 from "../../public/images/logos/partner_2.svg";
import partner_3 from "../../public/images/logos/partner_3.svg";
import partner_4 from "../../public/images/logos/partner_4.svg";
import partner_5 from "../../public/images/logos/partner_5.svg";
import {
  getFooter,
  toAbsoluteMediaUrl,
  type FooterResponse,
  type FooterContact,
} from "@/api/footer";

const FOOTER_YOUTUBE_VIDEO_ID =
  process.env.NEXT_PUBLIC_FOOTER_YOUTUBE_VIDEO_ID || "TYV1akotvSc";

const FALLBACK_PARTNERS: { name: string; logo: StaticImageData }[] = [
  { name: "Партнёр 1", logo: partner_1 },
  { name: "Партнёр 2", logo: partner_2 },
  { name: "Партнёр 3", logo: partner_3 },
  { name: "Партнёр 4", logo: partner_4 },
  { name: "Партнёр 5", logo: partner_5 },
];

const FALLBACK_SOCIAL = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/asso.architects/",
    icon: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/asso.architects/",
    icon: "https://cdn.pixabay.com/photo/2021/06/15/12/14/instagram-6338393_1280.png",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/asso-architects/",
    icon: "https://upload.wikimedia.org/wikipedia/commons/f/f8/LinkedIn_icon_circle.svg",
  },
];

type PartnerItem = { name: string; logo: string | StaticImageData };

function normalizeFooterData(data: FooterResponse | null): {
  partners: PartnerItem[];
  videoId: string;
  videoThumbnail: string | StaticImageData;
  videoThumbnailAlt: string;
  videoLabel: string;
  videoUrl: string | null;
  videoMode: "external" | "uploaded";
  social: { name: string; url: string; icon: string }[];
  contacts: FooterContact[];
} {
  if (!data) {
    return {
      partners: FALLBACK_PARTNERS,
      videoId: FOOTER_YOUTUBE_VIDEO_ID,
      videoThumbnail: footerVideoThumb,
      videoThumbnailAlt: "Превью промо ролика",
      videoLabel: "ПРОМО РОЛИК",
      videoUrl: null,
      videoMode: "external",
      social: FALLBACK_SOCIAL,
      contacts: [],
    };
  }

  const partners: PartnerItem[] = data.partners.map((p) => ({
    name: p.name,
    logo: toAbsoluteMediaUrl(p.logo) || p.logo,
  }));

  let videoId = FOOTER_YOUTUBE_VIDEO_ID;
  let videoThumbnail: string | StaticImageData = footerVideoThumb;
  const videoThumbnailAlt = "Превью промо ролика";
  let videoLabel = "ПРОМО РОЛИК";
  let videoUrl: string | null = null;
  let videoMode: "external" | "uploaded" = "external";

  if (data.video) {
    videoMode = data.video.mode;
    videoLabel = data.video.label ?? videoLabel;
    if (data.video.mode === "external" && data.video.video_id) {
      videoId = data.video.video_id;
      videoThumbnail = data.video.thumbnail
        ? toAbsoluteMediaUrl(data.video.thumbnail)
        : footerVideoThumb;
    }
    if (data.video.mode === "uploaded" && data.video.video_url) {
      videoUrl = toAbsoluteMediaUrl(data.video.video_url);
      videoThumbnail = data.video.thumbnail
        ? toAbsoluteMediaUrl(data.video.thumbnail)
        : footerVideoThumb;
    }
  }

  const social = data.social.map((s) => ({
    name: s.name,
    url: s.url,
    icon: toAbsoluteMediaUrl(s.icon) || s.icon,
  }));

  return {
    partners: partners, //partners.length > 0 ? partners : FALLBACK_PARTNERS,
    videoId,
    videoThumbnail,
    videoThumbnailAlt,
    videoLabel,
    videoUrl,
    videoMode,
    social: social, //social.length > 0 ? social : FALLBACK_SOCIAL,
    contacts: data.contacts ?? [],
  };
}

export default async function Footer() {
  let apiData: FooterResponse | null = null;
  try {
    apiData = await getFooter();
  } catch {
    apiData = null;
  }

  const {
    partners,
    videoId,
    videoThumbnail,
    videoThumbnailAlt,
    videoLabel,
    videoUrl,
    videoMode,
    social,
    contacts,
  } = normalizeFooterData(apiData);

  return (
    <footer className="">
      <div className="bg-[#34393F] overflow-hidden">
        <div className="h-55 flex items-center">
          <div className="footer-marquee-track flex items-center gap-16 shrink-0 py-4">
            {[...partners].map((partner, index) => (
              <Image
                key={`${partner.name}-${index}`}
                src={partner.logo}
                alt={`Логотип ${partner.name}`}
                width={150}
                height={150}
                className="shrink-0 object-contain w-auto h-30"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full">
        {videoMode === "uploaded" && videoUrl ? (
          <div
            className="relative w-full max-h-[660px] overflow-hidden bg-black aspect-video"
            style={{ aspectRatio: "16/9" }}
          >
            <video
              controls
              className="absolute inset-0 w-full h-full object-cover"
              poster={
                typeof videoThumbnail === "string" ? videoThumbnail : undefined
              }
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
            {videoLabel && (
              <span className="absolute bottom-40 left-30 z-10 text-[#DBDBDB] text-xl font-medium tracking-wider">
                {videoLabel}
              </span>
            )}
          </div>
        ) : (
          <YouTubePlayer
            videoId={videoId}
            thumbnail={videoThumbnail}
            thumbnailAlt={videoThumbnailAlt}
            label={videoLabel}
          />
        )}
      </div>

      {contacts.length > 0 && (
        <div className="w-full px-5 mx-auto mt-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-[#53565B]">
              {contacts.map((c, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <p className="font-medium text-[#DBDBDB]">{c.city_country}</p>
                  {c.address && <p>{c.address}</p>}
                  {c.contact && <p>{c.contact}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="w-full px-5 mx-auto mt-[200px]">
        <div className="max-w-7xl mx-auto py-7 flex justify-between items-center border-t border-[#5B626B]">
          <Link href="/">
            <Image
              src={footer_logo}
              alt="Логотип ASSO"
              width={200}
              height={100}
            />
          </Link>
          <div className="flex items-center gap-4">
            {social.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="bg-[#53565B] overflow-hidden w-10 h-10 rounded-[20px]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- external icons (API or CDN) */}
                  <img
                    src={link.icon}
                    alt={link.name}
                    width={40}
                    height={40}
                    className=""
                  />
                </div>
              </a>
            ))}
          </div>
          <div className="text-[#53565B] text-right">
            <p>© 2015 • 2024 | Asso Architects</p>
            <p>Все права защищены</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
