import { use } from "react";
import Image from "@/components/SiteImage";
import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { detailMetadata } from "@/components/DetailPage";
import ServicesOverview from "@/components/services/ServicesOverview";
import { BlockTitle, FeatureHub, ResultBanner, ServiceIntro, SubService } from "@/components/services/blocks";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = detailMetadata("digitalMarketing");

type Item = { title: string; desc: string };
const IMG = "/assets/services";

/* Circular arrow around each numbered step, as in the design. */
function StepRing({ n, label }: { n: number; label: string }) {
  return (
    <li className="group relative flex aspect-square w-full max-w-[200px] items-center justify-center">
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90 rtl:scale-y-[-1]">
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,180,172,.2)" strokeWidth="1" />
        <circle
          cx="50" cy="50" r="46" fill="none" stroke="#00B4AC" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="250 289" className="transition-[stroke-dasharray] duration-500 group-hover:[stroke-dasharray:289_289]"
        />
        <path d="M 96 50 l -5 -6 l 10 0 z" fill="#00B4AC" transform="rotate(-38 50 50)" />
      </svg>
      <span className="glow-pulse absolute -top-1 start-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-teal font-exo text-[14px] font-bold text-navy shadow-[0_0_18px_rgba(0,180,172,.6)] rtl:translate-x-1/2">
        {n}
      </span>
      <span className="relative mx-5 flex h-[76%] w-[76%] items-center justify-center rounded-full bg-gradient-to-br from-[#0b4155] to-[#052536] p-3 text-center text-[13px] font-bold leading-snug text-white md:text-[14.5px]">
        {label}
      </span>
    </li>
  );
}

export default function DigitalMarketingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("Marketing");
  const steps = t.raw("steps") as string[];

  return (
    <>
      <Header />
      <main className="min-h-screen pt-[100px]">
        <ServicesOverview active={3} />

        <ServiceIntro title={t("title")} tagline={t("tagline")} intro={t("intro")} />

        {/* the five marketing services */}
        <section className="relative pb-14 md:pb-20">
          <div className="container-tk relative">
            <span aria-hidden className="absolute inset-x-10 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-teal/40 to-transparent lg:block" />
            <ol className="stagger relative grid grid-cols-2 justify-items-center gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {steps.map((step, i) => (
                <StepRing key={i} n={i + 1} label={step} />
              ))}
            </ol>
          </div>
        </section>

        {/* 1 ─ التسويق الرقمي الشامل */}
        <SubService ns="Marketing" section="digital" split="rows" resultImage={`${IMG}/mkt-digital-result.jpg`} />

        {/* 2 ─ إنتاج المحتوى المرئي الإبداعي */}
        <SubService
          ns="Marketing"
          section="content"
          photo={`${IMG}/mkt-content.jpg`}
          sidePhoto={`${IMG}/mkt-content-side.jpg`}
          resultImage={`${IMG}/mkt-content-result.jpg`}
          band
        />

        {/* 3 ─ الجولات الافتراضية وتصميم النماذج ثلاثية الأبعاد */}
        <SubService
          ns="Marketing"
          section="vr"
          photo={`${IMG}/mkt-vr.jpg`}
          sidePhoto={`${IMG}/mkt-vr-side.jpg`}
          resultImage={`${IMG}/mkt-vr-result.jpg`}
        />

        {/* 4 ─ إدارة الحملات التسويقية المتكاملة */}
        <section className="relative py-12 md:py-16">
          <div className="absolute inset-x-0 top-1/2 h-full -translate-y-1/2 bg-gradient-to-b from-navy via-navy-deep to-navy" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />
          <div className="container-tk relative">
            <div className="mb-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <BlockTitle>{t("campaigns.title")}</BlockTitle>
                <p className="text-justify text-[15px] leading-[2.05] text-iceblue md:text-[17px]">{t("campaigns.desc")}</p>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-teal/30 shadow-[0_20px_50px_rgba(0,10,20,.45)]">
                <Image src="/assets/event-2.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
              </div>
            </div>
            <FeatureHub hub={t("campaigns.hub")} items={t.raw("campaigns.items") as Item[]} layout="below" />
          </div>
        </section>
        <ResultBanner title={t("campaigns.resultTitle")} text={t("campaigns.resultText")} />

        {/* 5 ─ تطوير العلامة التجارية العقارية والهوية البصرية */}
        <section className="relative py-12 md:py-16">
          <div className="container-tk relative">
            <BlockTitle>{t("brand.title")}</BlockTitle>
            <p className="max-w-[900px] text-[15px] leading-[2] text-iceblue md:text-[17px]">{t("brand.desc1")}</p>
            <p className="mb-12 mt-1 max-w-[900px] text-[15px] leading-[2] text-steel md:text-[17px]">{t("brand.desc2")}</p>
            <FeatureHub hub={t("brand.hub")} items={t.raw("brand.items") as Item[]} layout="below" />
          </div>
        </section>
        <ResultBanner title={t("brand.resultTitle")} text={t("brand.resultText")} />

        {/* لماذا تكامل المتقدمة */}
        <section className="relative py-14 md:py-20">
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />
          <div className="container-tk relative">
            <FeatureHub hub={t("why.title")} items={t.raw("why.items") as Item[]} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
