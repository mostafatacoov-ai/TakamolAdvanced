import Link from "next/link";
import { Icon } from "@/components/admin/icons";
import { Badge, Banner, buttonClass, PageHeader } from "@/components/admin/ui";
import { PERMISSIONS } from "@/lib/admin/permissions";
import { pick } from "@/lib/site-types";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { listRoles } from "@/server/users";

export const metadata = { title: "Roles" };

export default async function RolesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requirePermission("roles.manage");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const roles = listRoles();
  const { saved } = await searchParams;

  return (
    <>
      <PageHeader
        title={t("nav.roles")}
        subtitle={t("roles.subtitle")}
        actions={
          <Link href="/admin/roles/new" className={buttonClass.primary}>
            <Icon name="plus" className="h-4 w-4" />
            {t("roles.new")}
          </Link>
        }
      />
      {saved && <Banner tone="green" icon="check">{t("msg.created")}</Banner>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((r) => (
          <Link
            key={r.id}
            href={`/admin/roles/${r.id}`}
            className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-teal/40 hover:bg-white/[0.06]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[16px] font-bold text-white group-hover:text-teal-cyan">{pick(r.name, lang)}</p>
                <p className="text-[12.5px] text-steel">{pick(r.name, lang === "ar" ? "en" : "ar")}</p>
              </div>
              {r.locked && <Icon name="lock" className="h-5 w-5 text-amber-200" />}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="teal">{t("roles.permCount", { count: r.locked ? PERMISSIONS.length : r.permissions.length })}</Badge>
              <Badge tone="gray">{t("roles.usersCount", { count: r.users })}</Badge>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
