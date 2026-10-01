import type { SocialLink } from "./social";

export type Locale = "ar" | "en";
export type Localized = { ar: string; en: string };

export type NavItem = {
  id: string;
  label: Localized;
  href: string;
  external: boolean;
  visible: boolean;
};

export type Partner = { id: string; name: string; logo: string; url: string };

export type SiteSettings = {
  footerEmail: string;
  requestsEmail: string;
  phone: string;
  whatsapp: string;
  mapUrl: string;
  hours: string;
  /** footer icons, in display order */
  social: SocialLink[];
};

export type JobStatus = "open" | "closed";

export type Job = {
  id: number;
  title: Localized;
  location: Localized;
  type: Localized;
  description: Localized;
  image: string;
  status: JobStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type MediaItem = {
  id: number;
  url: string;
  name: string;
  size: number;
  width: number | null;
  height: number | null;
  createdAt: string;
};

/** The text for `locale`, falling back to the other language when empty. */
export const pick = (value: Localized, locale: string) =>
  locale === "en" ? value.en || value.ar : value.ar || value.en;
