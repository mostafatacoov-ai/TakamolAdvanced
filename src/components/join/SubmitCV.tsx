import { useTranslations } from "next-intl";
import { CAREERS_EMAIL, mailto } from "@/lib/contact";

export default function SubmitCV() {
  const t = useTranslations("SubmitCV");
  return (
    <section className="relative py-14 md:py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[760px] -translate-x-1/2 rounded-full bg-teal/[0.08] blur-[150px]" />

      <div className="container-tk relative">
        <div className="mx-auto max-w-[920px] rounded-[28px] border border-teal/25 bg-white/[0.04] p-7 text-center md:p-10">
          <div className="glow-pulse mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full bg-gradient-to-br from-teal to-teal-cyan text-navy shadow-[0_14px_36px_rgba(0,180,172,.35)]">
            <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
              <path d="M19 15v4H5v-4H3v6h18v-6h-2zm-1-8-6 6-6-6h4V3h4v4h4z" />
            </svg>
          </div>

          <h2 className="glow-title mt-5 text-[24px] font-bold text-white md:text-[30px]">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-[640px] text-[15px] font-light leading-[1.9] text-steel md:text-[17px]">
            {t("description")}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4">
            <a
              href={mailto(t("mailSubject"), t("mailBody"))}
              className="inline-flex items-center gap-2 rounded-[16px] bg-teal px-8 py-4 text-[16px] font-bold text-navy transition-all hover:bg-teal-cyan hover:shadow-[0_0_30px_rgba(0,180,172,.4)]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              {t("button")}
            </a>
            <p className="text-[14px] font-light text-steel">
              {t("hint")}{" "}
              <a
                href={`mailto:${CAREERS_EMAIL}`}
                dir="ltr"
                className="font-exo font-medium text-teal hover:text-teal-cyan"
              >
                {CAREERS_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
