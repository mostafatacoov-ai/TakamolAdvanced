/* The 2026 real-estate market reports in the Knowledge Center. Their texts
   (titles, summaries, key figures) live in messages/{ar,en}.json under
   Reports.items.<key> and are editable under Texts; the covers live under
   /assets/reports and can be replaced under Images. */

export type MarketReport = {
  /** address: /knowledge/reports/<slug> */
  slug: string;
  /** key under Reports.items in the message files */
  key: string;
  /** the PDF, served as-is from /public */
  pdf: string;
  /** the name the PDF is saved under when downloaded */
  fileName: string;
  cover: string;
  /** the report's contents slide, shown as a preview */
  contents: string;
  pages: number;
  bytes: number;
};

const report = (slug: string, key: string, fileName: string, pages: number, bytes: number): MarketReport => ({
  slug,
  key,
  pdf: `/reports/takamol-real-estate-report-${slug}-2026.pdf`,
  fileName,
  cover: `/assets/reports/${slug}.jpg`,
  contents: `/assets/reports/${slug}-contents.jpg`,
  pages,
  bytes,
});

/** In the order they appear on the page: the national report first. */
export const MARKET_REPORTS: MarketReport[] = [
  report("saudi-arabia", "saudiArabia", "تقرير السوق العقاري السعودي 2026 - تكامل المتقدمة.pdf", 66, 15_543_153),
  report("riyadh", "riyadh", "تقرير السوق العقاري - منطقة الرياض 2026 - تكامل المتقدمة.pdf", 64, 17_716_456),
  report("jeddah", "jeddah", "تقرير السوق العقاري - منطقة جدة 2026 - تكامل المتقدمة.pdf", 67, 15_006_597),
  report("makkah", "makkah", "تقرير السوق العقاري - مكة المكرمة 2026 - تكامل المتقدمة.pdf", 66, 14_850_726),
  report("madinah", "madinah", "تقرير السوق العقاري - المدينة المنورة 2026 - تكامل المتقدمة.pdf", 66, 13_989_787),
  report("eastern-province", "easternProvince", "تقرير السوق العقاري - المنطقة الشرقية 2026 - تكامل المتقدمة.pdf", 66, 16_836_077),
  report("dammam", "dammam", "تقرير السوق العقاري - الدمام 2026 - تكامل المتقدمة.pdf", 66, 15_238_951),
  report("qassim", "qassim", "تقرير السوق العقاري - منطقة القصيم 2026 - تكامل المتقدمة.pdf", 66, 16_428_374),
];

export const findReport = (slug: string) => MARKET_REPORTS.find((r) => r.slug === slug) ?? null;

/** "15.5 MB" / "15.5 ميغابايت" */
export const formatSize = (bytes: number, locale: string) =>
  `${(bytes / 1_000_000).toFixed(1)} ${locale === "en" ? "MB" : "ميغابايت"}`;

/** "PDF · 66 pages · 15.5 MB". In Arabic "PDF" goes last: placed first, the
    Latin word would pull the page count into its left-to-right run. */
export const reportMeta = (r: MarketReport, pagesWord: string, locale: string) =>
  locale === "en"
    ? `PDF · ${r.pages} ${pagesWord} · ${formatSize(r.bytes, locale)}`
    : `${r.pages} ${pagesWord} · ${formatSize(r.bytes, locale)} · PDF`;
