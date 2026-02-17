import type { Metadata } from "next";
import "@/app/global.css";
import Layout from "@/components/layout/Layout";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/dist/client/components/navigation";

export const metadata: Metadata = {
  title: "ASSO - Architects",
  description: "ASSO - Architects",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  // Ensure that the incoming `lang` is valid
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  return (
    <NextIntlClientProvider>
      <Layout>{children}</Layout>
    </NextIntlClientProvider>
  );
}
