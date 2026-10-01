import { isSafeHref } from "./links";
import type { Localized } from "./site-types";

/* Sections an editor can stack to build a page. Each one renders with an
   existing design element of the site (see components/blocks). */

export type LItem = { title: Localized; desc: Localized };
export type CardItem = LItem & { image: string };

export type Block =
  | { id: string; type: "hero"; title: Localized; subtitle: Localized; image: string }
  | { id: string; type: "intro"; title: Localized; tagline: Localized; text: Localized }
  | { id: string; type: "text"; title: Localized; text: Localized }
  | { id: string; type: "imageText"; title: Localized; text: Localized; image: string; imageSide: "start" | "end" }
  | { id: string; type: "features"; hub: Localized; items: LItem[]; layout: "sides" | "below" }
  | { id: string; type: "steps"; items: Localized[] }
  | { id: string; type: "cards"; title: Localized; items: CardItem[] }
  | { id: string; type: "banner"; title: Localized; text: Localized; image: string }
  | { id: string; type: "cta"; title: Localized; text: Localized; button: Localized; href: string }
  | { id: string; type: "gallery"; images: string[] };

export type BlockType = Block["type"];

export const BLOCK_TYPES: BlockType[] = [
  "hero", "intro", "text", "imageText", "features", "steps", "cards", "banner", "cta", "gallery",
];

const MAX_BLOCKS = 40;
const MAX_ITEMS = 24;

const L = (): Localized => ({ ar: "", en: "" });
const lItem = (): LItem => ({ title: L(), desc: L() });
export const newId = () => Math.random().toString(36).slice(2, 10);

export function newBlock(type: BlockType): Block {
  const id = newId();
  switch (type) {
    case "hero": return { id, type, title: L(), subtitle: L(), image: "" };
    case "intro": return { id, type, title: L(), tagline: L(), text: L() };
    case "text": return { id, type, title: L(), text: L() };
    case "imageText": return { id, type, title: L(), text: L(), image: "", imageSide: "end" };
    case "features": return { id, type, hub: L(), items: [lItem(), lItem(), lItem(), lItem()], layout: "sides" };
    case "steps": return { id, type, items: [L(), L(), L()] };
    case "cards": return { id, type, title: L(), items: [{ ...lItem(), image: "" }, { ...lItem(), image: "" }, { ...lItem(), image: "" }] };
    case "banner": return { id, type, title: L(), text: L(), image: "" };
    case "cta": return { id, type, title: L(), text: L(), button: L(), href: "/" };
    case "gallery": return { id, type, images: [] };
  }
}

export const newListItem = {
  features: lItem,
  steps: L,
  cards: (): CardItem => ({ ...lItem(), image: "" }),
};

/* ---- validation of what the editor sends ------------------------------ */

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {});
const arr = (v: unknown, max: number): unknown[] => (Array.isArray(v) ? v.slice(0, max) : []);
const str = (v: unknown, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const loc = (v: unknown, max = 4000): Localized => ({ ar: str(obj(v).ar, max), en: str(obj(v).en, max) });

/** An image an editor picked: an uploaded file or one of the site's images. */
export function isAllowedImage(src: string) {
  return /^\/media\/u\/[\w.-]+$/.test(src) || /^\/assets\/[\w./-]+\.(png|jpe?g|webp|gif|svg)$/i.test(src);
}
const img = (v: unknown) => {
  const s = str(v, 300);
  return s && isAllowedImage(s) && !s.includes("..") ? s : "";
};
const href = (v: unknown) => {
  const s = str(v, 500);
  return isSafeHref(s) ? s : "";
};

export function sanitizeBlocks(input: unknown): Block[] {
  const out: Block[] = [];
  for (const raw of arr(input, MAX_BLOCKS)) {
    const b = obj(raw);
    const id = typeof b.id === "string" && /^[a-z0-9-]{1,40}$/i.test(b.id) ? b.id : newId();
    switch (b.type) {
      case "hero":
        out.push({ id, type: "hero", title: loc(b.title, 300), subtitle: loc(b.subtitle, 600), image: img(b.image) });
        break;
      case "intro":
        out.push({ id, type: "intro", title: loc(b.title, 300), tagline: loc(b.tagline, 300), text: loc(b.text) });
        break;
      case "text":
        out.push({ id, type: "text", title: loc(b.title, 300), text: loc(b.text) });
        break;
      case "imageText":
        out.push({
          id, type: "imageText", title: loc(b.title, 300), text: loc(b.text), image: img(b.image),
          imageSide: b.imageSide === "start" ? "start" : "end",
        });
        break;
      case "features":
        out.push({
          id, type: "features", hub: loc(b.hub, 120),
          items: arr(b.items, MAX_ITEMS).map((i) => ({ title: loc(obj(i).title, 200), desc: loc(obj(i).desc, 1200) })),
          layout: b.layout === "below" ? "below" : "sides",
        });
        break;
      case "steps":
        out.push({ id, type: "steps", items: arr(b.items, MAX_ITEMS).map((i) => loc(i, 200)) });
        break;
      case "cards":
        out.push({
          id, type: "cards", title: loc(b.title, 300),
          items: arr(b.items, MAX_ITEMS).map((i) => ({
            title: loc(obj(i).title, 200), desc: loc(obj(i).desc, 1200), image: img(obj(i).image),
          })),
        });
        break;
      case "banner":
        out.push({ id, type: "banner", title: loc(b.title, 300), text: loc(b.text, 1200), image: img(b.image) });
        break;
      case "cta":
        out.push({
          id, type: "cta", title: loc(b.title, 300), text: loc(b.text, 1200), button: loc(b.button, 80),
          href: href(b.href) || "/",
        });
        break;
      case "gallery":
        out.push({ id, type: "gallery", images: arr(b.images, MAX_ITEMS).map(img).filter(Boolean) });
        break;
    }
  }
  return out;
}

/** Every image a list of blocks uses (to warn before deleting media). */
export function blockImages(blocks: Block[]): string[] {
  const found: string[] = [];
  for (const b of blocks) {
    if ("image" in b && b.image) found.push(b.image);
    if (b.type === "cards") b.items.forEach((i) => i.image && found.push(i.image));
    if (b.type === "gallery") found.push(...b.images);
  }
  return found;
}
