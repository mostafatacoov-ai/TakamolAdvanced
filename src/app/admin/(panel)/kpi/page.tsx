import Link from "next/link";
import { Icon } from "@/components/admin/icons";
import { RATING_TONE, REPORT_TONE, reportStatusKey } from "@/components/admin/status";
import { Badge, buttonClass, EmptyState, inputClass, PageHeader } from "@/components/admin/ui";
import { formatDate } from "@/lib/admin/format";
import { formatPeriod, formatScore, rating, RATING_LABELS, REPORT_STATUSES } from "@/lib/kpi";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { can, requirePermission } from "@/server/auth";
import { listDepartments, listPeriods, listReports } from "@/server/kpi";

export const metadata = { title: "KPI reports" };

type Search = { department?: string; period?: string; status?: string };

export default async function KpiReportsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requirePermission("kpi.view");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const sp = await searchParams;
  const departmentId = Number(sp.department) > 0 ? Number(sp.department) : undefined;
  const reports = listReports({ departmentId, period: sp.period, status: sp.status });
  const departments = listDepartments();
  const periods = listPeriods();
  const canManage = can(user, "kpi.manage");

  return (
    <>
      <PageHeader
        title={t("nav.kpi")}
        subtitle={t("kpi.subtitle")}
        actions={
          canManage && (
            <>
              <Link href="/admin/kpi/team" className={buttonClass.secondary}>
                <Icon name="partners" className="h-4 w-4" />
                {t("nav.kpiTeam")}
              </Link>
              <Link href="/admin/kpi/reports/new" className={buttonClass.primary}>
                <Icon name="plus" className="h-4 w-4" />
                {t("kpi.newReport")}
              </Link>
            </>
          )
        }
      />

      <form method="get" className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_200px_200px_auto]">
        <select name="department" defaultValue={sp.department ?? ""} className={inputClass}>
          <option value="">{t("kpi.department")}: {t("common.all")}</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{lang === "en" && d.nameEn ? d.nameEn : d.name}</option>)}
        </select>
        <select name="period" defaultValue={sp.period ?? ""} className={inputClass}>
          <option value="">{t("kpi.period")}: {t("common.all")}</option>
          {periods.map((p) => <option key={p} value={p}>{formatPeriod(p, lang)}</option>)}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className={inputClass}>
          <option value="">{t("common.status")}: {t("common.all")}</option>
          {REPORT_STATUSES.map((s) => <option key={s} value={s}>{t(reportStatusKey(s))}</option>)}
        </select>
        <div className="flex gap-2">
          <button type="submit" className={buttonClass.primary}>{t("common.filter")}</button>
          {(sp.department || sp.period || sp.status) && <Link href="/admin/kpi" className={buttonClass.secondary}>{t("common.clear")}</Link>}
        </div>
      </form>

      <p className="mb-3 text-[13px] text-steel">{t("kpi.reportsCount", { count: reports.length })}</p>

      {reports.length === 0 ? (
        <EmptyState>{t("kpi.none")}</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[860px] text-[14px]">
            <thead className="bg-white/[0.04] text-[12.5px] text-white/55">
              <tr>
                <th className="px-4 py-3 text-start font-bold">{t("kpi.department")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("kpi.period")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("kpi.team.employees")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("kpi.score")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("common.status")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("kpi.updated")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {reports.map((r) => {
                const band = rating(r.score);
                return (
                  <tr key={r.id} className="hover:bg-white/[0.03]">
                    <td className="max-w-[360px] px-4 py-3">
                      <Link href={`/admin/kpi/reports/${r.id}`} className="font-bold text-white hover:text-teal">{r.department}</Link>
                      <p className="truncate text-[12px] text-steel">{r.title}</p>
                    </td>
                    <td className="px-4 py-3 text-white/85">{formatPeriod(r.period, lang)}</td>
                    <td className="px-4 py-3 text-[13px] text-white/85">{t("kpi.cards", { count: r.cards })}</td>
                    <td className="px-4 py-3">
                      <span className="font-exo font-bold text-teal-cyan" dir="ltr">{formatScore(r.score)}</span>
                      {band && <Badge tone={RATING_TONE[band]}>{RATING_LABELS[band][lang]}</Badge>}
                    </td>
                    <td className="px-4 py-3"><Badge tone={REPORT_TONE[r.status]}>{t(reportStatusKey(r.status))}</Badge></td>
                    <td className="px-4 py-3 text-[12.5px] text-steel">{formatDate(r.updatedAt, lang)}</td>
                    <td className="px-4 py-3 text-end">
                      <a href={`/admin/kpi-print/${r.id}`} target="_blank" rel="noopener noreferrer" className={buttonClass.small}>
                        <Icon name="download" className="h-4 w-4" />
                        PDF
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
