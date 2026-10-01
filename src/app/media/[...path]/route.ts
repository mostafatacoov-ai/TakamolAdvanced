import fs from "node:fs";
import path from "node:path";
import { DIRS, PUBLIC_ASSETS, within } from "@/server/paths";

/* Public image files that live outside /public:
     /media/u/{file}                 media library uploads
     /media/a/{version}/{asset path} a replaced site image (versioned URL)
   Both URLs never change content, so they can be cached for a year. */

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const notFound = () => new Response("Not found", { status: 404 });

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const [kind, ...rest] = (await params).path;
  let file: string | null = null;

  if (kind === "u" && rest.length === 1) {
    file = within(DIRS.media, rest[0]);
  } else if (kind === "a" && rest.length >= 2 && /^\d+$/.test(rest[0])) {
    const rel = rest.slice(1).join("/");
    file = within(DIRS.assets, rel);
    // replaced image since restored: fall back to the original
    if (!file || !fs.existsSync(file)) file = within(PUBLIC_ASSETS, rel);
  }

  const type = file ? TYPES[path.extname(file).toLowerCase()] : undefined;
  if (!file || !type) return notFound();
  let stat: fs.Stats;
  try {
    stat = fs.statSync(file);
  } catch {
    return notFound();
  }
  if (!stat.isFile()) return notFound();

  return new Response(new Uint8Array(fs.readFileSync(file)), {
    headers: {
      "Content-Type": type,
      "Content-Length": String(stat.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
