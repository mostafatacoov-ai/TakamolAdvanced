import { notFound } from "next/navigation";
import { ActionForm, FieldError, SubmitButton } from "@/components/admin/forms";
import { FormImageField, MediaLibraryProvider } from "@/components/admin/MediaPicker";
import { Card, cx, Field, inputClass, PageHeader } from "@/components/admin/ui";
import type { Localized } from "@/lib/site-types";
import { getAdminT } from "@/server/admin-lang";
import { can, requirePermission } from "@/server/auth";
import { listMedia, listSiteImages } from "@/server/images";
import { getJob } from "@/server/jobs";
import { saveJobAction } from "../../../_actions/careers";

export const metadata = { title: "Job" };

export default async function JobFormPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("jobs.manage");
  const raw = (await params).id;
  const id = raw === "new" ? null : Number(raw);
  const job = id ? getJob(id) : null;
  if (id !== null && !job) notFound();
  const t = await getAdminT();

  const pair = (name: string, label: string, value: Localized | undefined, multiline = false, hint?: string) => (
    <Field label={label} hint={hint}>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {(["ar", "en"] as const).map((lang) =>
          multiline ? (
            <textarea
              key={lang}
              name={`${name}_${lang}`}
              defaultValue={value?.[lang] ?? ""}
              rows={5}
              dir={lang === "ar" ? "rtl" : "ltr"}
              placeholder={t(lang === "ar" ? "common.arabic" : "common.english")}
              className={cx(inputClass, "resize-y leading-relaxed", lang === "en" && "text-left")}
            />
          ) : (
            <input
              key={lang}
              name={`${name}_${lang}`}
              defaultValue={value?.[lang] ?? ""}
              dir={lang === "ar" ? "rtl" : "ltr"}
              placeholder={t(lang === "ar" ? "common.arabic" : "common.english")}
              className={cx(inputClass, lang === "en" && "text-left")}
            />
          ),
        )}
      </div>
      <FieldError name={`${name}_ar`} />
    </Field>
  );

  return (
    <>
      <PageHeader title={t(job ? "jobs.edit" : "jobs.new")} back={{ href: "/admin/jobs", label: t("nav.jobs") }} />
      <MediaLibraryProvider
        items={listMedia()}
        siteImages={listSiteImages().filter((i) => i.replaceable).map((i) => `/assets/${i.rel}`)}
        canUpload={can(user, "media.manage")}
      >
        <Card>
          <ActionForm action={saveJobAction.bind(null, job?.id ?? null)} className="space-y-5">
            {pair("title", t("common.title"), job?.title)}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {pair("location", t("jobs.location"), job?.location)}
              {pair("type", t("jobs.type"), job?.type, false, t("jobs.typeHint"))}
            </div>
            {pair("description", t("jobs.description"), job?.description, true)}
            <Field label={t("jobs.image")} hint={t("jobs.imageHint")}>
              <FormImageField name="image" defaultValue={job?.image ?? ""} />
            </Field>
            <Field label={t("common.status")} hint={t("jobs.statusHint")} htmlFor="status">
              <select id="status" name="status" defaultValue={job?.status ?? "open"} className={cx(inputClass, "max-w-[240px]")}>
                <option value="open">{t("jobs.status.open")}</option>
                <option value="closed">{t("jobs.status.closed")}</option>
              </select>
            </Field>
            <SubmitButton pendingLabel="common.saving">{t(job ? "common.save" : "common.create")}</SubmitButton>
          </ActionForm>
        </Card>
      </MediaLibraryProvider>
    </>
  );
}
