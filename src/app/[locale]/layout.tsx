import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from "@/navigation";
import ScrollReveal from "@/components/ScrollReveal";
import "../globals.css";

type Params = { params: { locale: string } };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://takamoladvanced.sa";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: Params): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Meta" });
  const title = t("siteTitle");
  const description = t("siteDescription");
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | Takamol Advanced` },
    description,
    alternates: {
      canonical: locale === routing.defaultLocale ? "/" : `/${locale}`,
      languages: { ar: "/", en: "/en" },
    },
    openGraph: {
      type: "website",
      siteName: "Takamol Advanced",
      title,
      description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      images: [{ url: "/assets/about/hero.jpg", width: 1920, height: 1222 }],
    },
  };
}

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{ children: React.ReactNode } & Params>) {
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

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
