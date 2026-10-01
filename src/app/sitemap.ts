import type { MetadataRoute } from "next";
import { routing } from "@/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://takamoladvanced.sa";

// Every public route; the locale prefix follows the "as-needed" routing
// (Arabic at the root, English under /en).
const ROUTES = [
  "/",
  "/about",
  "/services",
  "/services/investment-portfolio",
  "/services/engineering-design",
  "/services/consulting",
  "/services/digital-marketing",
  "/services/real-estate-brokerage",
  "/platforms",
  "/platforms/real-fursa",
  "/platforms/real-invest",
  "/knowledge",
  "/knowledge/proptech-revolution",
  "/knowledge/mega-projects-impact",
  "/knowledge/promising-saudi-cities",
  "/knowledge/takamol-real-estate-index",
  "/partners",
  "/join",
];

const href = (locale: string, route: string) => {
  const path = locale === routing.defaultLocale ? route : `/${locale}${route === "/" ? "" : route}`;
  return `${SITE_URL}${path === "/" ? "" : path}` || SITE_URL;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((route) => ({
    url: href(routing.defaultLocale, route),
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.split("/").length > 2 ? 0.7 : 0.8,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, href(l, route)])),
    },
  }));
}
