import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { Icon } from "@/components/admin/icons";
import { applicationStatusKey, APPLICATION_TONE } from "@/components/admin/status";
import { Badge, buttonClass, Card, cx, Field, inputClass, PageHeader } from "@/components/admin/ui";
import { formatBytes, formatDate } from "@/lib/admin/format";
import { pick } from "@/lib/site-types";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { APPLICATION_STATUSES, getApplication } from "@/server/applications";
import { can, requirePermission } from "@/server/auth";
import { deleteApplicationAction, updateApplicationAction } from "../../../_actions/careers";

export const metadata = { title: "Application" };

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("applications.view");
  const id = Number((await params).id);
  const app = Number.isInteger(id) ? getApplication(id) : null;
  if (!app) notFound();
  const t = await getAdminT();
  const lang = await getAdminLang();
  const canManage = can(user, "applications.manage");

  const row = (label: string, value: ReactNode, ltr = false) => (
    <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[180px_1fr]">
      <dt className="text-[13px] font-bold text-white/55">{label}</dt>
      <dd dir={ltr ? "ltr" : undefined} className={cx("text-[14.5px] text-white", ltr && "text-start")}>{value}</dd>
    </div>
  );

  return (
    <>
      <PageHeader
        title={app.name}
        back={{ href: "/admin/applications", label: t("nav.applications") }}
        actions={<Badge tone={APPLICATION_TONE[app.status]}>{t(applicationStatusKey(app.status))}</Badge>}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <dl className="divide-y divide-white/10">
            {row(t("apps.position"), app.jobTitle ? pick(app.jobTitle, lang) : t("apps.general"))}
            {row(t("common.email"), <a href={`mailto:${app.email}`} className="text-teal hover:underline">{app.email}</a>, true)}
            {row(t("apps.phone"), <a href={`tel:${app.phone}`} className="text-teal hover:underline">{app.phone}</a>, true)}
            {app.linkedin && row(t("apps.linkedin"), <a href={app.linkedin} target="_blank" rel="noopener noreferrer" className="break-all text-teal hover:underline">{app.linkedin}</a>, true)}
            {row(t("apps.submitted"), formatDate(app.createdAt, lang))}
            {row(t("apps.language"), app.locale === "en" ? "English" : "العربية")}
            {app.message && row(t("apps.message"), <p className="whitespace-pre-line leading-relaxed text-white/90">{app.message}</p>)}
          </dl>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
            <span className="inline-flex items-center gap-2 text-[13px] text-steel">
              <Icon name="file" className="h-5 w-5 text-teal" />
              <bdi>{app.cvName}</bdi> · <span className="font-exo">{formatBytes(app.cvSize)}</span>
            </span>
            {app.cvMime === "application/pdf" && (
              <a href={`/admin/cv/${app.id}?inline=1`} target="_blank" rel="noopener noreferrer" className={buttonClass.secondary}>
                <Icon name="eye" className="h-4 w-4" />
                {t("apps.openCv")}
              </a>
            )}
            <a href={`/admin/cv/${app.id}`} className={buttonClass.primary}>
              <Icon name="download" className="h-4 w-4" />
              {t("apps.downloadCv")}
            </a>
          </div>
        </Card>

        {canManage && (
          <div className="space-y-6">
            <Card title={t("apps.update")}>
              <ActionForm action={updateApplicationAction.bind(null, app.id)} className="space-y-4">
                <Field label={t("common.status")} htmlFor="status">
                  <select id="status" name="status" defaultValue={app.status} className={inputClass}>
                    {APPLICATION_STATUSES.map((s) => (
                      <option key={s} value={s}>{t(applicationStatusKey(s))}</option>
                    ))}
                  </select>
                </Field>
                <Field label={t("apps.notes")} hint={t("apps.notesHint")} htmlFor="notes">
                  <textarea id="notes" name="notes" rows={6} defaultValue={app.notes} className={cx(inputClass, "resize-y leading-relaxed")} />
                </Field>
                <SubmitButton pendingLabel="common.saving">{t("common.save")}</SubmitButton>
              </ActionForm>
            </Card>
            <ActionForm action={deleteApplicationAction} notice="top">
              <input type="hidden" name="id" value={app.id} />
              <SubmitButton variant="danger" confirm="common.confirmDelete">
                <Icon name="trash" className="h-4 w-4" />
                {t("common.delete")}
              </SubmitButton>
            </ActionForm>
          </div>
        )}
      </div>
    </>
  );
}
