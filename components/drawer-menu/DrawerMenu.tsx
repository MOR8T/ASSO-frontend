"use client";
import { useEffect } from "react";
import Link from "next/link";
import home_icon from "@/public/images/icons/home.svg";
import Image from "next/image";

export interface DrawerItem {
  id: string;
  title: string;
  url?: string;
  children?: {
    id: string;
    title: string;
    url: string;
  }[];
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menu: DrawerItem[];
}

export const DrawerMenu = ({ isOpen, onClose, menu }: DrawerProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? " opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[320px] sm:mt-[101px]
        bg-[rgba(43,53,59,0.85)]
        shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-full flex flex-col justify-between p-[50px_20px_180px_50px] overflow-y-auto">
          <div className="space-y-7">
            {menu?.map((section, s_i) => (
              <div
                key={section.id}
                className={`text-[#DBDBDB] font-stretch-condensed`}
              >
                <Link
                  href={`/projects/${section?.url ?? "#"}`}
                  className={`block text-orange-500 uppercase font-extralight text-[22px] mb-4 hover:text-orange-400 transition 
                  ${menu?.length == s_i + 1 && section?.children?.length == 0 ? "" : "border-b border-[#5B626B] pb-1"}`}
                  onClick={onClose}
                >
                  {section.title}
                </Link>
                {section?.children && (
                  <div className="space-y-3">
                    {section?.children?.map((child, i) => (
                      <Link
                        key={child.id}
                        href={`/projects/${section?.url}/${child.url}`}
                        className={`block 
                        ${menu?.length == s_i + 1 && section?.children?.length == i + 1 ? "" : "border-b border-[#5B626B]"} 
                        ${section.children?.length == i + 1 ? "pb-6" : "pb-1"} 
                        text-[22px] font-extralight uppercase hover:text-white transition`}
                        onClick={onClose}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Home button */}
          <div className="flex justify-center mt-10">
            <Link href="/" onClick={onClose}>
              <Image src={home_icon} alt="close" width={28} height={28} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
