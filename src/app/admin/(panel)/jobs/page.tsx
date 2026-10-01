import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { Icon } from "@/components/admin/icons";
import { Badge, Banner, buttonClass, EmptyState, PageHeader } from "@/components/admin/ui";
import { pick } from "@/lib/site-types";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { can, requirePermission } from "@/server/auth";
import { listJobs } from "@/server/jobs";
import { jobListAction } from "../../_actions/careers";

export const metadata = { title: "Jobs" };

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const user = await requirePermission("jobs.manage");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const jobs = listJobs();
  const { saved } = await searchParams;
  const canSeeApplications = can(user, "applications.view");

  return (
    <>
      <PageHeader
        title={t("nav.jobs")}
        subtitle={t("jobs.subtitle")}
        actions={
          <Link href="/admin/jobs/new" className={buttonClass.primary}>
            <Icon name="plus" className="h-4 w-4" />
            {t("jobs.new")}
          </Link>
        }
      />
      {saved && <Banner tone="green" icon="check">{t("msg.created")}</Banner>}

      {jobs.length === 0 ? (
        <EmptyState>{t("jobs.none")}</EmptyState>
      ) : (
        <ActionForm action={jobListAction} className="space-y-3">
          {jobs.map((job, i) => (
            <div key={job.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/jobs/${job.id}`} className="text-[15px] font-bold text-white hover:text-teal">
                    {pick(job.title, lang)}
                  </Link>
                  <Badge tone={job.status === "open" ? "teal" : "gray"}>
                    {t(job.status === "open" ? "jobs.status.open" : "jobs.status.closed")}
                  </Badge>
                </div>
                <p className="mt-1 text-[12.5px] text-steel">
                  {[pick(job.title, lang === "ar" ? "en" : "ar"), pick(job.location, lang), pick(job.type, lang)].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {canSeeApplications && (
                  <Link href={`/admin/applications?job=${job.id}`} className={buttonClass.small}>
                    <Icon name="applications" className="h-3.5 w-3.5" />
                    {t("jobs.applications")}: <span className="font-exo">{job.applications}</span>
                  </Link>
                )}
                <SubmitButton variant="icon" name="intent" value={`up:${job.id}`} disabled={i === 0}>
                  <Icon name="up" className="h-4 w-4" />
                </SubmitButton>
                <SubmitButton variant="icon" name="intent" value={`down:${job.id}`} disabled={i === jobs.length - 1}>
                  <Icon name="down" className="h-4 w-4" />
                </SubmitButton>
                <SubmitButton variant="small" name="intent" value={`${job.status === "open" ? "close" : "open"}:${job.id}`}>
                  {t(job.status === "open" ? "jobs.close" : "jobs.reopen")}
                </SubmitButton>
                <Link href={`/admin/jobs/${job.id}`} className={buttonClass.small}>
                  <Icon name="edit" className="h-3.5 w-3.5" />
                  {t("common.edit")}
                </Link>
                <SubmitButton variant="smallDanger" name="intent" value={`delete:${job.id}`} confirm="common.confirmDelete">
                  <Icon name="trash" className="h-3.5 w-3.5" />
                  {t("common.delete")}
                </SubmitButton>
              </div>
            </div>
          ))}
        </ActionForm>
      )}
    </>
  );
}
