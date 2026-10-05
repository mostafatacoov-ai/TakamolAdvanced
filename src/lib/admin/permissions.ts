import type { Localized } from "@/lib/site-types";

export const PERMISSIONS = [
  "content.edit",
  "media.manage",
  "pages.manage",
  "navigation.manage",
  "jobs.manage",
  "applications.view",
  "applications.manage",
  "quotations.view",
  "quotations.manage",
  "settings.manage",
  "users.manage",
  "roles.manage",
  "activity.view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_GROUPS: { key: "content" | "careers" | "sales" | "admin"; permissions: Permission[] }[] = [
  { key: "content", permissions: ["content.edit", "media.manage", "pages.manage", "navigation.manage"] },
  { key: "careers", permissions: ["jobs.manage", "applications.view", "applications.manage"] },
  { key: "sales", permissions: ["quotations.view", "quotations.manage"] },
  { key: "admin", permissions: ["settings.manage", "users.manage", "roles.manage", "activity.view"] },
];

/** The built-in role that always holds every permission. */
export const ADMIN_ROLE = "administrator";

export const DEFAULT_ROLES: { key: string; name: Localized; permissions: readonly Permission[]; locked: boolean }[] = [
  { key: ADMIN_ROLE, name: { ar: "مدير النظام", en: "Administrator" }, permissions: PERMISSIONS, locked: true },
  {
    key: "site_manager",
    name: { ar: "مدير الموقع", en: "Site manager" },
    permissions: PERMISSIONS.filter((p) => p !== "users.manage" && p !== "roles.manage"),
    locked: false,
  },
  {
    key: "content_manager",
    name: { ar: "مدير المحتوى", en: "Content manager" },
    permissions: ["content.edit", "media.manage", "pages.manage"],
    locked: false,
  },
];

export const isPermission = (value: string): value is Permission =>
  (PERMISSIONS as readonly string[]).includes(value);
