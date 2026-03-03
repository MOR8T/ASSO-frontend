"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredAccessToken } from "@/api/login";
import { AdminMenu } from "@/components/admin-menu";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname?.startsWith("/login")) return;
    const token = getStoredAccessToken();
    if (!token) {
      router.replace("/login");
    }
  }, [pathname, router]);

  const isLoginPage = pathname?.startsWith("/login");

  return (
    <div className="min-h-screen bg-[#31353b] flex">
      {!isLoginPage && <AdminMenu />}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
