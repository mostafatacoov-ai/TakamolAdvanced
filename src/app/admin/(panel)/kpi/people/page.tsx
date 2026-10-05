import Link from "next/link";
import { RATING_TONE } from "@/components/admin/status";
import { Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { formatPeriod, formatScore, rating, RATING_LABELS } from "@/lib/kpi";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { employeesOverview, listDepartments } from "@/server/kpi";

export const metadata = { title: "Employees' scores" };

export default async function KpiPeoplePage() {
  await requirePermission("kpi.view");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const departments = listDepartments();
  const people = employeesOverview();

  return (
    <>
      <PageHeader title={t("nav.kpiPeople")} subtitle={t("kpi.people.subtitle")} back={{ href: "/admin/kpi", label: t("nav.kpi") }} />

      {people.length === 0 ? (
        <EmptyState>{t("kpi.team.noEmployees")}</EmptyState>
      ) : (
        <div className="space-y-6">
          {departments.map((d) => {
            const rows = people.filter((p) => p.departmentId === d.id);
            if (!rows.length) return null;
            return (
              <div key={d.id} className="overflow-x-auto rounded-2xl border border-white/10">
                <div className="border-b border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] font-bold text-white">
                  {lang === "en" && d.nameEn ? d.nameEn : d.name}
                </div>
                <table className="w-full min-w-[720px] text-[14px]">
                  <thead className="text-[12.5px] text-white/55">
                    <tr>
                      <th className="px-4 py-2.5 text-start font-bold">{t("common.name")}</th>
                      <th className="px-4 py-2.5 text-start font-bold">{t("kpi.people.latest")}</th>
                      <th className="px-4 py-2.5 text-start font-bold">{t("kpi.people.average")}</th>
                      <th className="px-4 py-2.5 text-start font-bold">{t("kpi.people.reports")}</th>
                      <th className="px-4 py-2.5 text-start font-bold">{t("common.status")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {rows.map((p) => {
                      const band = rating(p.average);
                      return (
                        <tr key={p.id} className="hover:bg-white/[0.03]">
                          <td className="px-4 py-3">
                            <Link href={`/admin/kpi/employees/${p.id}`} className="font-bold text-white hover:text-teal">{p.name}</Link>
                            <p className="text-[12px] text-steel">{p.title}</p>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-white/85">
                            {p.latest ? (
                              <>
                                <span className="font-exo font-bold text-teal-cyan" dir="ltr">{formatScore(p.latest.score)}</span>
                                <span className="text-steel"> · {formatPeriod(p.latest.period, lang)}</span>
                              </>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-exo font-bold text-white" dir="ltr">{formatScore(p.average)}</span>{" "}
                            {band && <Badge tone={RATING_TONE[band]}>{RATING_LABELS[band][lang]}</Badge>}
                          </td>
                          <td className="px-4 py-3 font-exo text-white/85">{p.reports}</td>
                          <td className="px-4 py-3"><Badge tone={p.active ? "green" : "gray"}>{t(p.active ? "kpi.team.active" : "kpi.team.inactive")}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
