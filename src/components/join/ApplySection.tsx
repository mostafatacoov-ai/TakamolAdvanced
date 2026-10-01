import { getLocale, getTranslations } from "next-intl/server";
import { mailtoHref } from "@/lib/links";
import { pick } from "@/lib/site-types";
import { listJobs } from "@/server/jobs";
import { getSiteSettings } from "@/server/site";
import ApplicationForm from "./ApplicationForm";

/* Application form: applicants pick an open job (or apply generally) and
   upload their CV; submissions appear in the admin area. */
export default async function ApplySection() {
  const t = await getTranslations("SubmitCV");
  const locale = await getLocale();
  const jobs = listJobs({ openOnly: true }).map((j) => ({ id: j.id, title: pick(j.title, locale) }));
  const { requestsEmail } = getSiteSettings();

  return (
    <section id="apply" className="relative scroll-mt-28 py-14 md:py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[760px] -translate-x-1/2 rounded-full bg-teal/[0.08] blur-[150px]" />

      <div className="container-tk relative">
        <div className="mx-auto max-w-[920px] rounded-[28px] border border-teal/25 bg-white/[0.04] p-6 md:p-10">
          <div className="text-center">
            <div className="glow-pulse mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full bg-gradient-to-br from-teal to-teal-cyan text-navy shadow-[0_14px_36px_rgba(0,180,172,.35)]">
              <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
                <path d="M19 15v4H5v-4H3v6h18v-6h-2zm-1-8-6 6-6-6h4V3h4v4h4z" />
              </svg>
            </div>
            <h2 className="glow-title mt-5 text-[24px] font-bold text-white md:text-[30px]">{t("title")}</h2>
            <p className="mx-auto mt-4 max-w-[640px] text-[15px] font-light leading-[1.9] text-steel md:text-[17px]">
              {t("description")}
            </p>
          </div>

          <ApplicationForm jobs={jobs} />

          <p className="mt-8 text-center text-[14px] font-light text-steel">
            {t("hint")}{" "}
            <a
              href={mailtoHref(requestsEmail, t("mailSubject"), t("mailBody"))}
              dir="ltr"
              className="font-exo font-medium text-teal hover:text-teal-cyan"
            >
              {requestsEmail}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
