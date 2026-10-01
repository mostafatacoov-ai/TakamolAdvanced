import Link from "next/link";
import { Icon } from "@/components/admin/icons";
import { Badge, buttonClass, EmptyState, PageHeader } from "@/components/admin/ui";
import { formatDate } from "@/lib/admin/format";
import { pick } from "@/lib/site-types";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { listPages } from "@/server/pages";

export const metadata = { title: "Pages" };

export default async function PagesList() {
  await requirePermission("pages.manage");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const pages = listPages();

  return (
    <>
      <PageHeader
        title={t("nav.pages")}
        subtitle={t("pages.subtitle")}
        actions={
          <Link href="/admin/pages/new" className={buttonClass.primary}>
            <Icon name="plus" className="h-4 w-4" />
            {t("pages.new")}
          </Link>
        }
      />
      {pages.length === 0 ? (
        <EmptyState>{t("pages.none")}</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-[14px]">
            <thead className="bg-white/[0.04] text-[12.5px] text-white/55">
              <tr>
                <th className="px-4 py-3 text-start font-bold">{t("common.title")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("pages.address")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("common.status")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("common.updated")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/pages/${p.id}`} className="font-bold text-white hover:text-teal">{pick(p.title, lang)}</Link>
                    <p className="text-[12px] text-steel">{pick(p.title, lang === "ar" ? "en" : "ar")}</p>
                  </td>
                  <td className="px-4 py-3 font-exo text-[13px] text-white/70" dir="ltr">/{p.slug}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.status === "published" ? "teal" : "amber"}>
                      {t(p.status === "published" ? "pages.status.published" : "pages.status.draft")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-steel">{formatDate(p.updatedAt, lang)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {p.status === "published" && (
                        <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" className={buttonClass.small}>
                          <Icon name="external" className="h-3.5 w-3.5" />
                          {t("pages.view")}
                        </a>
                      )}
                      <Link href={`/admin/pages/${p.id}`} className={buttonClass.small}>
                        <Icon name="edit" className="h-3.5 w-3.5" />
                        {t("common.edit")}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
