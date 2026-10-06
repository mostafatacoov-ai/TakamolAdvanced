import { Link } from "@/navigation";
import { useTranslations, useLocale } from "next-intl";
import { SiteImg } from "@/components/SiteImage";
import { SOCIAL_NETWORKS, socialHref } from "@/lib/social";
import { getSiteSettings } from "@/server/site";


/* Contact details and social links come from the admin area (Site settings). */
export default function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale();
  const settings = getSiteSettings();

  return (
    <footer className="relative mt-32 bg-[#0B202D] font-gess" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div aria-hidden className="glow-bar absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/70 to-transparent" />
      <div className="container-tk relative z-10 px-4 md:px-8">

        {/* Floating Card */}
        <div className="mx-auto w-full max-w-[900px] -translate-y-20 rounded-[28px] bg-gradient-to-br from-[#0c3140] to-[#0f4a56] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,10,20,.4)]">

          {/* Top Row: Logo (Right in RTL) | Socials (Left in RTL) */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-8">

            <div className={`flex flex-col items-start gap-4 ${locale === 'en' ? 'md:items-start' : ''}`}>
              <Link href="/" className="shrink-0">
                <span className="relative inline-block h-[40px] w-[150px]">
                  <SiteImg
                    src="/assets/logo.png"
                    alt="تكامل المتقدمة — Takamol Advanced"
                    className="h-full w-full object-contain"
                  />
                </span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {settings.social.map((s) => {
                const name = s.label || SOCIAL_NETWORKS[s.network].name;
                const href = socialHref(s);
                const external = !href.startsWith("mailto:");
                return (
                  <a
                    key={s.id}
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    aria-label={name}
                    title={name}
                    className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-white/40 text-white transition-all hover:bg-white hover:text-[#0c3140]"
                  >
                    {s.network === "custom" ? (
                      s.icon && <SiteImg src={s.icon} alt="" className="h-[20px] w-[20px] rounded object-contain md:h-[22px] md:w-[22px]" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] md:h-[20px] md:w-[20px] fill-current">
                        <path d={SOCIAL_NETWORKS[s.network].path} />
                      </svg>
                    )}
                  </a>
                );
              })}
            </div>

          </div>

          {/* Contact Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${locale === 'en' ? 'text-left' : 'text-start'}`}>

            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-white/90">{t("address")}</span>
              <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 font-bold text-white transition-colors hover:text-white/80 text-[14px] ${locale === 'en' ? 'flex-row' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`h-[14px] w-[14px] ${locale === 'ar' ? '-scale-x-100 rotate-45' : ''}`}>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
                {t("locationOnMap")}
              </a>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-white/90">{t("workingHours")}</span>
              <span className="text-[13px] text-white">{t("days")}</span>
              <span className={`font-exo text-[13px] text-white ${locale === 'en' ? 'text-left' : 'text-right'}`} dir="ltr">{settings.hours}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-white/90">{t("email")}</span>
              <a href={`mailto:${settings.footerEmail}`} className={`font-exo font-medium text-[13px] text-white hover:text-teal ${locale === 'en' ? 'text-left' : 'text-right'}`}>{settings.footerEmail}</a>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-white/90">{t("phoneWhatsapp")}</span>
              <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className={`font-exo font-medium text-[14px] text-white hover:text-teal ${locale === 'en' ? 'text-left' : 'text-right'}`} dir="ltr">{settings.phone}</a>
              {settings.landline && (
                <>
                  <span className="mt-1.5 text-[13px] text-white/90">{t("landline")}</span>
                  <a href={`tel:${settings.landline.replace(/[^\d+]/g, "")}`} className={`font-exo font-medium text-[14px] text-white hover:text-teal ${locale === 'en' ? 'text-left' : 'text-right'}`} dir="ltr">{settings.landline}</a>
                </>
              )}
            </div>

          </div>

          {/* Bottom Address */}
          <div className="w-full text-center text-[13.5px] text-white mt-10">
            {t("detailedAddress")}
          </div>
        </div>
      </div>
    </footer>
  );
}
