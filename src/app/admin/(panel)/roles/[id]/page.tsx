import { notFound } from "next/navigation";
import { ActionForm, FieldError, SubmitButton } from "@/components/admin/forms";
import { Icon } from "@/components/admin/icons";
import { Banner, Card, cx, Field, inputClass, PageHeader } from "@/components/admin/ui";
import type { AdminKey } from "@/lib/admin/i18n";
import { PERMISSION_GROUPS } from "@/lib/admin/permissions";
import { pick } from "@/lib/site-types";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { getRole } from "@/server/users";
import { deleteRoleAction, saveRoleAction } from "../../../_actions/people";

export const metadata = { title: "Role" };

export default async function RoleFormPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("roles.manage");
  const raw = (await params).id;
  const id = raw === "new" ? null : Number(raw);
  const role = id ? getRole(id) : null;
  if (id !== null && !role) notFound();
  const t = await getAdminT();
  const lang = await getAdminLang();
  const locked = !!role?.locked;

  return (
    <>
      <PageHeader title={role ? pick(role.name, lang) : t("roles.new")} back={{ href: "/admin/roles", label: t("nav.roles") }} />
      {locked && <Banner tone="amber" icon="lock">{t("roles.locked")}</Banner>}
      <Card>
        <ActionForm action={saveRoleAction.bind(null, role?.id ?? null)} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label={t("roles.nameAr")} htmlFor="name_ar">
              <input id="name_ar" name="name_ar" dir="rtl" defaultValue={role?.name.ar} disabled={locked} className={inputClass} />
              <FieldError name="name_ar" />
            </Field>
            <Field label={t("roles.nameEn")} htmlFor="name_en">
              <input id="name_en" name="name_en" dir="ltr" defaultValue={role?.name.en} disabled={locked} className={cx(inputClass, "text-left")} />
            </Field>
          </div>

          <div>
            <p className="mb-3 text-[14px] font-bold text-iceblue">{t("roles.permissions")}</p>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {PERMISSION_GROUPS.map((group) => (
                <fieldset key={group.key} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <legend className="px-1 text-[13px] font-bold text-white">{t(`perm.group.${group.key}` as AdminKey)}</legend>
                  <div className="space-y-3">
                    {group.permissions.map((perm) => (
                      <label key={perm} className="flex cursor-pointer items-start gap-3 text-[13.5px] leading-snug text-white/85">
                        <input
                          type="checkbox"
                          name="perm"
                          value={perm}
                          defaultChecked={locked || role?.permissions.includes(perm)}
                          disabled={locked}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-teal"
                        />
                        {t(`perm.${perm}` as AdminKey)}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </div>

          {!locked && <SubmitButton pendingLabel="common.saving">{t(role ? "common.save" : "common.create")}</SubmitButton>}
        </ActionForm>
      </Card>

      {role && !locked && (
        <div className="mt-6">
          <ActionForm action={deleteRoleAction}>
            <input type="hidden" name="id" value={role.id} />
            <SubmitButton variant="danger" confirm="common.confirmDelete">
              <Icon name="trash" className="h-4 w-4" />
              {t("common.delete")}
            </SubmitButton>
          </ActionForm>
        </div>
      )}
    </>
  );
}
