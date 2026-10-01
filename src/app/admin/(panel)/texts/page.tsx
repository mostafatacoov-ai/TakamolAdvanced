import Link from "next/link";
import { Icon } from "@/components/admin/icons";
import { Badge, buttonClass, Card, EmptyState, inputClass, PageHeader } from "@/components/admin/ui";
import { CONTENT_GROUPS, sectionLabel } from "@/lib/admin/content-groups";
import { pick } from "@/lib/site-types";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { searchTexts, sections, sectionStats } from "@/server/content";

export const metadata = { title: "Texts" };

export default async function TextsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requirePermission("content.edit");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const stats = sectionStats();
  const known = new Set(CONTENT_GROUPS.flatMap((g) => g.sections.map((s) => s.ns)));
  const others = sections().filter((ns) => !known.has(ns));
  const groups = [
    ...CONTENT_GROUPS,
    ...(others.length
      ? [{ key: "other", label: { ar: t("texts.other"), en: t("texts.other") }, sections: others.map((ns) => ({ ns, label: { ar: ns, en: ns } })) }]
      : []),
  ];

  return (
    <>
      <PageHeader title={t("nav.texts")} subtitle={t("texts.subtitle")} />

      <form method="get" className="mb-8 flex gap-2">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute start-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
          <input name="q" defaultValue={q} placeholder={t("texts.searchPlaceholder")} className={`${inputClass} ps-11`} />
        </div>
        <button type="submit" className={buttonClass.primary}>{t("common.search")}</button>
        {q && <Link href="/admin/texts" className={buttonClass.secondary}>{t("common.clear")}</Link>}
      </form>

      {q ? (
        (() => {
          const results = searchTexts(q);
          if (!results.length) return <EmptyState>{t("texts.noResults")}</EmptyState>;
          return (
            <Card title={t("texts.results", { count: results.length })}>
              <ul className="divide-y divide-white/10">
                {results.map((r) => (
                  <li key={r.path}>
                    <Link href={`/admin/texts/${r.ns}#f-${r.path}`} className="block py-3 hover:bg-white/[0.02]">
                      <p className="text-[12px] font-bold text-teal">{pick(sectionLabel(r.ns), lang)}</p>
                      <p dir="rtl" className="mt-1 line-clamp-2 text-[14px] text-white">{r.ar}</p>
                      <p dir="ltr" className="mt-0.5 line-clamp-2 text-[13px] text-steel">{r.en}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })()
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.key}>
              <h2 className="mb-3 text-[15px] font-bold text-white/80">{pick(group.label, lang)}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.sections
                  .filter((s) => stats[s.ns])
                  .map((s) => (
                    <Link
                      key={s.ns}
                      href={`/admin/texts/${s.ns}`}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 transition hover:border-teal/40 hover:bg-white/[0.06]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-bold text-white group-hover:text-teal-cyan">{pick(s.label, lang)}</p>
                        <p className="mt-0.5 text-[12px] text-steel">{t("texts.fields", { count: stats[s.ns].total })}</p>
                      </div>
                      {stats[s.ns].edited > 0 && <Badge tone="teal">{t("texts.editedCount", { count: stats[s.ns].edited })}</Badge>}
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
