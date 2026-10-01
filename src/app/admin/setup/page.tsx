import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/admin/AuthFrame";
import { ActionForm, FieldError, SubmitButton } from "@/components/admin/forms";
import { Banner, buttonClass, Field, inputClass } from "@/components/admin/ui";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { countUsers } from "@/server/users";
import { setup } from "../_actions/auth";

export const metadata = { title: "Setup" };
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (countUsers() > 0) redirect("/admin/login");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const production = process.env.NODE_ENV === "production";
  const locked = production && !process.env.ADMIN_SETUP_TOKEN;

  return (
    <AuthFrame title={t("setup.title")} subtitle={t("setup.subtitle")} lang={lang} switchLabel={t("lang.switch")}>
      {locked ? (
        <Banner tone="amber" icon="lock">{t("setup.disabled")}</Banner>
      ) : (
        <ActionForm action={setup} className="space-y-4">
          {production && (
            <Field label={t("setup.token")} hint={t("setup.tokenHint")} htmlFor="token">
              <input id="token" name="token" type="password" autoComplete="off" dir="ltr" className={`${inputClass} text-start`} />
              <FieldError name="token" />
            </Field>
          )}
          <Field label={t("common.name")} htmlFor="name">
            <input id="name" name="name" autoComplete="name" className={inputClass} />
            <FieldError name="name" />
          </Field>
          <Field label={t("common.email")} htmlFor="email">
            <input id="email" name="email" type="email" autoComplete="username" dir="ltr" className={`${inputClass} text-start`} />
            <FieldError name="email" />
          </Field>
          <Field label={t("field.password")} hint={t("field.passwordHint")} htmlFor="password">
            <input id="password" name="password" type="password" autoComplete="new-password" dir="ltr" className={`${inputClass} text-start`} />
            <FieldError name="password" />
          </Field>
          <Field label={t("field.passwordConfirm")} htmlFor="confirm">
            <input id="confirm" name="confirm" type="password" autoComplete="new-password" dir="ltr" className={`${inputClass} text-start`} />
            <FieldError name="confirm" />
          </Field>
          <SubmitButton className={`${buttonClass.primary} w-full`} pendingLabel="common.saving">
            {t("setup.submit")}
          </SubmitButton>
        </ActionForm>
      )}
    </AuthFrame>
  );
}
