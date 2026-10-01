import "server-only";
import { DEFAULT_NAV, DEFAULT_PARTNERS, DEFAULT_SETTINGS } from "@/lib/site-defaults";
import type { NavItem, Partner, SiteSettings } from "@/lib/site-types";
import { one, run } from "./db";

/* Small structured settings, stored as JSON documents by key. */

function read<T>(key: string, fallback: T): T {
  const row = one<{ value: string }>("SELECT value FROM settings WHERE key = ?", key);
  if (!row) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  run(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    key, JSON.stringify(value),
  );
}

export function getSiteSettings(): SiteSettings {
  const stored = read<Partial<SiteSettings>>("site", {});
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    socials: { ...DEFAULT_SETTINGS.socials, ...(stored.socials ?? {}) },
  };
}

export const saveSiteSettings = (settings: SiteSettings) => write("site", settings);

export const getNavigation = (): NavItem[] => read("navigation", DEFAULT_NAV);
export const saveNavigation = (items: NavItem[]) => write("navigation", items);

export const getPartners = (): Partner[] => read("partners", DEFAULT_PARTNERS);
export const savePartners = (items: Partner[]) => write("partners", items);
