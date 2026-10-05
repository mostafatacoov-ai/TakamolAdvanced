import "server-only";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/* Where the database and uploaded files live. In production it defaults to
   a folder in the hosting account's home directory, outside the app, so
   redeploying the site from Git never touches it. */
export const DATA_DIR = path.resolve(
  process.env.DATA_DIR ||
    (process.env.NODE_ENV === "production"
      ? path.join(os.homedir(), "takamol-data")
      : path.join(process.cwd(), ".data")),
);

export const DB_FILE = path.join(DATA_DIR, "takamol.db");

export const DIRS = {
  /** images uploaded to the media library */
  media: path.join(DATA_DIR, "uploads", "media"),
  /** replacements for images under public/assets (same relative paths) */
  assets: path.join(DATA_DIR, "uploads", "assets"),
  /** applicants' CV files (never publicly served) */
  cvs: path.join(DATA_DIR, "uploads", "cvs"),
  /** files attached to quotation briefs (served only behind the brief's link) */
  quotations: path.join(DATA_DIR, "uploads", "quotations"),
};

export const PUBLIC_ASSETS = path.join(process.cwd(), "public", "assets");

export function ensureDataDirs() {
  for (const dir of Object.values(DIRS)) fs.mkdirSync(dir, { recursive: true });
}

/** `base/rel` as an absolute path, or null when `rel` escapes `base`. */
export function within(base: string, rel: string): string | null {
  const full = path.resolve(base, rel);
  return full.startsWith(base + path.sep) ? full : null;
}
