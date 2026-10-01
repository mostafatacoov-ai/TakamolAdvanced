import { NavEditor } from "@/components/admin/NavEditor";
import { PageHeader } from "@/components/admin/ui";
import { BUILTIN_LINKS } from "@/lib/site-defaults";
import { getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { listPages } from "@/server/pages";
import { getNavigation } from "@/server/site";
import { saveMenu } from "../../_actions/content";

export const metadata = { title: "Menu tabs" };

export default async function MenuPage() {
  await requirePermission("navigation.manage");
  const t = await getAdminT();
  const customPages = listPages()
    .filter((p) => p.status === "published")
    .map((p) => ({ href: `/${p.slug}`, label: p.title }));

  return (
    <>
      <PageHeader title={t("nav.menu")} subtitle={t("menu.subtitle")} />
      <NavEditor items={getNavigation()} sitePages={BUILTIN_LINKS} customPages={customPages} action={saveMenu} />
    </>
  );
}
