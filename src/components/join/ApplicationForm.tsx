"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { submitApplication } from "@/actions/apply";

const input =
  "w-full rounded-[14px] border border-white/15 bg-navy-deep/70 px-4 py-3 text-[15px] text-white placeholder:text-white/35 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/25";
const label = "mb-1.5 block text-[14px] font-bold text-iceblue";

export default function ApplicationForm({ jobs }: { jobs: { id: number; title: string }[] }) {
  const t = useTranslations("SubmitCV");
  const locale = useLocale();
  const [state, dispatch, pending] = useActionState(submitApplication, null);
  const [jobId, setJobId] = useState("");
  const [fileName, setFileName] = useState("");
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // "Apply" on a job card selects that job here
  useEffect(() => {
    const onApply = (e: Event) => {
      setSent(false);
      setJobId(String((e as CustomEvent<number>).detail));
    };
    window.addEventListener("takamol:apply", onApply);
    return () => window.removeEventListener("takamol:apply", onApply);
  }, []);

  useEffect(() => {
    if (state?.ok) {
      setSent(true);
      formRef.current?.reset();
      setFileName("");
      setJobId("");
    }
  }, [state]);

  // submit without React's automatic form reset, so a rejected form keeps its input
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };

  if (sent) {
    return (
      <div role="status" className="mt-8 rounded-[20px] border border-teal/40 bg-teal/10 p-7 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal text-navy">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
        </div>
        <p className="mt-4 text-[16px] font-bold leading-relaxed text-white">{t("success")}</p>
        <button type="button" onClick={() => setSent(false)} className="mt-4 text-[14px] font-bold text-teal underline-offset-4 hover:underline">
          {t("another")}
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-8 grid grid-cols-1 gap-5 text-start md:grid-cols-2" noValidate>
      <input type="hidden" name="locale" value={locale} />
      {/* bots fill every field; people never see this one */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="ap-name" className={label}>{t("name")} *</label>
        <input id="ap-name" name="name" required autoComplete="name" maxLength={120} className={input} />
      </div>
      <div>
        <label htmlFor="ap-email" className={label}>{t("email")} *</label>
        <input id="ap-email" name="email" type="email" required autoComplete="email" dir="ltr" maxLength={200} className={`${input} text-start font-exo`} />
      </div>
      <div>
        <label htmlFor="ap-phone" className={label}>{t("phone")} *</label>
        <input id="ap-phone" name="phone" type="tel" required autoComplete="tel" dir="ltr" maxLength={40} className={`${input} text-start font-exo`} />
      </div>
      <div>
        <label htmlFor="ap-job" className={label}>{t("position")}</label>
        <select id="ap-job" name="job" value={jobId} onChange={(e) => setJobId(e.target.value)} className={input}>
          <option value="">{t("general")}</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <label htmlFor="ap-linkedin" className={label}>{t("linkedin")}</label>
        <input id="ap-linkedin" name="linkedin" type="url" dir="ltr" placeholder="https://www.linkedin.com/in/…" maxLength={300} className={`${input} text-start font-exo`} />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="ap-message" className={label}>{t("message")}</label>
        <textarea id="ap-message" name="message" rows={4} maxLength={3000} className={input} />
      </div>
      <div className="md:col-span-2">
        <span className={label}>{t("cv")} *</span>
        <label
          htmlFor="ap-cv"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-teal/40 bg-teal/[0.05] px-4 py-6 text-center transition-colors hover:border-teal hover:bg-teal/10"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-teal"><path d="M5 20h14v-2H5v2zm7-18-5.5 5.5 1.41 1.41L11 5.83V16h2V5.83l3.09 3.08 1.41-1.41L12 2z" /></svg>
          <span className="text-[15px] font-bold text-white">{fileName || t("cvChoose")}</span>
          <span className="text-[13px] text-steel">{t("cvHint")}</span>
        </label>
        <input
          id="ap-cv"
          name="cv"
          type="file"
          required
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        />
      </div>
      <label className="flex items-start gap-3 text-[14px] leading-relaxed text-iceblue md:col-span-2">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-teal" />
        <span>{t("consent")}</span>
      </label>

      {state && !state.ok && state.error && (
        <p role="alert" className="rounded-[12px] border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-[14px] text-rose-200 md:col-span-2">
          {t(state.error)}
        </p>
      )}

      <div className="flex justify-center md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-[16px] bg-teal px-10 py-4 text-[16px] font-bold text-navy transition-all hover:bg-teal-cyan hover:shadow-[0_0_30px_rgba(0,180,172,.4)] disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? t("sending") : t("submit")}
        </button>
      </div>
    </form>
  );
}
