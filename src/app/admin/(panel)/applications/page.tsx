import Link from "next/link";
import { applicationStatusKey, APPLICATION_TONE } from "@/components/admin/status";
import { Badge, buttonClass, EmptyState, inputClass, PageHeader, Pager } from "@/components/admin/ui";
import { formatDate } from "@/lib/admin/format";
import { pick } from "@/lib/site-types";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { APPLICATION_STATUSES, listApplications } from "@/server/applications";
import { requirePermission } from "@/server/auth";
import { listJobs } from "@/server/jobs";

export const metadata = { title: "Applications" };

type Search = { status?: string; job?: string; q?: string; page?: string };

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("applications.view");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const sp = await searchParams;
  const jobFilter = sp.job === "general" ? "general" : Number(sp.job) > 0 ? Number(sp.job) : undefined;
  const result = listApplications({ status: sp.status, jobId: jobFilter, q: sp.q?.slice(0, 100), page: Number(sp.page) || 1 });
  const jobs = listJobs();

  return (
    <>
      <PageHeader title={t("nav.applications")} subtitle={t("apps.subtitle")} />

      <form method="get" className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_200px_240px_auto]">
        <input name="q" defaultValue={sp.q ?? ""} placeholder={t("apps.searchPlaceholder")} className={inputClass} />
        <select name="status" defaultValue={sp.status ?? ""} className={inputClass}>
          <option value="">{t("common.status")}: {t("common.all")}</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>{t(applicationStatusKey(s))}</option>
          ))}
        </select>
        <select name="job" defaultValue={sp.job ?? ""} className={inputClass}>
          <option value="">{t("apps.position")}: {t("common.all")}</option>
          <option value="general">{t("apps.general")}</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{pick(j.title, lang)}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className={buttonClass.primary}>{t("common.filter")}</button>
          {(sp.q || sp.status || sp.job) && <Link href="/admin/applications" className={buttonClass.secondary}>{t("common.clear")}</Link>}
        </div>
      </form>

      <p className="mb-3 text-[13px] text-steel">{t("apps.count", { count: result.total })}</p>

      {result.rows.length === 0 ? (
        <EmptyState>{t("apps.none")}</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[720px] text-[14px]">
            <thead className="bg-white/[0.04] text-[12.5px] text-white/55">
              <tr>
                <th className="px-4 py-3 text-start font-bold">{t("apps.applicant")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("apps.position")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("apps.submitted")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("common.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {result.rows.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/applications/${a.id}`} className="font-bold text-white hover:text-teal">{a.name}</Link>
                    <p dir="ltr" className="text-start text-[12px] text-steel">{a.email}</p>
                  </td>
                  <td className="px-4 py-3 text-white/85">{a.jobTitle ? pick(a.jobTitle, lang) : t("apps.general")}</td>
                  <td className="px-4 py-3 text-[12.5px] text-steel">{formatDate(a.createdAt, lang)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={APPLICATION_TONE[a.status]}>{t(applicationStatusKey(a.status))}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pager
        page={result.page}
        pages={result.pages}
        base="/admin/applications"
        params={{ q: sp.q, status: sp.status, job: sp.job }}
        labels={{ previous: t("common.previous"), next: t("common.next"), of: t("common.of") }}
      />
    </>
  );
}
