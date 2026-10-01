import { EmptyState, PageHeader, Pager } from "@/components/admin/ui";
import { formatDate } from "@/lib/admin/format";
import { isAdminKey } from "@/lib/admin/i18n";
import { listActivity } from "@/server/activity";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";

export const metadata = { title: "Activity" };

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePermission("activity.view");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { rows, pages } = listActivity(page);

  return (
    <>
      <PageHeader title={t("nav.activity")} subtitle={t("activity.subtitle")} />
      {rows.length === 0 ? (
        <EmptyState>{t("activity.none")}</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[680px] text-[14px]">
            <thead className="bg-white/[0.04] text-[12.5px] text-white/55">
              <tr>
                <th className="px-4 py-3 text-start font-bold">{t("activity.time")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("activity.user")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("activity.action")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("activity.target")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((r) => {
                const key = `act.${r.action}`;
                return (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-[12.5px] text-steel">{formatDate(r.createdAt, lang)}</td>
                    <td className="px-4 py-3 font-bold text-white">{r.userName || "—"}</td>
                    <td className="px-4 py-3 text-white/85">{isAdminKey(key) ? t(key) : r.action}</td>
                    <td className="px-4 py-3 text-[13px] text-steel"><bdi>{r.target}</bdi></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Pager
        page={page}
        pages={pages}
        base="/admin/activity"
        params={{}}
        labels={{ previous: t("common.previous"), next: t("common.next"), of: t("common.of") }}
      />
    </>
  );
}
