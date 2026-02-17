import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import "@/app/global.css";

export const metadata: Metadata = {
  title: "ASSO - Architects",
  description: "ASSO - Architects",
  icons: {
    icon: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
