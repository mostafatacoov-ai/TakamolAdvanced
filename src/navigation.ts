import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "as-needed",
});

// Locale-aware replacements for next/link and next/navigation: hrefs are
// written without a locale ("/about") and get the current one added, and
// usePathname returns the path without the locale prefix.
export const { Link, usePathname, useRouter, redirect, getPathname } =
  createNavigation(routing);
