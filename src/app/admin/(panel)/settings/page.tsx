import { ActionForm, FieldError, SubmitButton } from "@/components/admin/forms";
import { MediaLibraryProvider } from "@/components/admin/MediaPicker";
import { SocialLinksEditor } from "@/components/admin/SocialLinksEditor";
import { Card, cx, Field, inputClass, PageHeader } from "@/components/admin/ui";
import { getAdminT } from "@/server/admin-lang";
import { can, requirePermission } from "@/server/auth";
import { listMedia, listSiteImages } from "@/server/images";
import { getSiteSettings } from "@/server/site";
import { saveSettingsAction } from "../../_actions/people";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const user = await requirePermission("settings.manage");
  const t = await getAdminT();
  const s = getSiteSettings();
  const ltr = cx(inputClass, "text-left font-exo");

  const input = (name: string, label: string, value: string, hint?: string) => (
    <Field label={label} hint={hint} htmlFor={name}>
      <input id={name} name={name} defaultValue={value} dir="ltr" className={ltr} />
      <FieldError name={name} />
    </Field>
  );

  return (
    <>
      <PageHeader title={t("nav.settings")} subtitle={t("settings.subtitle")} />
      <MediaLibraryProvider
        items={listMedia()}
        siteImages={listSiteImages().filter((i) => i.replaceable).map((i) => `/assets/${i.rel}`)}
        canUpload={can(user, "media.manage")}
      >
        <ActionForm action={saveSettingsAction} className="space-y-6">
          <Card title={t("settings.contact")}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {input("footerEmail", t("settings.footerEmail"), s.footerEmail)}
              {input("requestsEmail", t("settings.requestsEmail"), s.requestsEmail)}
              {input("phone", t("settings.phone"), s.phone)}
              {input("landline", t("settings.landline"), s.landline, t("settings.landlineHint"))}
              {input("whatsapp", t("settings.whatsapp"), s.whatsapp, t("settings.whatsappHint"))}
              {input("hours", t("settings.hours"), s.hours, t("settings.hoursHint"))}
              {input("mapUrl", t("settings.mapUrl"), s.mapUrl)}
            </div>
          </Card>
          <Card title={t("settings.social")} description={t("settings.socialHint")}>
            <SocialLinksEditor items={s.social} />
          </Card>
          <SubmitButton pendingLabel="common.saving">{t("common.save")}</SubmitButton>
        </ActionForm>
      </MediaLibraryProvider>
    </>
  );
}
