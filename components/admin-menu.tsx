"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { clearStoredTokens } from "@/api/login";

const navItems = [
  { href: "/admin/dashboard", label: "Главная" },
  { href: "/admin/footer", label: "Подвал сайта" },
  { href: "/admin/projects", label: "Категории продуктов" },
  { href: "/admin/products", label: "Продукты" },
  { href: "/admin/about", label: "О нас" },
  { href: "/admin/services", label: "Наши услуги" },
  { href: "/admin/vacancies", label: "Вакансии" },
  { href: "/admin/academy", label: "Академия" },
  { href: "/admin/contacts", label: "Контакты" },
];

export function AdminMenu() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearStoredTokens();
    router.replace("/login");
  };

  return (
    <nav className="w-56 shrink-0 border-r border-[#3f444b] bg-[#2a2e33] flex flex-col">
      <div className="p-4 border-b border-[#3f444b]">
        <Link
          href="/admin/dashboard"
          className="block w-full focus:outline-none focus:ring-2 focus:ring-[#ff7d24] rounded-lg"
        >
          <Image
            src="/images/logos/logo.svg"
            alt="Админ-панель"
            width={140}
            height={40}
            className="h-10 w-auto object-contain"
          />
        </Link>
      </div>
      <ul className="p-2 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-[#ff7d24]/20 text-[#ff7d24]"
                    : "text-gray-400 hover:bg-[#3f444b] hover:text-gray-200"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="p-2 border-t border-[#3f444b]">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#3f444b] hover:text-gray-200 transition-colors text-left"
        >
          Выйти
        </button>
      </div>
    </nav>
  );
}
