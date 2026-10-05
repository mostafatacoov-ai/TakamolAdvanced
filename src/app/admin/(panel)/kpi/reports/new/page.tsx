import { ActionForm, FieldError, SubmitButton } from "@/components/admin/forms";
import { Card, cx, Field, inputClass, PageHeader } from "@/components/admin/ui";
import { currentPeriod } from "@/lib/kpi";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { listDepartments } from "@/server/kpi";
import { createReportAction } from "../../../../_actions/kpi";

export const metadata = { title: "New KPI report" };

export default async function NewKpiReportPage() {
  await requirePermission("kpi.manage");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const departments = listDepartments();

  return (
    <>
      <PageHeader title={t("kpi.new.title")} subtitle={`${t("kpi.new.hint")} ${t("kpi.new.prefillHint")}`} back={{ href: "/admin/kpi", label: t("nav.kpi") }} />
      <Card className="max-w-[760px]">
        <ActionForm action={createReportAction} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label={t("kpi.department")} htmlFor="department">
              <select id="department" name="department" defaultValue="" className={inputClass}>
                <option value="" disabled>{t("kpi.department")}…</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{lang === "en" && d.nameEn ? d.nameEn : d.name}</option>)}
              </select>
              <FieldError name="department" />
            </Field>
            <Field label={t("kpi.period")} htmlFor="period">
              <input id="period" name="period" type="month" defaultValue={currentPeriod()} dir="ltr" className={cx(inputClass, "text-left font-exo")} />
              <FieldError name="period" />
            </Field>
          </div>
          <Field label={t("kpi.new.reportTitle")} hint={t("kpi.new.titleHint")} htmlFor="title">
            <input id="title" name="title" dir="auto" className={inputClass} />
          </Field>
          <Field label={t("kpi.new.preparedBy")} htmlFor="prepared_by">
            <input id="prepared_by" name="prepared_by" dir="auto" className={inputClass} />
          </Field>
          <SubmitButton pendingLabel="common.saving">{t("kpi.new.create")}</SubmitButton>
        </ActionForm>
      </Card>
    </>
  );
}
