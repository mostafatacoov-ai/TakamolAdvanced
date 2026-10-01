import { notFound } from "next/navigation";
import { ActionForm, FieldError, SubmitButton } from "@/components/admin/forms";
import { Icon } from "@/components/admin/icons";
import { PasswordField } from "@/components/admin/PasswordField";
import { Card, cx, Field, inputClass, PageHeader } from "@/components/admin/ui";
import { pick } from "@/lib/site-types";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { getUser, listRoles } from "@/server/users";
import { deleteUserAction, resetPasswordAction, saveUserAction } from "../../../_actions/people";

export const metadata = { title: "User" };

export default async function UserFormPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePermission("users.manage");
  const raw = (await params).id;
  const id = raw === "new" ? null : Number(raw);
  const user = id ? getUser(id) : null;
  if (id !== null && !user) notFound();
  const t = await getAdminT();
  const lang = await getAdminLang();
  const roles = listRoles();
  const isMe = user?.id === me.id;

  return (
    <>
      <PageHeader title={user ? user.name : t("users.new")} back={{ href: "/admin/users", label: t("nav.users") }} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <Card title={t(user ? "users.edit" : "users.new")}>
          <ActionForm action={saveUserAction.bind(null, user?.id ?? null)} resetOnSuccess={!user} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label={t("common.name")} htmlFor="name">
                <input id="name" name="name" defaultValue={user?.name} className={inputClass} />
                <FieldError name="name" />
              </Field>
              <Field label={t("common.email")} htmlFor="email">
                <input id="email" name="email" type="email" defaultValue={user?.email} dir="ltr" className={cx(inputClass, "text-start")} />
                <FieldError name="email" />
              </Field>
              <Field label={t("users.role")} htmlFor="roleId">
                <select id="roleId" name="roleId" defaultValue={user?.roleId ?? roles.find((r) => r.key === "content_manager")?.id} className={inputClass}>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{pick(r.name, lang)}</option>
                  ))}
                </select>
                <FieldError name="roleId" />
              </Field>
              {user ? (
                <Field label={t("common.status")} hint={t("users.activeHint")}>
                  <label className="inline-flex cursor-pointer items-center gap-2 pt-2.5 text-[14px] font-bold text-white">
                    <input type="checkbox" name="active" defaultChecked={user.active} disabled={isMe} className="h-4 w-4 accent-teal" />
                    {t("users.active")}
                  </label>
                  {isMe && <input type="hidden" name="active" value="on" />}
                </Field>
              ) : (
                <Field label={t("users.tempPassword")} hint={t("users.tempHint")}>
                  <PasswordField name="password" />
                  <FieldError name="password" />
                </Field>
              )}
            </div>
            <SubmitButton pendingLabel="common.saving">{t(user ? "common.save" : "common.create")}</SubmitButton>
          </ActionForm>
        </Card>

        {user && !isMe && (
          <div className="space-y-6">
            <Card title={t("users.resetPassword")} description={t("users.tempHint")}>
              <ActionForm action={resetPasswordAction.bind(null, user.id)}>
                <SubmitButton variant="secondary" confirm="users.resetPassword">
                  <Icon name="lock" className="h-4 w-4" />
                  {t("users.resetPassword")}
                </SubmitButton>
              </ActionForm>
            </Card>
            <ActionForm action={deleteUserAction}>
              <input type="hidden" name="id" value={user.id} />
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
