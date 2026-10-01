import { defineRouting } from "next-intl/routing";

/* Kept apart from navigation.ts: the middleware imports only this, so it
   doesn't pull in the request config (and with it the database). */
export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "as-needed",
  // the site always opens in Arabic, whatever the browser's language or an
  // earlier visit chose; English is only served at /en
  localeDetection: false,
});
