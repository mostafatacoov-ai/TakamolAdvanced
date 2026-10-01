import "server-only";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { AssetOverrides } from "@/lib/assets";
import type { MediaItem } from "@/lib/site-types";
import { all, one, run } from "./db";
import { UserError } from "./errors";
import { DIRS, PUBLIC_ASSETS, within } from "./paths";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_FILE = /\.(png|jpe?g|webp|gif|svg)$/i;
const REPLACEABLE = /\.(png|jpe?g|webp)$/i;

type Format = "jpeg" | "png" | "webp";

/* Every upload is decoded and re-encoded: that proves it's a real image,
   strips camera metadata (e.g. GPS) and caps the size at 2560px. */
async function encode(file: File | null, format: Format | "auto") {
  if (!file || typeof file === "string" || file.size === 0) throw new UserError("err.imageInvalid");
  if (file.size > MAX_IMAGE_BYTES) throw new UserError("err.fileTooLarge");
  const input = Buffer.from(await file.arrayBuffer());
  let detected: string | undefined;
  try {
    detected = (await sharp(input).metadata()).format;
  } catch {
    throw new UserError("err.imageInvalid");
  }
  if (!detected || !["jpeg", "png", "webp", "gif", "avif", "heif", "tiff"].includes(detected)) {
    throw new UserError("err.imageInvalid");
  }
  const target: Format =
    format !== "auto" ? format : detected === "jpeg" || detected === "png" || detected === "webp" ? detected : "webp";
  let pipeline = sharp(input, { failOn: "error" })
    .rotate()
    .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true });
  pipeline =
    target === "png" ? pipeline.png({ compressionLevel: 9 })
    : target === "webp" ? pipeline.webp({ quality: 85 })
    : pipeline.jpeg({ quality: 85, mozjpeg: true });
  try {
    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    return { data, format: target, width: info.width, height: info.height };
  } catch {
    throw new UserError("err.imageInvalid");
  }
}

/* ---- the site's own images (public/assets) --------------------------- */

export function getAssetOverrides(): AssetOverrides {
  const map: AssetOverrides = {};
  for (const r of all<{ path: string; version: number }>("SELECT path, version FROM asset_overrides")) {
    map[r.path] = r.version;
  }
  return map;
}

export type SiteImage = { rel: string; folder: string; size: number; replaceable: boolean; version: number | null };

export function listSiteImages(): SiteImage[] {
  const overrides = getAssetOverrides();
  const found: SiteImage[] = [];
  const walk = (dir: string, rel: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path.join(dir, entry.name), childRel);
      else if (IMAGE_FILE.test(entry.name)) {
        found.push({
          rel: childRel,
          folder: rel.split("/")[0] ?? "",
          size: fs.statSync(path.join(dir, entry.name)).size,
          replaceable: REPLACEABLE.test(entry.name),
          version: overrides[childRel] ?? null,
        });
      }
    }
  };
  if (fs.existsSync(PUBLIC_ASSETS)) walk(PUBLIC_ASSETS, "");
  return found.sort((a, b) => a.rel.localeCompare(b.rel));
}

function originalAsset(rel: string) {
  const file = within(PUBLIC_ASSETS, rel);
  if (!file || !REPLACEABLE.test(rel) || !fs.existsSync(file)) throw new UserError("err.imageInvalid");
  return file;
}

/** Swap a site image; the replacement keeps the original's file format. */
export async function replaceSiteImage(rel: string, file: File | null, userId: number) {
  originalAsset(rel);
  const ext = path.extname(rel).toLowerCase();
  const { data } = await encode(file, ext === ".png" ? "png" : ext === ".webp" ? "webp" : "jpeg");
  const dest = within(DIRS.assets, rel)!;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, data);
  run(
    `INSERT INTO asset_overrides (path, version, updated_by) VALUES (?, ?, ?)
     ON CONFLICT(path) DO UPDATE SET version = excluded.version, updated_by = excluded.updated_by, updated_at = datetime('now')`,
    rel, Date.now(), userId,
  );
}

export function restoreSiteImage(rel: string) {
  originalAsset(rel);
  const dest = within(DIRS.assets, rel);
  if (dest && fs.existsSync(dest)) fs.unlinkSync(dest);
  run("DELETE FROM asset_overrides WHERE path = ?", rel);
}

export function countReplacedImages() {
  return one<{ n: number }>("SELECT COUNT(*) AS n FROM asset_overrides")?.n ?? 0;
}

/* ---- media library (new uploads) -------------------------------------- */

type MediaRow = {
  id: number; file: string; original_name: string; size: number;
  width: number | null; height: number | null; created_at: string;
};

const toItem = (r: MediaRow): MediaItem => ({
  id: r.id, url: `/media/u/${r.file}`, name: r.original_name, size: r.size,
  width: r.width, height: r.height, createdAt: r.created_at,
});

export function listMedia(): MediaItem[] {
  return all<MediaRow>("SELECT * FROM media ORDER BY id DESC").map(toItem);
}

export async function uploadMedia(file: File | null, userId: number): Promise<MediaItem> {
  const { data, format, width, height } = await encode(file, "auto");
  const ext = format === "jpeg" ? "jpg" : format;
  const name = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}.${ext}`;
  fs.writeFileSync(path.join(DIRS.media, name), data);
  const original = (file?.name || name).slice(0, 200);
  const { id } = run(
    "INSERT INTO media (file, original_name, mime, size, width, height, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
    name, original, `image/${format}`, data.length, width, height, userId,
  );
  return toItem(one<MediaRow>("SELECT * FROM media WHERE id = ?", id)!);
}

export function deleteMedia(id: number) {
  const row = one<MediaRow>("SELECT * FROM media WHERE id = ?", id);
  if (!row) return null;
  const file = within(DIRS.media, row.file);
  if (file && fs.existsSync(file)) fs.unlinkSync(file);
  run("DELETE FROM media WHERE id = ?", id);
  return row.original_name;
}
