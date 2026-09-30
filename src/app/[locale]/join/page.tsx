import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Benefits from "@/components/join/Benefits";
import Jobs from "@/components/join/Jobs";
import SubmitCV from "@/components/join/SubmitCV";

export const generateMetadata = pageMetadata("join");

function JoinHero() {
  const t = useTranslations("JoinHero");
  const tc = useTranslations("Common");
  const locale = useLocale();
  return (
    <section className="relative min-h-[440px] md:min-h-[520px] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/assets/about-hero.png"
          alt=""
          fill
          priority
          className="object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-navy/[.94] via-navy/65 to-navy/35" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-navy to-transparent" />
      </div>

      <div className="container-tk relative flex min-h-[440px] md:min-h-[520px] flex-col justify-center pt-[90px]">
        <div className="max-w-[880px]">
          <p className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-5 py-1.5 text-[14px] font-light text-iceblue md:text-[16px] backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-teal" />
            {tc("home")} <span className="text-teal">{locale === "ar" ? "‹" : "›"}</span> {t("breadcrumb")}
          </p>
          <h1 className="glow-title text-[30px] font-bold leading-[1.25] text-white md:text-[40px] lg:text-[48px]">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-[720px] text-[15px] font-light leading-[1.9] text-white/90 md:text-[18px]">
            {t("description")}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function JoinPage() {
  return (
    <>
      <Header />
      <main>
        <JoinHero />
        <Benefits />
        <Jobs />
        <SubmitCV />
      </main>
      <Footer />
    </>
  );
}
