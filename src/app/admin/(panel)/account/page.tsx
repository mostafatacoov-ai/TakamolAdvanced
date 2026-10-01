import { ActionForm, FieldError, SubmitButton } from "@/components/admin/forms";
import { Badge, Card, cx, Field, inputClass, PageHeader } from "@/components/admin/ui";
import { pick } from "@/lib/site-types";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requireUser } from "@/server/auth";
import { changePassword, updateProfile } from "../../_actions/auth";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireUser();
  const t = await getAdminT();
  const lang = await getAdminLang();
  const ltr = cx(inputClass, "text-start");

  return (
    <>
      <PageHeader title={t("nav.account")} subtitle={t("account.subtitle")} actions={<Badge tone="teal">{pick(user.roleName, lang)}</Badge>} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title={t("account.profile")}>
          <ActionForm action={updateProfile} className="space-y-4">
            <Field label={t("common.name")} htmlFor="name">
              <input id="name" name="name" defaultValue={user.name} className={inputClass} />
              <FieldError name="name" />
            </Field>
            <Field label={t("common.email")} htmlFor="email">
              <input id="email" name="email" type="email" defaultValue={user.email} dir="ltr" className={ltr} />
              <FieldError name="email" />
            </Field>
            <SubmitButton pendingLabel="common.saving">{t("common.save")}</SubmitButton>
          </ActionForm>
        </Card>
        <Card title={t("account.password")}>
          <ActionForm action={changePassword} resetOnSuccess className="space-y-4">
            <Field label={t("field.currentPassword")} htmlFor="current">
              <input id="current" name="current" type="password" autoComplete="current-password" dir="ltr" className={ltr} />
              <FieldError name="current" />
            </Field>
            <Field label={t("field.newPassword")} hint={t("field.passwordHint")} htmlFor="password">
              <input id="password" name="password" type="password" autoComplete="new-password" dir="ltr" className={ltr} />
              <FieldError name="password" />
            </Field>
            <Field label={t("field.passwordConfirm")} htmlFor="confirm">
              <input id="confirm" name="confirm" type="password" autoComplete="new-password" dir="ltr" className={ltr} />
              <FieldError name="confirm" />
            </Field>
            <SubmitButton pendingLabel="common.saving">{t("account.password")}</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
