import { ActionForm, FieldError, SubmitButton } from "@/components/admin/forms";
import { Icon } from "@/components/admin/icons";
import { Badge, Card, cx, EmptyState, Field, inputClass, PageHeader } from "@/components/admin/ui";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { listDepartments, listEmployees } from "@/server/kpi";
import { departmentAction, employeeAction } from "../../../_actions/kpi";

export const metadata = { title: "Departments & team" };

const smallInput = cx(inputClass, "px-2.5 py-1.5 text-[13px]");
const iconButton = "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-white/80 transition hover:border-teal hover:text-teal disabled:opacity-30";

export default async function KpiTeamPage() {
  await requirePermission("kpi.manage");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const departments = listDepartments();
  const employees = listEmployees();

  return (
    <>
      <PageHeader title={t("nav.kpiTeam")} subtitle={t("kpi.team.subtitle")} back={{ href: "/admin/kpi", label: t("nav.kpi") }} />

      {departments.length === 0 && <EmptyState>{t("kpi.team.noDepartments")}</EmptyState>}

      <div className="space-y-6">
        {departments.map((d, di) => {
          const members = employees.filter((e) => e.departmentId === d.id);
          return (
            <Card key={d.id}>
              {/* the department's own row: rename, reorder, delete */}
              <ActionForm action={departmentAction} className="mb-5 flex flex-wrap items-end gap-2 border-b border-white/10 pb-5">
                <Field label={t("kpi.team.nameAr")} className="min-w-[220px] flex-1">
                  <input name="name" defaultValue={d.name} dir="rtl" className={inputClass} />
                  <FieldError name={`name_${d.id}`} />
                </Field>
                <Field label={t("kpi.team.nameEn")} className="min-w-[220px] flex-1">
                  <input name="name_en" defaultValue={d.nameEn} dir="ltr" className={cx(inputClass, "text-left")} />
                </Field>
                <div className="flex items-center gap-1 pb-0.5">
                  <SubmitButton name="intent" value={`update:${d.id}`} pendingLabel="common.saving">{t("common.save")}</SubmitButton>
                  <SubmitButton name="intent" value={`up:${d.id}`} className={iconButton} disabled={di === 0}><Icon name="up" className="h-4 w-4" /></SubmitButton>
                  <SubmitButton name="intent" value={`down:${d.id}`} className={iconButton} disabled={di === departments.length - 1}><Icon name="down" className="h-4 w-4" /></SubmitButton>
                  <SubmitButton name="intent" value={`delete:${d.id}`} confirm="kpi.team.deleteDepartment" className={cx(iconButton, "hover:border-rose-400 hover:text-rose-300")}>
                    <Icon name="trash" className="h-4 w-4" />
                  </SubmitButton>
                </div>
              </ActionForm>

              <p className="mb-3 text-[13px] font-bold text-iceblue">
                {t("kpi.team.employees")} <span className="font-exo text-steel">({members.length})</span>
              </p>

              {members.length === 0 ? (
                <p className="mb-4 text-[13px] text-steel">{t("kpi.team.noEmployees")}</p>
              ) : (
                <div className="mb-4 space-y-2">
                  {members.map((e, ei) => (
                    <ActionForm key={e.id} action={employeeAction} notice="bottom" className="grid grid-cols-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 lg:grid-cols-[1fr_1.3fr_170px_auto_auto]">
                      <div>
                        <input name="name" defaultValue={e.name} dir="auto" placeholder={t("kpi.team.employeeName")} className={smallInput} />
                        <FieldError name={`name_${e.id}`} />
                      </div>
                      <input name="title" defaultValue={e.title} dir="auto" placeholder={t("kpi.team.employeeTitle")} className={smallInput} />
                      <select name="department" defaultValue={e.departmentId} className={smallInput}>
                        {departments.map((x) => <option key={x.id} value={x.id}>{lang === "en" && x.nameEn ? x.nameEn : x.name}</option>)}
                      </select>
                      <label className="flex items-center gap-2 text-[13px] text-white/85">
                        <input type="hidden" name="active" value="0" />
                        <input type="checkbox" name="active" value="1" defaultChecked={e.active} className="h-4 w-4 accent-teal" />
                        {t("kpi.team.active")}
                      </label>
                      <div className="flex items-center gap-1">
                        <SubmitButton name="intent" value={`update:${e.id}`} variant="small" pendingLabel="common.saving">{t("common.save")}</SubmitButton>
                        <SubmitButton name="intent" value={`up:${e.id}`} className={iconButton} disabled={ei === 0}><Icon name="up" className="h-4 w-4" /></SubmitButton>
                        <SubmitButton name="intent" value={`down:${e.id}`} className={iconButton} disabled={ei === members.length - 1}><Icon name="down" className="h-4 w-4" /></SubmitButton>
                        <SubmitButton name="intent" value={`delete:${e.id}`} confirm="kpi.team.deleteEmployee" className={cx(iconButton, "hover:border-rose-400 hover:text-rose-300")}>
                          <Icon name="trash" className="h-4 w-4" />
                        </SubmitButton>
                      </div>
                    </ActionForm>
                  ))}
                </div>
              )}

              {/* add an employee to this department */}
              <ActionForm action={employeeAction} resetOnSuccess notice="bottom" className="grid grid-cols-1 gap-2 rounded-xl border border-dashed border-teal/30 p-3 lg:grid-cols-[1fr_1.3fr_auto]">
                <input type="hidden" name="department" value={d.id} />
                <div>
                  <input name="name" dir="auto" placeholder={t("kpi.team.employeeName")} className={smallInput} />
                  <FieldError name="name" />
                </div>
                <input name="title" dir="auto" placeholder={t("kpi.team.employeeTitle")} className={smallInput} />
                <SubmitButton name="intent" value="create" variant="small" pendingLabel="common.saving">
                  <Icon name="plus" className="h-4 w-4" />
                  {t("kpi.team.addEmployee")}
                </SubmitButton>
              </ActionForm>
              <p className="mt-2 text-[12px] text-white/45">{t("kpi.team.activeHint")}</p>
              {members.some((e) => !e.active) && (
                <p className="mt-1 text-[12px] text-white/45">
                  <Badge tone="gray">{t("kpi.team.inactive")}</Badge> {members.filter((e) => !e.active).map((e) => e.name).join("، ")}
                </p>
              )}
            </Card>
          );
        })}

        <Card title={t("kpi.team.addDepartment")}>
          <ActionForm action={departmentAction} resetOnSuccess className="flex flex-wrap items-end gap-2">
            <Field label={t("kpi.team.nameAr")} className="min-w-[220px] flex-1">
              <input name="name" dir="rtl" className={inputClass} />
              <FieldError name="name" />
            </Field>
            <Field label={t("kpi.team.nameEn")} className="min-w-[220px] flex-1">
              <input name="name_en" dir="ltr" className={cx(inputClass, "text-left")} />
            </Field>
            <SubmitButton name="intent" value="create" pendingLabel="common.saving">
              <Icon name="plus" className="h-4 w-4" />
              {t("common.add")}
            </SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
