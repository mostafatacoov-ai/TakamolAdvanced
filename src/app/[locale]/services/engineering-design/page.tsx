import { use } from "react";
import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { detailMetadata } from "@/components/DetailPage";
import ServicesOverview from "@/components/services/ServicesOverview";
import { MethodStrip, ServiceIntro, SubService } from "@/components/services/blocks";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = detailMetadata("engineeringDesign");

const IMG = "/assets/services";

export default function EngineeringConsultingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("SvcEng");

  return (
    <>
      <Header />
      <main className="min-h-screen pt-[100px]">
        <ServicesOverview active={1} />
        <ServiceIntro title={t("title")} tagline={t("tagline")} intro={t("intro")} />
        <MethodStrip items={t.raw("method") as string[]} />

        {/* تطوير التصورات الأولية ودراسات الجدوى المعمارية */}
        <SubService ns="SvcEng" section="sections.0" resultImage={`${IMG}/eng-concepts-result.jpg`} />
        {/* التصاميم الهندسية والمعمارية المتكاملة */}
        <SubService
          ns="SvcEng"
          section="sections.1"
          photo={`${IMG}/eng-designs.jpg`}
          sidePhoto={`${IMG}/eng-bim.jpg`}
          resultImage={`${IMG}/eng-designs-result.jpg`}
          band
        />
        {/* التصميم الحضري وتخطيط المواقع */}
        <SubService
          ns="SvcEng"
          section="sections.2"
          photo={`${IMG}/eng-urban.jpg`}
          sidePhoto={`${IMG}/eng-urban-vision.jpg`}
          resultImage={`${IMG}/eng-urban-result.jpg`}
        />
        {/* التصميم الداخلي للمساحات */}
        <SubService ns="SvcEng" section="sections.3" hubLayout="below" resultImage={`${IMG}/eng-interior-result.jpg`} band />
        {/* حساب الكميات وتقدير التكاليف */}
        <SubService ns="SvcEng" section="sections.4" sidePhoto={`${IMG}/eng-cost.jpg`} resultImage={`${IMG}/eng-cost-result.jpg`} />
        {/* الدعم الفني والإشراف على المشاريع */}
        <SubService
          ns="SvcEng"
          section="sections.5"
          photo={`${IMG}/eng-support.jpg`}
          sidePhoto={`${IMG}/eng-quality.jpg`}
          resultImage={`${IMG}/eng-support-result.jpg`}
          band
        />
      </main>
      <Footer />
    </>
  );
}
