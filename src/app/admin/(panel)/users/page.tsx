import Link from "next/link";
import { Icon } from "@/components/admin/icons";
import { Badge, buttonClass, PageHeader } from "@/components/admin/ui";
import { formatDate } from "@/lib/admin/format";
import { pick } from "@/lib/site-types";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { listUsers } from "@/server/users";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const me = await requirePermission("users.manage");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const users = listUsers();

  return (
    <>
      <PageHeader
        title={t("nav.users")}
        subtitle={t("users.subtitle")}
        actions={
          <Link href="/admin/users/new" className={buttonClass.primary}>
            <Icon name="plus" className="h-4 w-4" />
            {t("users.new")}
          </Link>
        }
      />
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-[14px]">
          <thead className="bg-white/[0.04] text-[12.5px] text-white/55">
            <tr>
              <th className="px-4 py-3 text-start font-bold">{t("common.name")}</th>
              <th className="px-4 py-3 text-start font-bold">{t("users.role")}</th>
              <th className="px-4 py-3 text-start font-bold">{t("common.status")}</th>
              <th className="px-4 py-3 text-start font-bold">{t("users.lastLogin")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <p className="font-bold text-white">
                    {u.name} {u.id === me.id && <span className="text-[12px] font-normal text-teal">({t("users.you")})</span>}
                  </p>
                  <p dir="ltr" className="text-start text-[12px] text-steel">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-white/85">{pick(u.roleName, lang)}</td>
                <td className="px-4 py-3">
                  <Badge tone={u.active ? "green" : "gray"}>{t(u.active ? "users.active" : "users.disabled")}</Badge>
                </td>
                <td className="px-4 py-3 text-[12.5px] text-steel">{u.lastLoginAt ? formatDate(u.lastLoginAt, lang) : t("users.never")}</td>
                <td className="px-4 py-3 text-end">
                  <Link href={`/admin/users/${u.id}`} className={buttonClass.small}>
                    <Icon name="edit" className="h-3.5 w-3.5" />
                    {t("common.edit")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
