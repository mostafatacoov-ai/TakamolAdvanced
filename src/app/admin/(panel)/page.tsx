import Link from "next/link";
import { applicationStatusKey, APPLICATION_TONE } from "@/components/admin/status";
import { Badge, Banner, Card, EmptyState, PageHeader, StatCard } from "@/components/admin/ui";
import { formatDate } from "@/lib/admin/format";
import { isAdminKey } from "@/lib/admin/i18n";
import { pick } from "@/lib/site-types";
import { recentActivity } from "@/server/activity";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { countNewApplications, recentApplications } from "@/server/applications";
import { can, requireUser } from "@/server/auth";
import { countEditedTexts } from "@/server/content";
import { countReplacedImages } from "@/server/images";
import { countOpenJobs } from "@/server/jobs";
import { countPages } from "@/server/pages";
import { countDraftReports } from "@/server/kpi";
import { countNewQuotations } from "@/server/quotations";
import { countUsers } from "@/server/users";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const t = await getAdminT();
  const lang = await getAdminLang();
  const { denied } = await searchParams;

  const showApplications = can(user, "applications.view");
  const showActivity = can(user, "activity.view");

  return (
    <>
      {denied && <Banner tone="amber" icon="lock">{t("msg.denied")}</Banner>}
      <PageHeader title={t("dash.hello", { name: user.name.split(" ")[0] })} subtitle={t("dash.subtitle")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {showApplications && (
          <StatCard label={t("dash.newApplications")} value={countNewApplications()} href="/admin/applications?status=new" icon="applications" />
        )}
        {can(user, "quotations.view") && (
          <StatCard label={t("dash.newQuotations")} value={countNewQuotations()} href="/admin/quotations?status=new" icon="quotes" tone="amber" />
        )}
        {can(user, "kpi.view") && (
          <StatCard label={t("dash.draftReports")} value={countDraftReports()} href="/admin/kpi?status=draft" icon="kpi" tone="blue" />
        )}
        {can(user, "jobs.manage") && (
          <StatCard label={t("dash.openJobs")} value={countOpenJobs()} href="/admin/jobs" icon="jobs" tone="blue" />
        )}
        {can(user, "pages.manage") && (
          <StatCard label={t("dash.pages")} value={countPages()} href="/admin/pages" icon="pages" tone="amber" />
        )}
        {can(user, "content.edit") && (
          <StatCard label={t("dash.editedTexts")} value={countEditedTexts()} href="/admin/texts" icon="texts" tone="green" />
        )}
        {can(user, "media.manage") && (
          <StatCard label={t("dash.replacedImages")} value={countReplacedImages()} href="/admin/images" icon="images" tone="blue" />
        )}
        {can(user, "users.manage") && (
          <StatCard label={t("dash.users")} value={countUsers()} href="/admin/users" icon="users" tone="gray" />
        )}
      </div>

      {(showApplications || showActivity) && (
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {showApplications && (
            <Card
              title={t("dash.recentApplications")}
              actions={<Link href="/admin/applications" className="text-[13px] font-bold text-teal hover:text-teal-cyan">{t("common.view")}</Link>}
            >
              {(() => {
                const apps = recentApplications(6);
                if (!apps.length) return <EmptyState>{t("dash.noApplications")}</EmptyState>;
                return (
                  <ul className="divide-y divide-white/10">
                    {apps.map((a) => (
                      <li key={a.id}>
                        <Link href={`/admin/applications/${a.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-teal">
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-bold text-white">{a.name}</p>
                            <p className="truncate text-[12.5px] text-steel">
                              {a.jobTitle ? pick(a.jobTitle, lang) : t("apps.general")} · {formatDate(a.createdAt, lang)}
                            </p>
                          </div>
                          <Badge tone={APPLICATION_TONE[a.status]}>{t(applicationStatusKey(a.status))}</Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </Card>
          )}
          {showActivity && (
            <Card
              title={t("dash.recentActivity")}
              actions={<Link href="/admin/activity" className="text-[13px] font-bold text-teal hover:text-teal-cyan">{t("common.view")}</Link>}
            >
              {(() => {
                const rows = recentActivity(8);
                if (!rows.length) return <EmptyState>{t("activity.none")}</EmptyState>;
                return (
                  <ul className="divide-y divide-white/10">
                    {rows.map((r) => {
                      const key = `act.${r.action}`;
                      return (
                        <li key={r.id} className="flex items-start justify-between gap-3 py-3 text-[13.5px]">
                          <p className="min-w-0 text-white/85">
                            <span className="font-bold text-white">{r.userName || "—"}</span>{" "}
                            {isAdminKey(key) ? t(key) : r.action}
                            {r.target && <span className="text-steel"> · <bdi>{r.target}</bdi></span>}
                          </p>
                          <span className="shrink-0 text-[12px] text-white/45">{formatDate(r.createdAt, lang)}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              })()}
            </Card>
          )}
        </div>
      )}
    </>
  );
}
