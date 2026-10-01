import { getLocale, getTranslations } from "next-intl/server";
import Image from "@/components/SiteImage";
import { pick } from "@/lib/site-types";
import { listJobs } from "@/server/jobs";
import ApplyButton from "./ApplyButton";

/* Open positions (managed in the admin area). A job with a post image shows
   it like the LinkedIn cards from the design; others get a themed card. */
export default async function Jobs() {
  const t = await getTranslations("Jobs");
  const locale = await getLocale();
  const jobs = listJobs({ openOnly: true });

  return (
    <section id="jobs" className="relative overflow-hidden py-14 md:py-20">
      <div className="absolute inset-x-0 top-1/2 h-[135%] -translate-y-1/2 bg-gradient-to-b from-navy via-navy-deep to-navy" />

      <div className="container-tk relative">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="sec-title glow-title">{t("title")}</h2>
            <div className="glow-bar mt-4 h-[4px] w-24 rounded-full bg-teal" />
          </div>
          <p className="sec-sub max-w-[640px] md:pb-3">{t("subtitle")}</p>
        </div>

        {jobs.length === 0 ? (
          <p className="mt-10 rounded-[20px] border border-white/10 bg-white/[0.04] p-6 text-center text-[15px] text-steel">
            {t("noJobs")}
          </p>
        ) : (
          <div className="stagger mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {jobs.map((job) => {
              const title = pick(job.title, locale);
              const meta = [pick(job.location, locale), pick(job.type, locale)].filter(Boolean);
              return job.image ? (
                <article
                  key={job.id}
                  className="group flex flex-col overflow-hidden rounded-[20px] bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(0,0,0,.45)]"
                >
                  <div className="relative aspect-[800/640] w-full">
                    <Image
                      src={job.image}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-3 border-t border-black/5 px-5 py-4">
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-bold leading-snug text-navy">{title}</h3>
                      {meta.length > 0 && <p className="mt-0.5 text-[12.5px] text-navy/60">{meta.join(" · ")}</p>}
                    </div>
                    <ApplyButton
                      jobId={job.id}
                      className="shrink-0 rounded-full bg-[#0A66C2] px-5 py-2 text-[14px] font-semibold text-white transition-all hover:brightness-110"
                    >
                      {t("apply")}
                    </ApplyButton>
                  </div>
                </article>
              ) : (
                <article
                  key={job.id}
                  className="flex flex-col rounded-[20px] border border-teal/30 bg-[#062a3d]/80 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-teal/60"
                >
                  <h3 className="text-[19px] font-bold leading-snug text-white">{title}</h3>
                  {meta.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {meta.map((m) => (
                        <span key={m} className="rounded-full border border-teal/40 bg-teal/10 px-3 py-0.5 text-[12.5px] text-teal-cyan">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-4 flex-1 whitespace-pre-line text-[14px] leading-[1.85] text-steel">{pick(job.description, locale)}</p>
                  <ApplyButton
                    jobId={job.id}
                    className="mt-6 self-start rounded-full bg-teal px-6 py-2 text-[14px] font-bold text-navy transition-colors hover:bg-teal-cyan"
                  >
                    {t("apply")}
                  </ApplyButton>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
