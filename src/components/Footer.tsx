import { Link } from "@/navigation";
import { useTranslations, useLocale } from "next-intl";
import { SiteImg } from "@/components/SiteImage";
import { getSiteSettings } from "@/server/site";

const ICONS = {
  linkedin: {
    name: "LinkedIn",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.554V9h3.565v11.452z",
  },
  instagram: {
    name: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
  },
  x: {
    name: "X",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  facebook: {
    name: "Facebook",
    path: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z",
  },
} as const;

/* Contact details and social links come from the admin area (Site settings). */
export default function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale();
  const settings = getSiteSettings();
  const socials = (Object.keys(ICONS) as (keyof typeof ICONS)[])
    .map((key) => ({ ...ICONS[key], url: settings.socials[key] }))
    .filter((s) => s.url);

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

            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-white/40 text-white transition-all hover:bg-white hover:text-[#0c3140]"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] md:h-[20px] md:w-[20px] fill-current">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
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
