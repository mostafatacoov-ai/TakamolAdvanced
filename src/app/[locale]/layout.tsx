import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from "@/navigation";
import ScrollReveal from "@/components/ScrollReveal";
import "../globals.css";

type Params = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Params): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("siteTitle"),
    description: t("siteDescription"),
  };
}

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{ children: React.ReactNode } & Params>) {
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <ScrollReveal />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
