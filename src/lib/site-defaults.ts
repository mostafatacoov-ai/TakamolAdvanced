import type { Localized, NavItem, Partner, SiteSettings } from "./site-types";

/* What the site showed before the admin area existed. Seeded into the
   database on first run; after that the admin owns these values. */

export const DEFAULT_SETTINGS: SiteSettings = {
  footerEmail: "support@takamoladvanced.sa",
  requestsEmail: "info@takamoladvanced.sa",
  phone: "+966 50 894 4460",
  whatsapp: "966508944460",
  mapUrl: "https://maps.app.goo.gl/YJWS9uMKLYA21ZDb8",
  hours: "10:00 AM - 6:00 PM",
  socials: {
    linkedin:
      "https://www.linkedin.com/company/takamol-advanced-%D8%AA%D9%83%D8%A7%D9%85%D9%84-%D8%A7%D9%84%D9%85%D8%AA%D9%82%D8%AF%D9%85%D8%A9/",
    instagram: "https://www.instagram.com/takamoladvanced/",
    x: "https://x.com/TakamolAdvanced",
    facebook: "https://www.facebook.com/Takamoladvanced",
  },
};

/** Pages of the site that a menu tab or button can link to. */
export const BUILTIN_LINKS: { href: string; label: Localized }[] = [
  { href: "/", label: { ar: "الرئيسية", en: "Home" } },
  { href: "/about", label: { ar: "عن تكامل", en: "About Takamol" } },
  { href: "/services", label: { ar: "خدماتنا", en: "Our Services" } },
  { href: "/services/investment-portfolio", label: { ar: "استشارات الاستثمار والتطوير العقاري", en: "Investment & Development Consulting" } },
  { href: "/services/engineering-design", label: { ar: "الاستشارات الهندسية", en: "Engineering Consulting" } },
  { href: "/services/consulting", label: { ar: "الاستشارات المتكاملة للتطوير العقاري", en: "Integrated Development Consulting" } },
  { href: "/services/digital-marketing", label: { ar: "خدمات التسويق العقاري", en: "Real Estate Marketing" } },
  { href: "/services/real-estate-brokerage", label: { ar: "الوساطة العقارية الذكية", en: "Smart Real Estate Brokerage" } },
  { href: "/platforms", label: { ar: "منتجاتنا", en: "Our Products" } },
  { href: "/platforms/real-fursa", label: { ar: "ريل فرصة", en: "Real Forsa" } },
  { href: "/platforms/real-invest", label: { ar: "ريل إنفست", en: "Real Invest" } },
  { href: "/knowledge", label: { ar: "مركز المعرفة", en: "Knowledge Center" } },
  { href: "/partners", label: { ar: "شركاؤنا", en: "Our Partners" } },
  { href: "/join", label: { ar: "انضم إلينا", en: "Join Us" } },
];

export const DEFAULT_NAV: NavItem[] = [
  { id: "home", href: "/", label: { ar: "الرئيسية", en: "Home" } },
  { id: "about", href: "/about", label: { ar: "عن تكامل", en: "About Takamol" } },
  { id: "services", href: "/services", label: { ar: "خدماتنا", en: "Services" } },
  { id: "platforms", href: "/platforms", label: { ar: "منتجاتنا", en: "Platforms" } },
  { id: "knowledge", href: "/knowledge", label: { ar: "مركز المعرفة", en: "Knowledge Center" } },
  { id: "join", href: "/join", label: { ar: "انضم الآن", en: "Join Now" } },
].map((item) => ({ ...item, external: false, visible: true }));

export const DEFAULT_PARTNERS: Partner[] = [
  ...Array.from({ length: 11 }, (_, i) => String(i + 1).padStart(2, "0")),
  "rafal",
].map((file) => ({ id: `p-${file}`, name: "", logo: `/assets/partners/${file}.png`, url: "" }));

/* The four positions advertised on the Join page (from the job post art). */
export const SEED_JOBS: { title: Localized; description: Localized; image: string }[] = [
  {
    title: { ar: "مطوّر ذكاء اصطناعي", en: "AI Developer" },
    description: {
      ar: "فكّر بعمق، وبرمج بذكاء. إذا كان عقلك يشغّل الخوارزميات قبل القهوة، فنحن بحاجة إليك.",
      en: "Think deep. Code smart. If your brain runs algorithms before coffee, we need you.",
    },
    image: "/assets/job-card-1.png",
  },
  {
    title: { ar: "مدير دراسات الجدوى", en: "Feasibility Study Manager" },
    description: {
      ar: "البيانات بوصلتك، والرؤية ميزتك. إذا كنت تحوّل الأرقام إلى استراتيجيات، فهذا المكتب لك.",
      en: "Data is your compass. Insight is your edge. If you turn numbers into strategies, this desk is yours.",
    },
    image: "/assets/job-card-2.png",
  },
  {
    title: { ar: "مطوّر برمجيات متكامل (Full Stack)", en: "Full Stack Developer" },
    description: {
      ar: "تتحدث لغة الواجهات وتحلم بالخوادم. إذا كنت تبني المنطق والجمال معًا، فمكانك هنا.",
      en: "You speak front-end. You dream back-end. If you build both brains and beauty, your stack belongs here.",
    },
    image: "/assets/job-card-3.png",
  },
  {
    title: { ar: "مطوّر أودو (Odoo)", en: "Odoo Developer" },
    description: {
      ar: "أتمتة سير العمل والقضاء على الفوضى. إذا كان منطق الأعمال ساحتك، فنريدك في فريقنا.",
      en: "Automate workflows. Eliminate chaos. If business logic is your playground, we want you on the team.",
    },
    image: "/assets/job-card-4.png",
  },
];
