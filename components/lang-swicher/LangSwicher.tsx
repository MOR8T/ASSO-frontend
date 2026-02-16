"use client";
import { Locale, useLocale } from "next-intl";
import localIcon from "@/public/images/icons/local.svg";
import Image from "next/image";
import { langs } from "@/const/cons";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";

const ANIMATION_DURATION_MS = 200;

export default function LangSwicher() {
  const locale: string = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [entered, setEntered] = useState(false);

  // Анимация появления (после отрисовки начального состояния)
  useEffect(() => {
    if (isOpen && !isExiting) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true));
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen, isExiting]);

  // После анимации исчезновения — скрываем список
  useEffect(() => {
    if (!isExiting) return;
    const id = setTimeout(() => {
      setIsOpen(false);
      setIsExiting(false);
      setEntered(false);
    }, ANIMATION_DURATION_MS);
    return () => clearTimeout(id);
  }, [isExiting]);

  function open() {
    setEntered(false);
    setIsExiting(false);
    setIsOpen(true);
  }

  function close() {
    if (!isOpen) return;
    setIsExiting(true);
  }

  function onSelectLang(nextLocale: string) {
    router.replace({ pathname }, { locale: nextLocale as Locale });
    close();
  }

  const showList = isOpen || isExiting;
  const isVisible = entered && !isExiting;

  return (
    <div className="relative flex items-center gap-3 w-[110px]">
      <button
        type="button"
        onClick={() => (showList && !isExiting ? close() : open())}
        className="cursor-pointer"
        aria-expanded={showList}
        aria-haspopup="true"
      >
        <Image src={localIcon} alt="Local icon" width={24} height={24} />
      </button>
      {showList && (
        <ul
          className="flex items-center gap-3 text-[rgb(219,219,219)] uppercase transition-all duration-200 ease-out"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "scale(1)" : "scale(0.95)",
          }}
          role="listbox"
        >
          {langs.map((langsItem) => (
            <li
              role="option"
              aria-selected={locale === langsItem.value}
              onClick={() => onSelectLang(langsItem.value)}
              key={langsItem.value}
              className={`cursor-pointer transition-colors duration-150 hover:text-orange ${locale === langsItem.value ? "text-orange" : ""}`}
            >
              {langsItem.lang}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
