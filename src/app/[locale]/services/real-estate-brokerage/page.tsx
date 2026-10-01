import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { detailMetadata } from "@/components/DetailPage";
import ServicesOverview from "@/components/services/ServicesOverview";
import { FeatureHub, ResultBanner, ServiceIntro } from "@/components/services/blocks";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = detailMetadata("brokerage");

type Item = { title: string; desc: string };

export default function BrokeragePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  const t = useTranslations("Brokerage");

  return (
    <>
      <Header />
      <main className="min-h-screen pt-[100px]">
        <ServicesOverview active={4} />

        <ServiceIntro title={t("title")} tagline={t("tagline")} intro={t("intro")} />

        {/* our approach: hub with four cards around it */}
        <section className="relative py-12 md:py-16">
          <div className="absolute inset-x-0 top-1/2 h-full -translate-y-1/2 bg-gradient-to-b from-navy via-navy-deep to-navy" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />
          <div className="container-tk relative">
            <FeatureHub hub={t("hub")} items={t.raw("items") as Item[]} split="rows" />
          </div>
        </section>

        <ResultBanner image="/assets/services/brk-result.jpg" title={t("resultTitle")} text={t("resultText")} />
      </main>
      <Footer />
    </>
  );
}
