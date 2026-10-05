import Link from "next/link";
import { notFound } from "next/navigation";
import { RATING_TONE, REPORT_TONE, reportStatusKey } from "@/components/admin/status";
import { Badge, Card, EmptyState, PageHeader, StatCard } from "@/components/admin/ui";
import { formatPeriod, formatScore, rating, RATING_LABELS, round2, totalWeight } from "@/lib/kpi";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { employeeHistory, getEmployee } from "@/server/kpi";

export const metadata = { title: "Employee KPIs" };

export default async function KpiEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("kpi.view");
  const id = Number((await params).id);
  const employee = Number.isInteger(id) ? getEmployee(id) : null;
  if (!employee) notFound();
  const t = await getAdminT();
  const lang = await getAdminLang();
  const history = employeeHistory(id);
  const scored = history.map((h) => h.evaluation.score).filter((s): s is number => s !== null);
  const average = scored.length ? round2(scored.reduce((a, b) => a + b, 0) / scored.length) : null;
  const band = rating(average);

  return (
    <>
      <PageHeader
        title={employee.name}
        subtitle={`${employee.title}${employee.title ? " · " : ""}${employee.department}`}
        back={{ href: "/admin/kpi/people", label: t("nav.kpiPeople") }}
        actions={<Badge tone={employee.active ? "green" : "gray"}>{t(employee.active ? "kpi.team.active" : "kpi.team.inactive")}</Badge>}
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t("kpi.people.average")} value={formatScore(average)} icon="kpi" tone={band ? RATING_TONE[band] : "gray"} />
        <StatCard label={t("kpi.people.latest")} value={history[0] ? formatScore(history[0].evaluation.score) : "—"} icon="activity" tone="blue" />
        <StatCard label={t("kpi.people.reports")} value={history.length} icon="pages" tone="amber" />
      </div>

      <h2 className="mb-4 text-[18px] font-bold text-white">{t("kpi.emp.history")}</h2>
      {history.length === 0 ? (
        <EmptyState>{t("kpi.emp.none")}</EmptyState>
      ) : (
        <div className="space-y-5">
          {history.map((h) => {
            const b = rating(h.evaluation.score);
            return (
              <Card
                key={h.reportId}
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    {formatPeriod(h.period, lang)}
                    <Badge tone={REPORT_TONE[h.status]}>{t(reportStatusKey(h.status))}</Badge>
                  </span>
                }
                description={h.reportTitle}
                actions={
                  <div className="flex items-center gap-3">
                    <span className="font-exo text-[18px] font-bold text-teal-cyan" dir="ltr">{formatScore(h.evaluation.score)}</span>
                    {b && <Badge tone={RATING_TONE[b]}>{RATING_LABELS[b][lang]}</Badge>}
                    <Link href={`/admin/kpi/reports/${h.reportId}`} className="text-[13px] font-bold text-teal hover:text-teal-cyan">{t("kpi.emp.openReport")}</Link>
                  </div>
                }
              >
                {h.evaluation.highlights.length > 0 && (
                  <ul className="mb-4 list-disc space-y-1 ps-5 text-[13.5px] leading-relaxed text-white/85">
                    {h.evaluation.highlights.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                )}
                {h.evaluation.kpis.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full min-w-[640px] text-[13.5px]">
                      <thead className="bg-white/[0.04] text-[12px] text-white/55">
                        <tr>
                          <th className="px-3 py-2 text-start font-bold">{t("kpi.edit.indicator")}</th>
                          <th className="px-3 py-2 text-start font-bold">{t("kpi.edit.weight")}</th>
                          <th className="px-3 py-2 text-start font-bold">{t("kpi.edit.scoreOf10")}</th>
                          <th className="px-3 py-2 text-start font-bold">{t("kpi.edit.note")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {h.evaluation.kpis.map((k, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 font-bold text-white">{k.indicator}</td>
                            <td className="px-3 py-2 font-exo text-white/85" dir="ltr">{k.weight}%</td>
                            <td className="px-3 py-2 font-exo font-bold text-teal-cyan" dir="ltr">{k.score ?? "—"}</td>
                            <td className="px-3 py-2 text-white/80">{k.note}</td>
                          </tr>
                        ))}
                      </tbody>
                      {totalWeight(h.evaluation.kpis) !== 100 && (
                        <tfoot>
                          <tr><td colSpan={4} className="px-3 py-2 text-[12px] text-amber-200">{t("kpi.edit.totalWeight")}: {totalWeight(h.evaluation.kpis)}%</td></tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
