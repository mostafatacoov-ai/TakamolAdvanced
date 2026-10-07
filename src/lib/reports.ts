/* The 2026 real-estate market reports in the Knowledge Center. Their texts
   (titles, summaries, key figures) live in messages/{ar,en}.json under
   Reports.items.<key> and are editable under Texts; the covers live under
   /assets/reports and can be replaced under Images. Each report has an
   Arabic and an English edition: the Arabic site offers the Arabic PDF, the
   English site the English one. */

export type ReportEdition = {
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

export type MarketReport = {
  /** address: /knowledge/reports/<slug> */
  slug: string;
  /** key under Reports.items in the message files */
  key: string;
  editions: { ar: ReportEdition; en: ReportEdition };
};

const report = (
  slug: string,
  key: string,
  ar: { fileName: string; pages: number; bytes: number },
  en: { fileName: string; pages: number; bytes: number },
): MarketReport => ({
  slug,
  key,
  editions: {
    ar: {
      ...ar,
      pdf: `/reports/takamol-real-estate-report-${slug}-2026.pdf`,
      cover: `/assets/reports/${slug}.jpg`,
      contents: `/assets/reports/${slug}-contents.jpg`,
    },
    en: {
      ...en,
      pdf: `/reports/takamol-real-estate-report-${slug}-2026-en.pdf`,
      cover: `/assets/reports/${slug}-en.jpg`,
      contents: `/assets/reports/${slug}-en-contents.jpg`,
    },
  },
});

/** In the order they appear on the page: the national report first. */
export const MARKET_REPORTS: MarketReport[] = [
  report(
    "saudi-arabia", "saudiArabia",
    { fileName: "تقرير السوق العقاري السعودي 2026 - تكامل المتقدمة.pdf", pages: 66, bytes: 15_543_153 },
    { fileName: "Saudi Real Estate Market Report 2026 - Takamol Advanced.pdf", pages: 66, bytes: 14_956_279 },
  ),
  report(
    "riyadh", "riyadh",
    { fileName: "تقرير السوق العقاري - منطقة الرياض 2026 - تكامل المتقدمة.pdf", pages: 64, bytes: 17_716_456 },
    { fileName: "Real Estate Market Report - Riyadh Region 2026 - Takamol Advanced.pdf", pages: 64, bytes: 18_374_573 },
  ),
  report(
    "jeddah", "jeddah",
    { fileName: "تقرير السوق العقاري - منطقة جدة 2026 - تكامل المتقدمة.pdf", pages: 67, bytes: 15_006_597 },
    { fileName: "Real Estate Market Report - Jeddah 2026 - Takamol Advanced.pdf", pages: 67, bytes: 14_527_830 },
  ),
  report(
    "makkah", "makkah",
    { fileName: "تقرير السوق العقاري - مكة المكرمة 2026 - تكامل المتقدمة.pdf", pages: 66, bytes: 14_850_726 },
    { fileName: "Real Estate Market Report - Makkah 2026 - Takamol Advanced.pdf", pages: 66, bytes: 14_365_887 },
  ),
  report(
    "madinah", "madinah",
    { fileName: "تقرير السوق العقاري - المدينة المنورة 2026 - تكامل المتقدمة.pdf", pages: 66, bytes: 13_989_787 },
    { fileName: "Real Estate Market Report - Madinah 2026 - Takamol Advanced.pdf", pages: 66, bytes: 13_452_388 },
  ),
  report(
    "eastern-province", "easternProvince",
    { fileName: "تقرير السوق العقاري - المنطقة الشرقية 2026 - تكامل المتقدمة.pdf", pages: 66, bytes: 16_836_077 },
    { fileName: "Real Estate Market Report - Eastern Province 2026 - Takamol Advanced.pdf", pages: 66, bytes: 16_278_014 },
  ),
  report(
    "dammam", "dammam",
    { fileName: "تقرير السوق العقاري - الدمام 2026 - تكامل المتقدمة.pdf", pages: 66, bytes: 15_238_951 },
    { fileName: "Real Estate Market Report - Dammam 2026 - Takamol Advanced.pdf", pages: 66, bytes: 14_680_517 },
  ),
  report(
    "qassim", "qassim",
    { fileName: "تقرير السوق العقاري - منطقة القصيم 2026 - تكامل المتقدمة.pdf", pages: 66, bytes: 16_428_374 },
    { fileName: "Real Estate Market Report - Al-Qassim 2026 - Takamol Advanced.pdf", pages: 66, bytes: 15_930_261 },
  ),
];

export const findReport = (slug: string) => MARKET_REPORTS.find((r) => r.slug === slug) ?? null;

/** The edition for the page's language. */
export const editionFor = (r: MarketReport, locale: string): ReportEdition => (locale === "en" ? r.editions.en : r.editions.ar);

/** "15.5 MB" / "15.5 ميغابايت" */
export const formatSize = (bytes: number, locale: string) =>
  `${(bytes / 1_000_000).toFixed(1)} ${locale === "en" ? "MB" : "ميغابايت"}`;

/** "PDF · 66 pages · 15.5 MB". In Arabic "PDF" goes last: placed first, the
    Latin word would pull the page count into its left-to-right run. */
export const reportMeta = (e: ReportEdition, pagesWord: string, locale: string) =>
  locale === "en"
    ? `PDF · ${e.pages} ${pagesWord} · ${formatSize(e.bytes, locale)}`
    : `${e.pages} ${pagesWord} · ${formatSize(e.bytes, locale)} · PDF`;
