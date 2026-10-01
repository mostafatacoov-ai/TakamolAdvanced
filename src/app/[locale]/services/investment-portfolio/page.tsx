import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { detailMetadata } from "@/components/DetailPage";
import ServicesOverview from "@/components/services/ServicesOverview";
import { MethodStrip, ServiceIntro, SubService } from "@/components/services/blocks";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = detailMetadata("investmentPortfolio");

const IMG = "/assets/services";

export default function InvestmentConsultingPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  const t = useTranslations("SvcInvest");

  return (
    <>
      <Header />
      <main className="min-h-screen pt-[100px]">
        <ServicesOverview active={0} />
        <ServiceIntro title={t("title")} tagline={t("tagline")} intro={t("intro")} />
        <MethodStrip items={t.raw("method") as string[]} />

        {/* أبحاث السوق العقاري المعمّقة */}
        <SubService ns="SvcInvest" section="sections.0" resultImage={`${IMG}/inv-research-result.jpg`} />
        {/* دراسات الجدوى العقارية المتكاملة */}
        <SubService ns="SvcInvest" section="sections.1" split="rows" band />
        {/* التحليل المالي والاستثماري المتقدم */}
        <SubService ns="SvcInvest" section="sections.2" photo={`${IMG}/inv-financial.jpg`} hubLayout="column" />
        {/* التقييم العقاري */}
        <SubService ns="SvcInvest" section="sections.3" split="rows" band />
        {/* الاستشارات الذكية السريعة */}
        <SubService ns="SvcInvest" section="sections.4" photo={`${IMG}/inv-smart.jpg`} split="rows" />
        {/* تحضير الملف الاستثماري للمشاريع */}
        <SubService ns="SvcInvest" section="sections.5" hubLayout="below" resultImage={`${IMG}/inv-file-result.jpg`} band />
      </main>
      <Footer />
    </>
  );
}
