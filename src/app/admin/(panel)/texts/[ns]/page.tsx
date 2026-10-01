import { notFound } from "next/navigation";
import { ContentEditor, type EditorGroup } from "@/components/admin/ContentEditor";
import { PageHeader } from "@/components/admin/ui";
import { sectionLabel } from "@/lib/admin/content-groups";
import type { AdminKey, Translate } from "@/lib/admin/i18n";
import { pick } from "@/lib/site-types";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { sectionFields, type TextField } from "@/server/content";
import { saveTexts } from "../../../_actions/content";

const WORDS: Record<string, AdminKey> = {
  title: "f.title", heading: "f.title", subtitle: "f.subtitle", tagline: "f.tagline",
  desc: "f.desc", description: "f.desc", text: "f.text", intro: "f.text", hub: "f.hub",
};

/* "locationOnMap" → "Location on map" */
const humanize = (key: string) => {
  const words = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/* "items.2.title" → "Item 3 › Title" */
function label(path: string[], t: Translate) {
  return path
    .map((part) => (/^\d+$/.test(part) ? t("texts.item", { n: Number(part) + 1 }) : WORDS[part] ? t(WORDS[part]) : humanize(part)))
    .join(" › ");
}

/* Fields grouped by their first key; a group is named after its heading text when it has one. */
function group(fields: TextField[], t: Translate, lang: "ar" | "en"): EditorGroup[] {
  const groups = new Map<string, EditorGroup>();
  for (const f of fields) {
    const parts = f.key.split(".");
    const key = parts.length > 1 ? parts[0] : "";
    if (!groups.has(key)) groups.set(key, { key: key || "general", label: key || t("texts.general"), fields: [] });
    groups.get(key)!.fields.push({
      path: f.path,
      label: label(parts.length > 1 ? parts.slice(1) : parts, t),
      ar: f.ar, en: f.en, arOriginal: f.arOriginal, enOriginal: f.enOriginal, edited: f.edited,
    });
  }
  for (const g of groups.values()) {
    if (g.key === "general") continue;
    const heading = fields.find((f) => f.key === `${g.key}.heading` || f.key === `${g.key}.title`);
    if (heading) g.label = (lang === "ar" ? heading.ar : heading.en) || g.label;
    else if (/^\d+$/.test(g.key)) g.label = t("texts.item", { n: Number(g.key) + 1 });
  }
  return [...groups.values()];
}

export default async function TextSectionPage({ params }: { params: Promise<{ ns: string }> }) {
  await requirePermission("content.edit");
  const { ns } = await params;
  const fields = sectionFields(ns);
  if (!fields) notFound();
  const t = await getAdminT();
  const lang = await getAdminLang();

  return (
    <>
      <PageHeader
        title={pick(sectionLabel(ns), lang)}
        subtitle={t("texts.subtitle")}
        back={{ href: "/admin/texts", label: t("texts.backToSections") }}
      />
      <ContentEditor action={saveTexts.bind(null, ns)} groups={group(fields, t, lang)} />
    </>
  );
}
