import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { DownloadIcon, ReportCard } from "@/components/knowledge/ReportCards";
import Image from "@/components/SiteImage";
import { Link } from "@/navigation";
import { editionFor, findReport, MARKET_REPORTS, reportMeta } from "@/lib/reports";

/* One 2026 market report: its summary (key figures and the report's themes)
   with the full PDF to download. */

type Props = { params: Promise<{ locale: string; slug: string }> };

const bold = { b: (chunks: ReactNode) => <strong className="font-bold text-white">{chunks}</strong> };

export function generateStaticParams() {
  return MARKET_REPORTS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const report = findReport(slug);
  if (!report) return {};
  const t = await getTranslations({ locale, namespace: `Reports.items.${report.key}` });
  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: { images: [{ url: editionFor(report, locale).cover, width: 1440, height: 810 }] },
  };
}

export default async function ReportPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const report = findReport(slug);
  if (!report) notFound();

  const t = await getTranslations("Reports");
  const tc = await getTranslations("Common");
  const tk = await getTranslations("Knowledge");
  const item = `items.${report.key}`;
  const figures = t.raw(`${item}.figures`) as { value: string; label: string }[];
  const sectionCount = (t.raw(`${item}.sections`) as unknown[]).length;
  const edition = editionFor(report, locale);
  const meta = reportMeta(edition, t("pages"), locale);
  const others = MARKET_REPORTS.filter((r) => r.slug !== report.slug);
  const chevron = locale === "ar" ? "‹" : "›";

  const downloadButton = (big = false) => (
    <a
      href={edition.pdf}
      download={edition.fileName}
      className={`inline-flex items-center justify-center gap-2.5 rounded-[16px] bg-teal font-bold text-navy transition-all hover:bg-teal-cyan hover:shadow-[0_0_30px_rgba(0,180,172,.4)] ${
        big ? "px-9 py-4 text-[17px]" : "px-7 py-3.5 text-[16px]"
      }`}
    >
      <DownloadIcon className="h-5 w-5" />
      {t("download")}
    </a>
  );

  return (
    <>
      <Header />
      <main className={`relative min-h-screen pb-10 pt-[110px] ${locale === "en" ? "latin-digits" : ""}`}>
        <div className="pointer-events-none absolute left-1/2 top-32 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-teal/[0.08] blur-[150px]" />

        {/* hero */}
        <section className="container-tk relative pt-6">
          <p className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-1.5 text-[13.5px] font-light text-iceblue backdrop-blur-sm">
            <Link href="/" className="hover:text-teal">{tc("home")}</Link>
            <span className="text-teal">{chevron}</span>
            <Link href="/knowledge" className="hover:text-teal">{tk("title")}</Link>
            <span className="text-teal">{chevron}</span>
            <span>{t(`${item}.region`)}</span>
          </p>

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[24px] border border-white/10 shadow-[0_24px_60px_rgba(0,10,20,.5)] lg:order-2">
              <Image src={edition.cover} alt={t(`${item}.title`)} fill priority sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
            </div>
            <div className="text-start lg:order-1">
              <span className="mb-4 inline-block rounded-full border border-teal/40 bg-teal/15 px-4 py-1.5 text-[13px] font-bold text-teal-cyan">
                {t("badge")}
              </span>
              <h1 className="glow-title text-[28px] font-bold leading-[1.3] text-white md:text-[40px]">{t(`${item}.title`)}</h1>
              <p className="mt-3 text-[17px] font-bold leading-relaxed text-teal md:text-[20px]">{t(`${item}.subtitle`)}</p>
              <p className="mt-4 text-[15px] font-light leading-[1.9] text-white/85 md:text-[16.5px]">{t.rich(`${item}.intro`, bold)}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {downloadButton()}
                <a href="#contents" className="inline-flex items-center gap-2 rounded-[16px] border border-white/25 px-6 py-3.5 text-[15px] font-bold text-white transition hover:border-teal hover:text-teal">
                  {t("contentsTitle")}
                </a>
              </div>
              <p className="mt-3 text-[13px] text-white/55">{meta}</p>
            </div>
          </div>
        </section>

        {/* key figures */}
        {figures.length > 0 && (
          <section className="container-tk relative mt-14 md:mt-20">
            <h2 className="mb-6 flex items-center gap-3 text-[22px] font-bold text-white md:text-[26px]">
              <span aria-hidden className="glow-bar h-7 w-1 rounded-full bg-teal" />
              {t("keyFigures")}
            </h2>
            <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {figures.map((_, i) => (
                <div key={i} className="rounded-[20px] border border-white/10 bg-white/[0.04] p-5 md:p-6">
                  <p className="text-[26px] font-bold leading-tight text-teal-cyan md:text-[30px]" dir="auto">{t(`${item}.figures.${i}.value`)}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-iceblue md:text-[15px]">{t(`${item}.figures.${i}.label`)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* the report's themes */}
        <section id="contents" className="container-tk relative mt-14 scroll-mt-28 md:mt-20">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md md:p-12">
            <h2 className="mb-2 flex items-center gap-3 text-[22px] font-bold text-white md:text-[26px]">
              <span aria-hidden className="glow-bar h-7 w-1 rounded-full bg-teal" />
              {t("contentsTitle")}
            </h2>
            <p className="mb-8 text-[14.5px] font-light text-steel">{t("contentsHint")}</p>

            <div className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-2">
              {Array.from({ length: sectionCount }, (_, i) => (
                <article key={i} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-teal/50 bg-teal/10 font-exo text-[15px] font-bold text-teal-cyan">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-bold leading-snug text-white md:text-[18.5px]">{t(`${item}.sections.${i}.heading`)}</h3>
                    <p className="mt-2 text-[14.5px] leading-[1.9] text-steel md:text-[15px]">{t.rich(`${item}.sections.${i}.body`, bold)}</p>
                  </div>
                </article>
              ))}
            </div>

            <figure className="mt-12">
              <a href={edition.contents} target="_blank" rel="noopener noreferrer" className="relative block aspect-[16/9] overflow-hidden rounded-[18px] border border-white/10">
                <Image src={edition.contents} alt={t("contentsPreview")} fill sizes="(max-width: 1272px) 100vw, 1100px" className="object-cover" />
              </a>
              <figcaption className="mt-3 text-center text-[13px] text-white/55">{t("contentsPreview")}</figcaption>
            </figure>
          </div>
        </section>

        {/* download */}
        <section className="container-tk relative mt-14 md:mt-20">
          <div className="flex flex-col items-center gap-8 rounded-[28px] border border-teal/30 bg-gradient-to-br from-[#0c3140] to-[#0f4a56] p-6 md:flex-row md:p-10">
            <div className="relative aspect-[16/9] w-full max-w-[340px] shrink-0 overflow-hidden rounded-[16px] shadow-[0_18px_40px_rgba(0,10,20,.45)]">
              <Image src={edition.cover} alt="" fill sizes="340px" className="object-cover" />
            </div>
            <div className="text-center md:text-start">
              <h2 className="text-[22px] font-bold text-white md:text-[26px]">{t("ctaTitle")}</h2>
              <p className="mt-3 text-[15px] font-light leading-[1.9] text-white/85">{t("ctaText")}</p>
              <div className="mt-6 flex flex-col items-center gap-2 md:items-start">
                {downloadButton(true)}
                <span className="text-[13px] text-white/60">{meta}</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-[12.5px] font-light text-white/50">{t("sourceNote")}</p>
        </section>

        {/* the other reports */}
        <section className="container-tk relative mt-16 md:mt-24">
          <h2 className="mb-6 flex items-center gap-3 text-[22px] font-bold text-white md:text-[26px]">
            <span aria-hidden className="glow-bar h-7 w-1 rounded-full bg-teal" />
            {t("otherReports")}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {others.map((r) => <ReportCard key={r.slug} report={r} />)}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
