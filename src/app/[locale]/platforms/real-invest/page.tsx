import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { detailMetadata } from "@/components/DetailPage";
import { CONSULTANT_WHATSAPP, mailto } from "@/lib/contact";
import ProductsOverview from "@/components/products/ProductsOverview";
import ProductCta from "@/components/products/ProductCta";
import StageStrip from "@/components/products/StageStrip";
import PlatformGallery from "@/components/home/Platforms";
import { FeatureHub, MethodStrip, ServiceIntro, SubService } from "@/components/services/blocks";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = detailMetadata("realInvest");

type Item = { title: string; desc: string };
const IMG = "/assets/products";

export default function RealInvestPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  const t = useTranslations("Invest");

  return (
    <>
      <Header />
      <main className="min-h-screen pt-[100px]">
        <ProductsOverview active={1} />

        <ServiceIntro title={t("title")} tagline={t("tagline")} intro={t("intro")} />
        <MethodStrip items={t.raw("steps") as string[]} />

        {/* من الأرض إلى المشروع */}
        <StageStrip
          title={t("stagesTitle")}
          items={t.raw("stages") as Item[]}
          images={[`${IMG}/invest-land.jpg`, `${IMG}/invest-build.jpg`, `${IMG}/invest-tower.jpg`]}
        />

        {/* 1 ─ اختيار الأرض وتحليل القطعة */}
        <SubService ns="Invest" section="land" photo={`${IMG}/invest-step-1.jpg`} sidePhoto={`${IMG}/invest-step-2.jpg`} band />

        {/* 2 ─ مؤشرات السوق وأفضل استخدام */}
        <SubService ns="Invest" section="market" photo={`${IMG}/invest-step-3.jpg`} sidePhoto={`${IMG}/invest-step-4.jpg`} split="rows" />

        {/* 3 ─ تقييم القوة والمخاطر */}
        <SubService ns="Invest" section="risk" photo={`${IMG}/invest-step-5.jpg`} hubLayout="below" band />

        {/* 4 ─ الدراسة الكاملة والمخرجات */}
        <SubService ns="Invest" section="study" photo={`${IMG}/invest-step-7.jpg`} sidePhoto={`${IMG}/invest-step-8.jpg`} resultImage={`${IMG}/invest-tower.jpg`} />

        {/* لقطات من المحرك */}
        <PlatformGallery />

        {/* المخرجات */}
        <section className="relative py-14 md:py-20">
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />
          <div className="container-tk relative">
            <FeatureHub hub={t("outputs.title")} items={t.raw("outputs.items") as Item[]} layout="below" />
          </div>
        </section>

        <ProductCta
          title={t("cta.title")}
          text={t("cta.text")}
          primary={{ label: t("cta.primary"), href: mailto(t("cta.mailSubject"), t("cta.mailBody")) }}
          buttons={[{ label: t("cta.secondary"), href: CONSULTANT_WHATSAPP }]}
        />
      </main>
      <Footer />
    </>
  );
}
