import { notFound } from "next/navigation";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { Icon } from "@/components/admin/icons";
import { KpiReportEditor } from "@/components/admin/KpiReportEditor";
import { RATING_TONE, REPORT_TONE, reportStatusKey } from "@/components/admin/status";
import { Badge, Banner, buttonClass, PageHeader } from "@/components/admin/ui";
import KpiReportSheet from "@/components/kpi/KpiReportSheet";
import { formatPeriod, formatScore, rating, RATING_LABELS } from "@/lib/kpi";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { can, requirePermission } from "@/server/auth";
import { getReport, indicatorSuggestions, latestKpiTemplates, listEmployees } from "@/server/kpi";
import { deleteReportAction, saveReportAction } from "../../../../_actions/kpi";

export const metadata = { title: "KPI report" };

export default async function KpiReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await requirePermission("kpi.view");
  const id = Number((await params).id);
  const report = Number.isInteger(id) ? getReport(id) : null;
  if (!report) notFound();
  const t = await getAdminT();
  const lang = await getAdminLang();
  const { created } = await searchParams;
  const canManage = can(user, "kpi.manage");
  const band = rating(report.score);
  const employees = listEmployees({ departmentId: report.departmentId, activeOnly: true });

  return (
    <>
      <PageHeader
        title={`${report.department} — ${formatPeriod(report.period, lang)}`}
        subtitle={report.title}
        back={{ href: "/admin/kpi", label: t("nav.kpi") }}
        actions={
          <>
            <Badge tone={REPORT_TONE[report.status]}>{t(reportStatusKey(report.status))}</Badge>
            {band && <Badge tone={RATING_TONE[band]}>{formatScore(report.score)} · {RATING_LABELS[band][lang]}</Badge>}
            <a href={`/admin/kpi-print/${report.id}`} target="_blank" rel="noopener noreferrer" className={buttonClass.primary}>
              <Icon name="download" className="h-4 w-4" />
              {t("common.print")}
            </a>
          </>
        }
      />
      {created && <Banner tone="teal" icon="check">{t("kpi.created")}</Banner>}

      {canManage ? (
        <>
          <KpiReportEditor
            report={report}
            employees={employees}
            templates={latestKpiTemplates(employees.map((e) => e.id))}
            suggestions={indicatorSuggestions(report.departmentId)}
            action={saveReportAction.bind(null, report.id)}
          />
          <div className="mt-8">
            <ActionForm action={deleteReportAction} notice="top">
              <input type="hidden" name="id" value={report.id} />
              <SubmitButton variant="danger" confirm="common.confirmDelete">
                <Icon name="trash" className="h-4 w-4" />
                {t("common.delete")}
              </SubmitButton>
            </ActionForm>
          </div>
        </>
      ) : (
        <div className="rounded-2xl bg-[#0a2437] p-4 sm:p-8">
          <KpiReportSheet report={report} />
        </div>
      )}
    </>
  );
}
