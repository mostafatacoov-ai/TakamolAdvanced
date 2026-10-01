import "server-only";
import { randomBytes } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { DEFAULT_ROLES } from "@/lib/admin/permissions";
import { DEFAULT_NAV, DEFAULT_PARTNERS, DEFAULT_SETTINGS, SEED_JOBS } from "@/lib/site-defaults";

/* First-run data: runs once, inside the first schema migration. */
export function seed(db: DatabaseSync) {
  const role = db.prepare("INSERT INTO roles (key, name_ar, name_en, permissions, locked) VALUES (?, ?, ?, ?, ?)");
  for (const r of DEFAULT_ROLES) {
    role.run(r.key, r.name.ar, r.name.en, JSON.stringify(r.permissions), r.locked ? 1 : 0);
  }

  const setting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
  setting.run("site", JSON.stringify(DEFAULT_SETTINGS));
  setting.run("navigation", JSON.stringify(DEFAULT_NAV));
  setting.run("partners", JSON.stringify(DEFAULT_PARTNERS));

  const job = db.prepare(
    "INSERT INTO jobs (title_ar, title_en, description_ar, description_en, image, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
  );
  SEED_JOBS.forEach((j, i) => job.run(j.title.ar, j.title.en, j.description.ar, j.description.en, j.image, i));

  const meta = db.prepare("INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING");
  meta.run("content_version", "1");
  meta.run("ip_salt", randomBytes(16).toString("hex"));
}
