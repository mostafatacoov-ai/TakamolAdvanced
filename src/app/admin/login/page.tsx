import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/admin/AuthFrame";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { buttonClass, Field, inputClass } from "@/components/admin/ui";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { getCurrentUser } from "@/server/auth";
import { countUsers } from "@/server/users";
import { login } from "../_actions/auth";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const noUsers = countUsers() === 0;

  return (
    <AuthFrame title={t("login.title")} subtitle={t("login.subtitle")} lang={lang} switchLabel={t("lang.switch")}>
      {noUsers ? (
        <div className="space-y-4 text-[14px] text-steel">
          <p>{t("login.noUsers")}</p>
          <Link href="/admin/setup" className={buttonClass.primary}>{t("login.setupLink")}</Link>
        </div>
      ) : (
        <ActionForm action={login} className="space-y-4">
          <Field label={t("common.email")} htmlFor="email">
            <input id="email" name="email" type="email" autoComplete="username" dir="ltr" required className={`${inputClass} text-start`} />
          </Field>
          <Field label={t("field.password")} htmlFor="password">
            <input id="password" name="password" type="password" autoComplete="current-password" dir="ltr" required className={`${inputClass} text-start`} />
          </Field>
          <SubmitButton className={`${buttonClass.primary} w-full`} pendingLabel="common.saving">
            {t("login.submit")}
          </SubmitButton>
        </ActionForm>
      )}
    </AuthFrame>
  );
}
