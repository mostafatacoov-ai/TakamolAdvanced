import Image from "next/image";
import { Link } from "@/navigation";
import { useTranslations, useLocale } from "next-intl";

const REPORTS = [
  {
    img: "/assets/report-4.png",
    titleKey: "r1Title",
    questionKey: "r1Question",
    descKey: "r1Desc",
    href: "/knowledge/promising-saudi-cities",
  },
  {
    img: "/assets/report-3.png",
    titleKey: "r2Title",
    questionKey: "r2Question",
    descKey: "r2Desc",
    href: "/knowledge/takamol-real-estate-index",
  },
  {
    img: "/assets/report-2.png",
    titleKey: "r3Title",
    questionKey: "r3Question",
    descKey: "r3Desc",
    href: "/knowledge/mega-projects-impact",
  },
  {
    img: "/assets/report-1.png",
    titleKey: "r4Title",
    questionKey: "r4Question",
    descKey: "r4Desc",
    href: "/knowledge/proptech-revolution",
  },
];

export default function Knowledge() {
  const t = useTranslations("Knowledge");
  const locale = useLocale();

  return (
    <section id="knowledge" className="relative py-14 md:py-16" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container-tk relative">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="sec-title glow-title">{t("title")}</h2>
            <div className="glow-bar mt-4 h-[4px] w-24 rounded-full bg-teal" />
          </div>
          <Link href="/knowledge" className="teal-link md:pb-3">
            {t("viewMore")}
            <span className={`text-[30px] leading-none ${locale === 'en' ? 'rotate-180' : ''}`}>‹</span>
          </Link>
        </div>

        <div className="stagger mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {REPORTS.map((r) => (
            <article
              key={r.titleKey}
              className={`group flex flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-2 hover:border-teal/50 hover:shadow-[0_24px_60px_rgba(0,0,0,.35)] ${locale === 'en' ? 'text-left' : 'text-right'}`}
            >
              {/* cover */}
              <div className="relative aspect-[410/400] w-full overflow-hidden">
                <Image
                  src={r.img}
                  alt={t(r.titleKey as any)}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-transparent to-transparent" />
              </div>

              {/* body */}
              <div className="flex flex-1 flex-col p-4 pt-3">
                <h3 className="text-[15px] font-bold leading-snug text-white md:text-[17px]">
                  {t(r.titleKey as any)}
                </h3>
                <p className="mt-2 text-[13.5px] font-bold leading-relaxed text-iceblue md:text-[14.5px]">
                  {t(r.questionKey as any)}
                </p>
                <p className="mt-1 text-[12.5px] font-light leading-relaxed text-steel md:text-[13px]">
                  {t(r.descKey as any)}
                </p>

                <Link
                  href={r.href}
                  className={`mt-auto flex w-full items-center justify-center gap-2 rounded-[12px] border border-teal/50 bg-teal/10 py-2.5 text-[14px] md:text-[15px] font-light text-white transition-all duration-300 hover:bg-teal hover:font-bold hover:text-navy ${locale === 'en' ? 'flex-row-reverse' : ''}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 fill-current ${locale === 'en' ? 'rotate-180' : ''}`}
                  >
                    <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                  </svg>
                  {t("readMore")}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
