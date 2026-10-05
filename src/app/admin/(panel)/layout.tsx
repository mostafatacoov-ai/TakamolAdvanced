import Link from "next/link";
import type { ReactNode } from "react";
import { Sidebar, type SidebarGroup } from "@/components/admin/Sidebar";
import { Banner } from "@/components/admin/ui";
import { pick } from "@/lib/site-types";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { countNewApplications } from "@/server/applications";
import { countDraftReports } from "@/server/kpi";
import { countNewQuotations } from "@/server/quotations";
import { can, requireUser } from "@/server/auth";

export const dynamic = "force-dynamic";

type Item = SidebarGroup["items"][number];
const only = (...items: (Item | false)[]) => items.filter((i): i is Item => i !== false);

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const t = await getAdminT();
  const lang = await getAdminLang();

  const allGroups: SidebarGroup[] = [
    { items: [{ href: "/admin", label: t("nav.dashboard"), icon: "dashboard" }] },
    {
      label: t("nav.group.content"),
      items: only(
        can(user, "content.edit") && { href: "/admin/texts", label: t("nav.texts"), icon: "texts" },
        can(user, "media.manage") && { href: "/admin/images", label: t("nav.images"), icon: "images" },
        can(user, "pages.manage") && { href: "/admin/pages", label: t("nav.pages"), icon: "pages" },
        can(user, "navigation.manage") && { href: "/admin/menu", label: t("nav.menu"), icon: "menu" },
        can(user, "content.edit") && { href: "/admin/partners", label: t("nav.partners"), icon: "partners" },
      ),
    },
    {
      label: t("nav.group.careers"),
      items: only(
        can(user, "jobs.manage") && { href: "/admin/jobs", label: t("nav.jobs"), icon: "jobs" },
        can(user, "applications.view") && {
          href: "/admin/applications", label: t("nav.applications"), icon: "applications", badge: countNewApplications(),
        },
      ),
    },
    {
      label: t("nav.group.sales"),
      items: only(
        can(user, "quotations.view") && {
          href: "/admin/quotations", label: t("nav.quotations"), icon: "quotes", badge: countNewQuotations(),
        },
      ),
    },
    {
      label: t("nav.group.kpi"),
      items: only(
        can(user, "kpi.view") && { href: "/admin/kpi", label: t("nav.kpi"), icon: "kpi", badge: countDraftReports() },
        can(user, "kpi.view") && { href: "/admin/kpi/people", label: t("nav.kpiPeople"), icon: "users" },
        can(user, "kpi.manage") && { href: "/admin/kpi/team", label: t("nav.kpiTeam"), icon: "partners" },
      ),
    },
    {
      label: t("nav.group.admin"),
      items: only(
        can(user, "users.manage") && { href: "/admin/users", label: t("nav.users"), icon: "users" },
        can(user, "roles.manage") && { href: "/admin/roles", label: t("nav.roles"), icon: "roles" },
        can(user, "settings.manage") && { href: "/admin/settings", label: t("nav.settings"), icon: "settings" },
        can(user, "activity.view") && { href: "/admin/activity", label: t("nav.activity"), icon: "activity" },
      ),
    },
  ];
  const groups = allGroups.filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar groups={groups} user={{ name: user.name, role: pick(user.roleName, lang) }} />
      <div className="min-w-0 flex-1">
        <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {user.mustChangePassword && (
            <Banner tone="amber" icon="lock">
              {t("msg.tempPassword")}{" "}
              <Link href="/admin/account" className="font-bold underline underline-offset-4">{t("account.password")}</Link>
            </Banner>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
