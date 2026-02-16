import { Link } from "@/i18n/navigation";
import Image from "next/image";
import "@/styles/footer.css";
import footer_logo from "../../public/images/logos/footer_logo.svg";
import footerVideoThumb from "../../public/images/footer_video.png";
import YouTubePlayer from "./YouTubePlayer";
import partner_1 from "../../public/images/logos/partner_1.svg";
import partner_2 from "../../public/images/logos/partner_2.svg";
import partner_3 from "../../public/images/logos/partner_3.svg";
import partner_4 from "../../public/images/logos/partner_4.svg";
import partner_5 from "../../public/images/logos/partner_5.svg";

// ID видео из ссылки YouTube: https://www.youtube.com/watch?v=VIDEO_ID
const FOOTER_YOUTUBE_VIDEO_ID =
  process.env.NEXT_PUBLIC_FOOTER_YOUTUBE_VIDEO_ID || "TYV1akotvSc";

export default function Footer() {
  const socialMediaLinks = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/yourpage",
      icon: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg",
    },
    {
      name: "Twitter",
      url: "https://www.twitter.com/yourprofile",
      icon: "https://www.twitter.com/favicon.ico",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/yourprofile",
      icon: "https://cdn.pixabay.com/photo/2021/06/15/12/14/instagram-6338393_1280.png",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/yourprofile",
      icon: "https://www.linkedin.com/favicon.ico",
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/channel/yourchannel",
      icon: "https://upload.wikimedia.org/wikipedia/commons/f/fc/YouTube_play_button_square_%282013-2017%29.svg",
    },
  ];

  const partners = [
    {
      name: "Партнёр 1",
      logo: partner_1,
    },
    {
      name: "Партнёр 2",
      logo: partner_2,
    },
    {
      name: "Партнёр 3",
      logo: partner_3,
    },
    {
      name: "Партнёр 4",
      logo: partner_4,
    },
    {
      name: "Партнёр 5",
      logo: partner_5,
    },
  ];

  return (
    <footer className="">
      <div className="bg-[#34393F] overflow-hidden">
        <div className="h-55 flex items-center">
          <div className="footer-marquee-track flex items-center gap-16 shrink-0 py-4">
            {[...partners, ...partners].map((partner, index) => (
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
        <YouTubePlayer
          videoId={FOOTER_YOUTUBE_VIDEO_ID}
          thumbnail={footerVideoThumb}
          thumbnailAlt="Превью промо ролика"
          label="ПРОМО РОЛИК"
        />
      </div>
      {/* последняя секция */}
      <div className="w-full px-5 mx-auto mt-[200px]">
        <div className="max-w-7xl mx-auto py-7 flex justify-between items-center border-t border-[#5B626B]">
          <Link href="/">
            <Image src={footer_logo} alt="Логотип ASSO" width={200} height={100} />
          </Link>
          <div className="flex items-center gap-4">
            {socialMediaLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="bg-[#53565B] w-10 h-10 rounded-[20px]">
                  {/* <Image
                    src={link.icon}
                    alt={`${link.name}`}
                    width={40}
                    height={40}
                    className="mx-auto my-2"
                  /> */}
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
