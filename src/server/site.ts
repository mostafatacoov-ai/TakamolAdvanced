import "server-only";
import { DEFAULT_NAV, DEFAULT_PARTNERS, DEFAULT_SETTINGS } from "@/lib/site-defaults";
import { isSocialNetwork, type SocialLink } from "@/lib/social";
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

/* Settings saved before social links became a list stored them as
   { linkedin, instagram, x, facebook }; read those as the list. */
function legacySocial(old: Record<string, string>): SocialLink[] {
  return (["linkedin", "instagram", "x", "facebook"] as const)
    .filter((network) => old[network])
    .map((network) => ({ id: network, network, url: old[network], label: "", icon: "" }));
}

export function getSiteSettings(): SiteSettings {
  const { socials, ...stored } = read<Partial<SiteSettings> & { socials?: Record<string, string> }>("site", {});
  const social = Array.isArray(stored.social)
    ? stored.social.filter((s) => isSocialNetwork(s?.network) && typeof s.url === "string")
    : socials
      ? legacySocial(socials)
      : DEFAULT_SETTINGS.social;
  return { ...DEFAULT_SETTINGS, ...stored, social };
}

export const saveSiteSettings = (settings: SiteSettings) => write("site", settings);

export const getNavigation = (): NavItem[] => read("navigation", DEFAULT_NAV);
export const saveNavigation = (items: NavItem[]) => write("navigation", items);

export const getPartners = (): Partner[] => read("partners", DEFAULT_PARTNERS);
export const savePartners = (items: Partner[]) => write("partners", items);
