import { use } from "react";
import { useTranslations } from "next-intl";
import { pageMetadata } from "@/lib/metadata";
import { whatsappHref } from "@/lib/links";
import { getSiteSettings } from "@/server/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductsOverview from "@/components/products/ProductsOverview";
import ProductCta from "@/components/products/ProductCta";
import { BlockTitle, FeatureHub } from "@/components/services/blocks";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = pageMetadata("platforms", "platformsDesc");

type Item = { title: string; desc: string };

export default function PlatformsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("PlatformsPage");

  return (
    <>
      <Header />
      <main className="min-h-screen pt-[100px]">
        <ProductsOverview />

        {/* how the platform and the engine work together */}
        <section className="relative py-12 md:py-16">
          <div className="absolute inset-x-0 top-1/2 h-full -translate-y-1/2 bg-gradient-to-b from-navy via-navy-deep to-navy" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />
          <div className="container-tk relative">
            <BlockTitle>{t("ecosystem.title")}</BlockTitle>
            <p className="mb-12 max-w-[900px] text-[15px] leading-[2] text-iceblue md:text-[17px]">{t("ecosystem.desc")}</p>
            <FeatureHub hub={t("ecosystem.hub")} items={t.raw("ecosystem.items") as Item[]} />
          </div>
        </section>

        <ProductCta
          title={t("cta.title")}
          text={t("cta.text")}
          primary={{ label: t("cta.forsa"), href: "/platforms/real-fursa" }}
          buttons={[
            { label: t("cta.invest"), href: "/platforms/real-invest" },
            { label: t("cta.consultant"), href: whatsappHref(getSiteSettings().whatsapp) },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
