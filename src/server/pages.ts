import "server-only";
import type { AdminKey } from "@/lib/admin/i18n";
import { sanitizeBlocks, type Block } from "@/lib/blocks";
import type { Localized } from "@/lib/site-types";
import { all, one, run, transaction } from "./db";
import { getNavigation, saveNavigation } from "./site";

export type PageStatus = "draft" | "published";

export type PageRecord = {
  id: number;
  slug: string;
  title: Localized;
  description: Localized;
  blocks: Block[];
  status: PageStatus;
  createdAt: string;
  updatedAt: string;
};

type Row = {
  id: number; slug: string; title_ar: string; title_en: string;
  description_ar: string; description_en: string; blocks: string;
  status: string; created_at: string; updated_at: string;
};

const toRecord = (r: Row): PageRecord => {
  let blocks: Block[] = [];
  try {
    blocks = sanitizeBlocks(JSON.parse(r.blocks));
  } catch {
    /* keep the page readable even if stored blocks are damaged */
  }
  return {
    id: r.id,
    slug: r.slug,
    title: { ar: r.title_ar, en: r.title_en },
    description: { ar: r.description_ar, en: r.description_en },
    blocks,
    status: r.status === "published" ? "published" : "draft",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
};

/* First path segments the site already uses (or that would shadow files). */
const RESERVED = new Set([
  "about", "services", "platforms", "knowledge", "partners", "join", "quotation-request", "admin", "api", "media",
  "en", "ar", "assets", "fonts", "_next", "favicon.ico", "robots.txt", "sitemap.xml", "icon.png", "apple-icon.png",
]);
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugError(slug: string, exceptId?: number): AdminKey | null {
  if (!slug) return "err.required";
  if (slug.length > 60 || !SLUG_PATTERN.test(slug)) return "err.slugInvalid";
  if (RESERVED.has(slug)) return "err.slugReserved";
  const taken = one<{ id: number }>("SELECT id FROM pages WHERE slug = ?", slug);
  if (taken && taken.id !== exceptId) return "err.slugTaken";
  return null;
}

export const listPages = () => all<Row>("SELECT * FROM pages ORDER BY updated_at DESC").map(toRecord);

export function getPage(id: number) {
  const row = one<Row>("SELECT * FROM pages WHERE id = ?", id);
  return row ? toRecord(row) : null;
}

export function getPublishedPage(slug: string) {
  const row = one<Row>("SELECT * FROM pages WHERE slug = ? AND status = 'published'", slug);
  return row ? toRecord(row) : null;
}

export const publishedSlugs = () =>
  all<{ slug: string }>("SELECT slug FROM pages WHERE status = 'published'").map((r) => r.slug);

export function countPages() {
  return one<{ n: number }>("SELECT COUNT(*) AS n FROM pages")?.n ?? 0;
}

export function createPage(slug: string, title: Localized, userId: number) {
  return run(
    "INSERT INTO pages (slug, title_ar, title_en, updated_by) VALUES (?, ?, ?, ?)",
    slug, title.ar, title.en, userId,
  ).id;
}

/** Saves a page; menu tabs that pointed at its old address follow the new one. */
export function updatePage(
  id: number,
  data: { slug: string; title: Localized; description: Localized; blocks: Block[]; status: PageStatus },
  userId: number,
) {
  const before = getPage(id);
  if (!before) return;
  transaction(() => {
    run(
      `UPDATE pages SET slug = ?, title_ar = ?, title_en = ?, description_ar = ?, description_en = ?,
         blocks = ?, status = ?, updated_by = ?, updated_at = datetime('now') WHERE id = ?`,
      data.slug, data.title.ar, data.title.en, data.description.ar, data.description.en,
      JSON.stringify(data.blocks), data.status, userId, id,
    );
    if (before.slug !== data.slug) {
      saveNavigation(getNavigation().map((n) => (n.href === `/${before.slug}` ? { ...n, href: `/${data.slug}` } : n)));
    }
  });
}

/** Deletes a page and any menu tab that linked to it. */
export function deletePage(id: number) {
  const page = getPage(id);
  if (!page) return null;
  transaction(() => {
    run("DELETE FROM pages WHERE id = ?", id);
    saveNavigation(getNavigation().filter((n) => n.href !== `/${page.slug}`));
  });
  return page;
}
