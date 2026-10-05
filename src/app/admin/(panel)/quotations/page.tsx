import Link from "next/link";
import { Icon } from "@/components/admin/icons";
import { QUOTATION_TONE, quotationStatusKey } from "@/components/admin/status";
import { Badge, buttonClass, EmptyState, inputClass, PageHeader, Pager } from "@/components/admin/ui";
import { formatDate } from "@/lib/admin/format";
import { formatMoney, lookup } from "@/lib/quotation";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { getMessagesFor } from "@/server/content";
import { listQuotations, QUOTATION_STATUSES } from "@/server/quotations";

export const metadata = { title: "Quotation briefs" };

type Search = { status?: string; q?: string; page?: string };

export default async function QuotationsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("quotations.view");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const sp = await searchParams;
  const result = listQuotations({ status: sp.status, q: sp.q?.slice(0, 100), page: Number(sp.page) || 1 });
  // the form's own wording (editable under Texts › Sales), for the service names
  const site = lookup(getMessagesFor(lang).Quotation);
  const formHref = lang === "en" ? "/en/quotation-request" : "/quotation-request";

  return (
    <>
      <PageHeader
        title={t("nav.quotations")}
        subtitle={t("quotes.subtitle")}
        actions={
          <a href={formHref} target="_blank" rel="noopener noreferrer" title={t("quotes.formLinkHint")} className={buttonClass.secondary}>
            <Icon name="external" className="h-4 w-4" />
            {t("quotes.formLink")}
          </a>
        }
      />

      <form method="get" className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_220px_auto]">
        <input name="q" defaultValue={sp.q ?? ""} placeholder={t("quotes.searchPlaceholder")} className={inputClass} />
        <select name="status" defaultValue={sp.status ?? ""} className={inputClass}>
          <option value="">{t("common.status")}: {t("common.all")}</option>
          {QUOTATION_STATUSES.map((s) => (
            <option key={s} value={s}>{t(quotationStatusKey(s))}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className={buttonClass.primary}>{t("common.filter")}</button>
          {(sp.q || sp.status) && <Link href="/admin/quotations" className={buttonClass.secondary}>{t("common.clear")}</Link>}
        </div>
      </form>

      <p className="mb-3 text-[13px] text-steel">{t("quotes.count", { count: result.total })}</p>

      {result.rows.length === 0 ? (
        <EmptyState>{t("quotes.none")}</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[860px] text-[14px]">
            <thead className="bg-white/[0.04] text-[12.5px] text-white/55">
              <tr>
                <th className="px-4 py-3 text-start font-bold">{t("quotes.client")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("quotes.salesPerson")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("quotes.service")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("quotes.total")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("quotes.submitted")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("common.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {result.rows.map((q) => (
                <tr key={q.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/quotations/${q.id}`} className="font-bold text-white hover:text-teal">{q.clientName}</Link>
                    <p dir="ltr" className="text-start font-exo text-[12px] text-steel">{q.reference || `#${q.id}`}</p>
                  </td>
                  <td className="px-4 py-3 text-white/85">{q.salesPerson}</td>
                  <td className="max-w-[260px] px-4 py-3 text-[13px] text-white/85">
                    {q.services.length ? q.services.map((k) => site(`services.${k}`)).join("، ") : "—"}
                  </td>
                  <td dir="ltr" className="px-4 py-3 text-start font-exo text-white/85">
                    {q.total === null ? "—" : `${formatMoney(q.total, lang)} ${site("currency")}`}
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-steel">{formatDate(q.createdAt, lang)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={QUOTATION_TONE[q.status]}>{t(quotationStatusKey(q.status))}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pager
        page={result.page}
        pages={result.pages}
        base="/admin/quotations"
        params={{ q: sp.q, status: sp.status }}
        labels={{ previous: t("common.previous"), next: t("common.next"), of: t("common.of") }}
      />
    </>
  );
}
