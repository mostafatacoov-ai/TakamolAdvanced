import Image from "next/image";
import { useTranslations } from "next-intl";

/* "من نحن — قصتنا ورسالتنا": ringed title circle + teal badge, the story
   text, and the 3D-model photo with corner brackets, as in the design. */
export default function Story() {
  const t = useTranslations("Story");
  return (
    <section className="relative overflow-hidden py-14 md:py-20">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />
      <div className="pointer-events-none absolute end-0 top-20 h-[420px] w-[420px] rounded-full bg-teal/[0.06] blur-[150px]" />

      <div className="container-tk relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* text */}
        <div className="stagger">
          <div className="flex items-center gap-5">
            <div className="relative flex h-[132px] w-[132px] shrink-0 items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-teal/40" />
              <span className="photo-ring-spin absolute inset-0 rounded-full border-2 border-transparent border-e-teal border-t-teal/60" />
              <h2 className="text-center text-[19px] font-bold leading-[1.45] text-white md:text-[21px]">
                {t("line1")}
                <br />
                {t("line2")}
              </h2>
            </div>
            <span className="glow-pulse rounded-[10px] bg-gradient-to-br from-teal-cyan to-teal px-6 py-2 text-[17px] font-bold text-navy shadow-[0_0_30px_rgba(0,180,172,.4)] md:text-[19px]">
              {t("heading1")}
            </span>
          </div>

          {/* thin path from the badge down to the text */}
          <div className="relative mt-3 h-8">
            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-teal/70 via-teal/30 to-transparent rtl:bg-gradient-to-l" />
            <span className="absolute end-[38%] top-0 h-8 w-px bg-teal/50" />
          </div>

          <div className="space-y-3 text-justify text-[15px] leading-[2.15] text-white/90 md:text-[17px]">
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
            <p className="text-iceblue">{t("p3")}</p>
          </div>
        </div>

        {/* photo with corner brackets */}
        <div className="relative mx-auto w-full max-w-[600px]">
          <span aria-hidden className="absolute -end-3 -top-3 h-32 w-48 rounded-se-[28px] border-e border-t border-teal/70" />
          <span aria-hidden className="absolute -bottom-3 -start-3 h-32 w-48 rounded-es-[28px] border-b border-s border-teal/70" />
          <div className="relative aspect-[1408/768] overflow-hidden rounded-[24px] border border-white/10 shadow-[0_24px_60px_rgba(0,10,20,.5)]">
            <Image
              src="/assets/about/story.jpg"
              alt={t("imgAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              className="ken-burns object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
