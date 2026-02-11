import Image from "next/image";
import logo from "../../public/images/logos/logo.svg";
import menuIcon from "@/public/images/icons/menu.svg";
import LangSwicher from "../lang-swicher/LangSwicher";
import { Link } from "@/i18n/navigation";

export default function Header() {
  const headers = [
    {
      id: 1,
      title: "О нас",
      value: "about",
    },
    {
      id: 2,
      title: "Наши услуги",
      value: "services",
    },
    {
      id: 3,
      title: "Вакансии",
      value: "vacancies",
    },
    {
      id: 4,
      title: "Академия",
      value: "academy",
    },
    {
      id: 5,
      title: "Контакты",
      value: "contacts",
    },
  ];

  return (
    <header className="w-full px-5 mx-auto">
      <div className="max-w-7xl mx-auto py-7 flex justify-between items-center">
        <Link href="/">
          <Image src={logo} alt="ASSO logo" width={200} height={100} />
        </Link>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 text-[rgb(219,219,219)] uppercase">
            {headers.map((header) => (
              <Link key={header.id} href={`/${header.value}`}>
                {header.title}
              </Link>
            ))}
          </div>
          <LangSwicher />
          <button className="cursor-pointer">
            <Image src={menuIcon} alt="Menu icon" width={28} height={28} />
          </button>
        </div>
      </div>
    </header>
  );
}
