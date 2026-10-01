import { use } from "react";
import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { detailMetadata } from "@/components/DetailPage";
import { mailtoHref, whatsappHref } from "@/lib/links";
import { getSiteSettings } from "@/server/site";
import ProductsOverview from "@/components/products/ProductsOverview";
import ProductCta from "@/components/products/ProductCta";
import { FeatureHub, MethodStrip, ServiceIntro, SubService } from "@/components/services/blocks";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = detailMetadata("realFursa");

type Item = { title: string; desc: string };
const IMG = "/assets/products";

export default function RealForsaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("Forsa");
  const settings = getSiteSettings();

  return (
    <>
      <Header />
      <main className="min-h-screen pt-[100px]">
        <ProductsOverview active={0} />

        <ServiceIntro title={t("title")} tagline={t("tagline")} intro={t("intro")} />
        <MethodStrip items={t.raw("steps") as string[]} />

        {/* 1 ─ خريطة الفرص الاستثمارية */}
        <SubService ns="Forsa" section="map" photo={`${IMG}/forsa-map.jpg`} band />

        {/* 2 ─ لوحة تحليلات السوق */}
        <SubService ns="Forsa" section="analytics" photo={`${IMG}/forsa-analytics.jpg`} sidePhoto={`${IMG}/forsa-market.jpg`} split="rows" />

        {/* 3 ─ تقييم العقار */}
        <SubService ns="Forsa" section="assess" photo={`${IMG}/forsa-assess.jpg`} hubLayout="below" band />

        {/* 4 ─ لوحة المشروع والجدوى */}
        <SubService ns="Forsa" section="project" photo={`${IMG}/forsa-project.jpg`} />

        {/* 5 ─ تقارير المحافظ */}
        <SubService ns="Forsa" section="reports" hubLayout="below" resultImage={`${IMG}/forsa-report.jpg`} band />

        {/* لماذا ريل فرصة */}
        <section className="relative py-14 md:py-20">
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />
          <div className="container-tk relative">
            <FeatureHub hub={t("why.title")} items={t.raw("why.items") as Item[]} />
          </div>
        </section>

        <ProductCta
          title={t("cta.title")}
          text={t("cta.text")}
          primary={{ label: t("cta.primary"), href: mailtoHref(settings.requestsEmail, t("cta.mailSubject"), t("cta.mailBody")) }}
          buttons={[{ label: t("cta.secondary"), href: whatsappHref(settings.whatsapp) }]}
        />
      </main>
      <Footer />
    </>
  );
}
