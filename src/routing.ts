import { defineRouting } from "next-intl/routing";

/* Kept apart from navigation.ts: the middleware imports only this, so it
   doesn't pull in the request config (and with it the database). */
export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "as-needed",
});
