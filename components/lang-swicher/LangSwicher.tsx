"use client";
import { Locale, useLocale } from "next-intl";
import localIcon from "@/public/images/icons/local.svg";
import Image from "next/image";
import { langs } from "@/const/cons";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LangSwicher() {
  //   const t = useTranslations("");
  const locale: string = useLocale();
  const router = useRouter();

  const pathname = usePathname();

  function onSelectLang(nextLocale: string) {
    router.replace({ pathname }, { locale: nextLocale as Locale });
  }

  return (
    <div className="flex items-center gap-3 ">
      <button className="cursor-pointer">
        <Image src={localIcon} alt="Local icon" width={24} height={24} />
      </button>
      <ul className="flex items-center gap-3 text-[rgb(219,219,219)] uppercase">
        {langs.map((langsItem) => (
          <li
            onClick={() => onSelectLang(langsItem.value)}
            key={langsItem.value}
            className={`cursor-pointer ${locale === langsItem.value ? "text-orange" : ""}`}
          >
            {langsItem.lang}
          </li>
        ))}
      </ul>
    </div>
  );
}
