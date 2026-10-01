import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { detailMetadata } from "@/components/DetailPage";
import ServicesOverview from "@/components/services/ServicesOverview";
import { MethodStrip, ServiceIntro, SubService } from "@/components/services/blocks";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = detailMetadata("consulting");

const IMG = "/assets/services";

export default function IntegratedConsultingPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  const t = useTranslations("SvcIntegrated");

  return (
    <>
      <Header />
      <main className="min-h-screen pt-[100px]">
        <ServicesOverview active={2} />
        <ServiceIntro title={t("title")} tagline={t("tagline")} intro={t("intro")} />
        <MethodStrip items={t.raw("method") as string[]} />

        {/* تطوير استراتيجيات الاستثمار العقاري */}
        <SubService ns="SvcIntegrated" section="sections.0" resultImage={`${IMG}/int-strategy-result.jpg`} />
        {/* هيكلة الصفقات الاستثمارية وجذب رأس المال */}
        <SubService
          ns="SvcIntegrated"
          section="sections.1"
          photo={`${IMG}/int-deals.jpg`}
          sidePhoto={`${IMG}/int-deals-side.jpg`}
          resultImage={`${IMG}/int-deals-result.jpg`}
          band
        />
        {/* تطوير التصورات الأولية ودراسات الجدوى المعمارية */}
        <SubService
          ns="SvcIntegrated"
          section="sections.2"
          photo={`${IMG}/int-concepts.jpg`}
          sidePhoto={`${IMG}/int-concepts-side.jpg`}
          resultImage={`${IMG}/int-concepts-result.jpg`}
        />
      </main>
      <Footer />
    </>
  );
}
