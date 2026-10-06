import { getLocale, getTranslations } from "next-intl/server";
import Image from "@/components/SiteImage";
import { Link } from "@/navigation";
import { MARKET_REPORTS, reportMeta, type MarketReport } from "@/lib/reports";

/* The 2026 market reports: a featured card for the national report, then
   one card per region. Each offers its summary page and the PDF. */

export function DownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`shrink-0 fill-current ${className}`}>
      <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" />
    </svg>
  );
}

async function reportText() {
  const t = await getTranslations("Reports");
  const locale = await getLocale();
  const meta = (r: MarketReport) => reportMeta(r, t("pages"), locale);
  return { t, locale, meta };
}

export async function ReportCard({ report, featured = false }: { report: MarketReport; featured?: boolean }) {
  const { t, locale, meta } = await reportText();
  const item = `items.${report.key}` as const;
  const arrow = locale === "en" ? "rotate-180" : "";

  return (
    <article
      className={`group flex overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-teal/50 hover:shadow-[0_24px_60px_rgba(0,0,0,.35)] ${
        featured ? "flex-col lg:flex-row" : "flex-col"
      }`}
    >
      <Link
        href={`/knowledge/reports/${report.slug}`}
        className={`relative block aspect-[16/9] w-full shrink-0 overflow-hidden ${featured ? "lg:w-[56%]" : ""}`}
      >
        <Image
          src={report.cover}
          alt={t(`${item}.title`)}
          fill
          sizes={featured ? "(max-width: 1024px) 100vw, 700px" : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 320px"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className={`flex flex-1 flex-col text-start ${featured ? "p-6 md:p-9 lg:justify-center" : "p-5"}`}>
        <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-[12px] font-bold text-teal-cyan">
          <span className="h-1.5 w-1.5 rounded-full bg-teal" />
          {featured ? t("featured") : t(`${item}.region`)}
        </span>
        <h3 className={`font-bold leading-snug text-white ${featured ? "text-[22px] md:text-[30px]" : "text-[16.5px] md:text-[17.5px]"}`}>
          <Link href={`/knowledge/reports/${report.slug}`} className="hover:text-teal-cyan">
            {t(`${item}.title`)}
          </Link>
        </h3>
        <p className={`mt-2 font-light leading-relaxed text-steel ${featured ? "text-[15px] md:text-[17px]" : "text-[13.5px]"}`}>
          {t(`${item}.cardDesc`)}
        </p>
        <p className="mt-3 text-[12.5px] text-white/50">{meta(report)}</p>

        <div className={`mt-auto flex gap-2 pt-5 ${featured ? "flex-wrap" : ""}`}>
          <Link
            href={`/knowledge/reports/${report.slug}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-[12px] border border-teal/50 bg-teal/10 px-4 py-2.5 text-[14px] text-white transition-all hover:bg-teal hover:font-bold hover:text-navy"
          >
            {t("readSummary")}
            <span aria-hidden className={`text-[20px] leading-none ${arrow}`}>‹</span>
          </Link>
          <a
            href={report.pdf}
            download={report.fileName}
            aria-label={`${t("download")}: ${t(`${item}.title`)}`}
            className={`inline-flex items-center justify-center gap-2 rounded-[12px] bg-teal px-4 py-2.5 text-[14px] font-bold text-navy transition-all hover:bg-teal-cyan ${featured ? "flex-1" : ""}`}
          >
            <DownloadIcon />
            {featured ? t("download") : "PDF"}
          </a>
        </div>
      </div>
    </article>
  );
}

/** The whole set, as shown at the top of the Knowledge Center. */
export default async function ReportsSection() {
  const t = await getTranslations("Reports");
  const locale = await getLocale();
  const [national, ...regions] = MARKET_REPORTS;

  return (
    <section id="market-reports" className={`relative scroll-mt-28 py-10 md:py-14 ${locale === "en" ? "latin-digits" : ""}`}>
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-teal/[0.07] blur-[150px]" />
      <div className="container-tk relative">
        <div className="max-w-[820px]">
          <span className="mb-4 inline-block rounded-full border border-teal/40 bg-teal/15 px-4 py-1.5 text-[13px] font-bold text-teal-cyan">
            {t("badge")}
          </span>
          <h2 className="sec-title glow-title">{t("title")}</h2>
          <div className="glow-bar mt-4 h-[4px] w-24 rounded-full bg-teal" />
          <p className="mt-5 text-[15px] font-light leading-[1.9] text-steel md:text-[17px]">{t("subtitle")}</p>
        </div>

        <div className="mt-10">
          <ReportCard report={national} featured />
        </div>

        <h3 className="mb-5 mt-12 text-[18px] font-bold text-white md:text-[20px]">{t("regionsTitle")}</h3>
        <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {regions.map((r) => (
            <ReportCard key={r.slug} report={r} />
          ))}
        </div>
      </div>
    </section>
  );
}
