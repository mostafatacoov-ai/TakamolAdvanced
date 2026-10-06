import type { Localized } from "@/lib/site-types";

/* How the Texts screen groups the site's text sections (the top-level keys
   of messages/*.json). Sections missing here are listed under "Other". */
export const CONTENT_GROUPS: { key: string; label: Localized; sections: { ns: string; label: Localized }[] }[] = [
  {
    key: "site",
    label: { ar: "عام في الموقع", en: "Whole site" },
    sections: [
      { ns: "Footer", label: { ar: "تذييل الصفحة", en: "Footer" } },
      { ns: "Common", label: { ar: "كلمات عامة", en: "General words" } },
      { ns: "Meta", label: { ar: "عناوين الصفحات ووصفها (SEO)", en: "Page titles & descriptions (SEO)" } },
    ],
  },
  {
    key: "home",
    label: { ar: "الصفحة الرئيسية", en: "Home page" },
    sections: [
      { ns: "Hero", label: { ar: "الواجهة الرئيسية", en: "Hero" } },
      { ns: "InteractiveVision", label: { ar: "مشهد الرؤية التفاعلي", en: "Interactive vision scene" } },
      { ns: "Services", label: { ar: "قسم خدماتنا", en: "Services section" } },
      { ns: "OurProducts", label: { ar: "قسم منتجاتنا", en: "Products section" } },
      { ns: "Knowledge", label: { ar: "قسم مركز المعرفة", en: "Knowledge section" } },
      { ns: "Partners", label: { ar: "قسم الشركاء", en: "Partners section" } },
      { ns: "Participations", label: { ar: "قسم المشاركات", en: "Participations section" } },
      { ns: "Social", label: { ar: "قسم تعرّف أكثر", en: "Social media section" } },
    ],
  },
  {
    key: "about",
    label: { ar: "صفحة عن تكامل", en: "About page" },
    sections: [
      { ns: "AboutHero", label: { ar: "واجهة الصفحة", en: "Page hero" } },
      { ns: "Story", label: { ar: "من نحن", en: "Who we are" } },
      { ns: "VisionMission", label: { ar: "رؤيتنا ومهمتنا وقيمنا", en: "Vision, mission & values tabs" } },
      { ns: "Values", label: { ar: "بطاقات القيم", en: "Value cards" } },
      { ns: "WhyUs", label: { ar: "لماذا نحن مختلفون", en: "What makes us different" } },
    ],
  },
  {
    key: "services",
    label: { ar: "الخدمات", en: "Services" },
    sections: [
      { ns: "ServicesOverview", label: { ar: "مقدمة الخدمات والفقاعات", en: "Services intro & bubbles" } },
      { ns: "ServiceBlocks", label: { ar: "عناصر مشتركة", en: "Shared labels" } },
      { ns: "SvcInvest", label: { ar: "استشارات الاستثمار والتطوير العقاري", en: "Investment & development consulting" } },
      { ns: "SvcEng", label: { ar: "الاستشارات الهندسية", en: "Engineering consulting" } },
      { ns: "SvcIntegrated", label: { ar: "الاستشارات المتكاملة", en: "Integrated development consulting" } },
      { ns: "Marketing", label: { ar: "خدمات التسويق العقاري", en: "Real estate marketing" } },
      { ns: "Brokerage", label: { ar: "الوساطة العقارية الذكية", en: "Smart brokerage" } },
    ],
  },
  {
    key: "products",
    label: { ar: "المنتجات", en: "Products" },
    sections: [
      { ns: "ProductsOverview", label: { ar: "مقدمة المنتجات", en: "Products intro" } },
      { ns: "PlatformsPage", label: { ar: "صفحة منتجاتنا", en: "Products page" } },
      { ns: "Forsa", label: { ar: "ريل فرصة", en: "Real Forsa" } },
      { ns: "Invest", label: { ar: "ريل إنفست", en: "Real Invest" } },
      { ns: "PlatformShowcase", label: { ar: "معرض لقطات المنصة", en: "Platform screenshots" } },
    ],
  },
  {
    key: "join",
    label: { ar: "انضم إلينا", en: "Join us" },
    sections: [
      { ns: "JoinHero", label: { ar: "واجهة الصفحة", en: "Page hero" } },
      { ns: "Benefits", label: { ar: "المزايا", en: "Benefits" } },
      { ns: "Jobs", label: { ar: "قسم الوظائف", en: "Jobs section" } },
      { ns: "SubmitCV", label: { ar: "نموذج التقديم", en: "Application form" } },
    ],
  },
  {
    key: "sales",
    label: { ar: "المبيعات", en: "Sales" },
    sections: [{ ns: "Quotation", label: { ar: "نموذج عرض السعر", en: "Quotation brief" } }],
  },
  {
    key: "knowledge",
    label: { ar: "مركز المعرفة وصفحات أخرى", en: "Knowledge center & other pages" },
    sections: [
      { ns: "Reports", label: { ar: "تقارير السوق العقاري 2026", en: "Market reports 2026" } },
      { ns: "Pages", label: { ar: "المقالات والصفحات التفصيلية", en: "Articles & detail pages" } },
    ],
  },
];

export function sectionLabel(ns: string): Localized {
  for (const g of CONTENT_GROUPS) {
    const s = g.sections.find((x) => x.ns === ns);
    if (s) return s.label;
  }
  return { ar: ns, en: ns };
}
