import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/admin/icons";
import { PrintButton } from "@/components/admin/PrintButton";
import { buttonClass } from "@/components/admin/ui";
import KpiReportSheet from "@/components/kpi/KpiReportSheet";
import { formatPeriod } from "@/lib/kpi";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { getReport } from "@/server/kpi";

/* The monthly report as a printable A4 document, outside the panel's
   sidebar so "Save as PDF" gets only the sheet. */

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const report = Number.isInteger(id) ? getReport(id) : null;
  return { title: report ? `${report.department} — ${formatPeriod(report.period, "ar")}` : "KPI report" };
}

export default async function KpiPrintPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("kpi.view");
  const id = Number((await params).id);
  const report = Number.isInteger(id) ? getReport(id) : null;
  if (!report) notFound();
  const t = await getAdminT();
  const lang = await getAdminLang();

  return (
    <div className="min-h-screen bg-[#0a2437] print:bg-white">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#041a2b]/95 backdrop-blur print:hidden">
        <div className="mx-auto flex w-full max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href={`/admin/kpi/reports/${report.id}`} className={buttonClass.secondary}>
            <Icon name="up" className="h-4 w-4 -rotate-90 rtl:rotate-90" />
            {t("common.back")}
          </Link>
          <span className="text-[13px] text-steel">{report.department} · {formatPeriod(report.period, lang)}</span>
          <PrintButton />
        </div>
      </div>
      <main className="px-3 py-6 sm:px-6 sm:py-10 print:p-0" style={{ fontFamily: '"GESSTwo", "Exo2", system-ui, sans-serif' }}>
        <KpiReportSheet report={report} />
      </main>
    </div>
  );
}
