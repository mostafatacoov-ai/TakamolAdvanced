import "server-only";
import ar from "../../messages/ar.json";
import en from "../../messages/en.json";
import type { AdminKey } from "@/lib/admin/i18n";
import type { Locale } from "@/lib/site-types";
import { all, getMeta, one, run, setMeta, transaction } from "./db";

/* Site texts = messages/{ar,en}.json (the defaults shipped with the code)
   with editors' changes from the text_overrides table applied on top. */

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Messages = { [key: string]: Json };

const DEFAULTS: Record<Locale, Messages> = { ar: ar as Messages, en: en as Messages };

function flatten(value: Json, prefix: string, out: Map<string, string>) {
  if (typeof value === "string") out.set(prefix, value);
  else if (Array.isArray(value)) value.forEach((v, i) => flatten(v, `${prefix}.${i}`, out));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
}

const flat = (messages: Messages) => {
  const out = new Map<string, string>();
  flatten(messages, "", out);
  return out;
};

/** dotted path (e.g. "Values.items.2.title") → default text */
const ORIGINAL: Record<Locale, Map<string, string>> = { ar: flat(DEFAULTS.ar), en: flat(DEFAULTS.en) };

export const sections = () => Object.keys(DEFAULTS.en);

export function contentVersion() {
  return Number(getMeta("content_version") ?? "1");
}

function setPath(target: Messages, path: string, value: string) {
  const parts = path.split(".");
  let node: Json = target;
  for (const part of parts.slice(0, -1)) {
    node = (node as Record<string, Json>)[part];
    if (node === null || typeof node !== "object") return;
  }
  (node as Record<string, Json>)[parts[parts.length - 1]] = value;
}

const merged: Partial<Record<Locale, { version: number; messages: Messages }>> = {};

/** The messages next-intl renders the site with. */
export function getMessagesFor(locale: Locale): Messages {
  const version = contentVersion();
  const cached = merged[locale];
  if (cached?.version === version) return cached.messages;
  const messages = structuredClone(DEFAULTS[locale]);
  for (const row of all<{ path: string; value: string }>("SELECT path, value FROM text_overrides WHERE locale = ?", locale)) {
    if (ORIGINAL[locale].has(row.path)) setPath(messages, row.path, row.value);
  }
  merged[locale] = { version, messages };
  return messages;
}

function overrides(): Map<string, string> {
  const map = new Map<string, string>();
  for (const r of all<{ locale: string; path: string; value: string }>("SELECT locale, path, value FROM text_overrides")) {
    map.set(`${r.locale}:${r.path}`, r.value);
  }
  return map;
}

export type TextField = {
  path: string;
  /** path inside the section, e.g. "items.2.title" */
  key: string;
  ar: string;
  en: string;
  arOriginal: string;
  enOriginal: string;
  edited: boolean;
};

export function sectionFields(ns: string): TextField[] | null {
  if (!(ns in DEFAULTS.en)) return null;
  const changed = overrides();
  const fields: TextField[] = [];
  for (const [path, enOriginal] of ORIGINAL.en) {
    if (!path.startsWith(`${ns}.`)) continue;
    const arOriginal = ORIGINAL.ar.get(path) ?? "";
    const arValue = changed.get(`ar:${path}`);
    const enValue = changed.get(`en:${path}`);
    fields.push({
      path,
      key: path.slice(ns.length + 1),
      ar: arValue ?? arOriginal,
      en: enValue ?? enOriginal,
      arOriginal,
      enOriginal,
      edited: arValue !== undefined || enValue !== undefined,
    });
  }
  return fields;
}

export function sectionStats(): Record<string, { total: number; edited: number }> {
  const stats: Record<string, { total: number; edited: number }> = {};
  for (const path of ORIGINAL.en.keys()) {
    const ns = path.split(".")[0];
    (stats[ns] ??= { total: 0, edited: 0 }).total++;
  }
  for (const r of all<{ path: string }>("SELECT DISTINCT path FROM text_overrides")) {
    const ns = r.path.split(".")[0];
    if (stats[ns]) stats[ns].edited++;
  }
  return stats;
}

export function countEditedTexts() {
  return one<{ n: number }>("SELECT COUNT(DISTINCT path) AS n FROM text_overrides")?.n ?? 0;
}

const TAGS = /<\/?[a-zA-Z][^>]*>/g;
const HAS_TAG = /<\/?[a-zA-Z][^>]*>/;

/* Texts are ICU messages: stray braces or tags would break rendering, so
   they're only allowed where the original text already uses them. */
export function validateText(original: string, value: string): AdminKey | null {
  if (value.length > 8000) return "err.tooLong";
  if (/[{}]/.test(value) && !/[{}]/.test(original)) return "err.braces";
  const tags = value.match(TAGS);
  if (tags) {
    if (!HAS_TAG.test(original)) return "err.tags";
    if (tags.some((t) => t !== "<b>" && t !== "</b>")) return "err.richTags";
    if (tags.filter((t) => t === "<b>").length !== tags.filter((t) => t === "</b>").length) return "err.richTags";
  }
  return null;
}

export function saveSection(
  ns: string,
  values: { locale: Locale; path: string; value: string }[],
  userId: number,
): { errors: Record<string, AdminKey>; changed: number } {
  const errors: Record<string, AdminKey> = {};
  const rows: { locale: Locale; path: string; value: string; original: string }[] = [];
  for (const v of values) {
    if (!v.path.startsWith(`${ns}.`)) continue;
    const original = ORIGINAL[v.locale].get(v.path);
    if (original === undefined) continue;
    const value = v.value.replace(/\r\n?/g, "\n");
    const error = validateText(original, value);
    if (error) errors[`${v.locale}:${v.path}`] = error;
    else rows.push({ ...v, value, original });
  }
  if (Object.keys(errors).length) return { errors, changed: 0 };

  let changed = 0;
  transaction(() => {
    for (const r of rows) {
      const current = one<{ value: string }>(
        "SELECT value FROM text_overrides WHERE locale = ? AND path = ?", r.locale, r.path,
      )?.value;
      if (r.value === r.original) {
        if (current !== undefined) {
          run("DELETE FROM text_overrides WHERE locale = ? AND path = ?", r.locale, r.path);
          changed++;
        }
      } else if (r.value !== current) {
        run(
          `INSERT INTO text_overrides (locale, path, value, updated_by) VALUES (?, ?, ?, ?)
           ON CONFLICT(locale, path) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = datetime('now')`,
          r.locale, r.path, r.value, userId,
        );
        changed++;
      }
    }
    if (changed) setMeta("content_version", String(contentVersion() + 1));
  });
  return { errors, changed };
}

/* Arabic-friendly matching: ignore diacritics, tatweel and alef/yaa forms. */
const normalize = (s: string) =>
  s.toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ");

export function searchTexts(query: string, limit = 80) {
  const q = normalize(query.trim());
  if (q.length < 2) return [];
  const changed = overrides();
  const results: { path: string; ns: string; ar: string; en: string }[] = [];
  for (const [path, enOriginal] of ORIGINAL.en) {
    const arText = changed.get(`ar:${path}`) ?? ORIGINAL.ar.get(path) ?? "";
    const enText = changed.get(`en:${path}`) ?? enOriginal;
    if (normalize(arText).includes(q) || normalize(enText).includes(q)) {
      results.push({ path, ns: path.split(".")[0], ar: arText, en: enText });
      if (results.length >= limit) break;
    }
  }
  return results;
}
