"use client";

import { useTranslations, useLocale } from "next-intl";

// every logo in public/assets/partners (cropped to the visible mark)
const LOGOS = [
  ...Array.from({ length: 11 }, (_, i) => String(i + 1).padStart(2, "0")),
  "rafal",
];

/* The set is repeated 4× and the track slides by exactly one set, so the
   strip is always full and loops seamlessly on any screen width. */
const COPIES = 4;

export default function Partners() {
  const t = useTranslations("Partners");
  const locale = useLocale();

  return (
    <section id="partners" className="relative overflow-hidden py-8 md:py-10 bg-navy" dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* LTR so the track anchors at the left edge in both languages; otherwise
          the RTL layout pins it right and the slide leaves empty space */}
      <div className="relative flex w-full overflow-hidden py-4" dir="ltr">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-navy to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-navy to-transparent" />

        <div className="partners-track flex w-max items-center hover:[animation-play-state:paused]" dir="ltr">
          {Array.from({ length: COPIES }, (_, c) =>
            LOGOS.map((name, i) => (
              <div key={`${c}-${name}`} className="flex h-[72px] w-[200px] shrink-0 items-center justify-center px-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/assets/partners/${name}.png`}
                  alt={`${t("partnerAlt")} ${i + 1}`}
                  loading="eager"
                  decoding="async"
                  className="max-h-[54px] w-auto max-w-[150px] object-contain opacity-90 transition-opacity duration-300 hover:opacity-100"
                />
              </div>
            ))
          )}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes partnersTicker {
          from { transform: translateX(0); }
          to { transform: translateX(-${100 / COPIES}%); }
        }
        .partners-track { animation: partnersTicker 45s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .partners-track { animation-duration: 180s; }
        }
      `,
        }}
      />
    </section>
  );
}
