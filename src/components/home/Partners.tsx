import { useTranslations, useLocale } from "next-intl";
import { SiteImg } from "@/components/SiteImage";
import { getPartners } from "@/server/site";

const SLOT = 200; // px per logo
const SPEED = 53; // px per second

/* Partner logos (managed in the admin area) in an endless strip. The set is
   repeated enough times to cover wide screens, and the track slides by
   exactly one set, so it loops seamlessly with no empty space. */
export default function Partners() {
  const t = useTranslations("Partners");
  const locale = useLocale();
  const partners = getPartners();
  if (!partners.length) return null;

  const setWidth = partners.length * SLOT;
  const copies = Math.max(4, Math.ceil(2800 / setWidth) + 1);
  const seconds = Math.round(setWidth / SPEED);

  return (
    <section id="partners" className="relative overflow-hidden py-8 md:py-10 bg-navy" dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* LTR so the track anchors at the left edge in both languages; otherwise
          the RTL layout pins it right and the slide leaves empty space */}
      <div className="relative flex w-full overflow-hidden py-4" dir="ltr">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-navy to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-navy to-transparent" />

        <div className="partners-track flex w-max items-center hover:[animation-play-state:paused]" dir="ltr">
          {Array.from({ length: copies }, (_, c) =>
            partners.map((p, i) => {
              const logo = (
                <SiteImg
                  src={p.logo}
                  alt={p.name || `${t("partnerAlt")} ${i + 1}`}
                  loading="eager"
                  decoding="async"
                  className="max-h-[54px] w-auto max-w-[150px] object-contain opacity-90 transition-opacity duration-300 hover:opacity-100"
                />
              );
              return (
                <div
                  key={`${c}-${p.id}`}
                  aria-hidden={c > 0 || undefined}
                  className="flex h-[72px] shrink-0 items-center justify-center px-6"
                  style={{ width: SLOT }}
                >
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" tabIndex={c > 0 ? -1 : undefined}>
                      {logo}
                    </a>
                  ) : (
                    logo
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes partnersTicker {
          from { transform: translateX(0); }
          to { transform: translateX(-${100 / copies}%); }
        }
        .partners-track { animation: partnersTicker ${seconds}s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .partners-track { animation-duration: ${seconds * 4}s; }
        }
      `,
        }}
      />
    </section>
  );
}
