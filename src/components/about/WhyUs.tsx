import { useTranslations } from "next-intl";

const ITEMS = [0, 1, 2];

/* "لماذا نحن مختلفون؟" from the design: a title pill, a branching
   connector, and three tall teal capsules (the middle one raised) over a
   faint city outline. */
export default function WhyUs() {
  const t = useTranslations("WhyUs");
  return (
    <section className="relative overflow-hidden py-14 md:py-20">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />
      <CityOutline className="start-0" />
      <CityOutline className="end-0 -scale-x-100" />

      <div className="container-tk relative">
        <div className="text-center">
          <h2 className="glow-title inline-block rounded-[14px] border border-white/30 bg-gradient-to-b from-white/[0.2] to-white/[0.06] px-8 py-3 text-[20px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_10px_30px_rgba(0,20,30,.35)] md:text-[24px]">
            {t("title")}
          </h2>
        </div>

        {/* branching connector (desktop) */}
        <svg aria-hidden viewBox="0 0 900 110" className="mx-auto mt-1 hidden w-full max-w-[900px] md:block">
          <circle cx="396" cy="6" r="4" fill="#fff" />
          <circle cx="450" cy="6" r="4" fill="#00B4AC" />
          <circle cx="504" cy="6" r="4" fill="#fff" />
          <g fill="none" strokeWidth="1.5">
            <path d="M450 14 V98" stroke="rgba(0,180,172,.8)" />
            <path d="M396 14 V44 H180 V96" stroke="rgba(214,233,242,.5)" />
            <path d="M504 14 V44 H720 V96" stroke="rgba(214,233,242,.5)" />
          </g>
          {/* travelling light on the branches */}
          <g fill="none" stroke="rgba(68,197,207,.95)" strokeWidth="2.5" strokeLinecap="round">
            <path className="line-flow" pathLength={100} d="M396 14 V44 H180 V96" />
            <path className="line-flow" pathLength={100} d="M504 14 V44 H720 V96" style={{ animationDelay: "-3.5s" }} />
            <path className="line-flow" pathLength={100} d="M450 14 V98" style={{ animationDelay: "-1.7s" }} />
          </g>
          <circle cx="180" cy="101" r="5" fill="#00304D" stroke="#fff" strokeWidth="1.5" />
          <circle cx="720" cy="101" r="5" fill="#00304D" stroke="#fff" strokeWidth="1.5" />
          <circle cx="450" cy="103" r="4" fill="#00304D" stroke="#00B4AC" strokeWidth="1.5" />
        </svg>

        {/* capsules */}
        <ol className="stagger mt-8 grid grid-cols-1 items-start justify-items-center gap-10 md:mt-0 md:grid-cols-3 md:gap-6">
          {ITEMS.map((i) => (
            <li key={i} className={`relative w-[250px] ${i === 1 ? "md:-mt-3" : "md:mt-12"}`}>
              <div className="pin-float relative" style={{ animationDelay: `${i * -2.1}s` }}>
                {/* translucent halo */}
                <span
                  aria-hidden
                  className={`absolute h-[240px] w-[240px] rounded-full bg-white/[0.09] ${
                    i === 1 ? "-bottom-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2" : "-start-8 top-16"
                  }`}
                />
                <div className="relative flex min-h-[400px] flex-col items-center rounded-full bg-gradient-to-b from-[#1fb3aa]/95 via-[#118f8b]/90 to-[#0a7773]/85 px-7 pb-12 pt-14 text-center shadow-[0_24px_60px_rgba(0,10,20,.45),0_0_50px_rgba(0,180,172,.25)] backdrop-blur-[2px]">
                  <h3 className="text-[19px] font-bold leading-[1.45] text-white">
                    <span className="block">{t(`items.${i}.line1`)}</span>
                    <span className="block">{t(`items.${i}.line2`)}</span>
                  </h3>
                  <span className="my-4 h-px w-28 bg-white/50" />
                  <p className="text-[14px] leading-[1.95] text-white/95">{t(`items.${i}.desc`)}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* thin stepped skyline, as in the design's background */
function CityOutline({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 420 360"
      className={`pointer-events-none absolute bottom-0 hidden h-[340px] w-[400px] lg:block ${className}`}
      fill="none"
      stroke="rgba(0,180,172,.32)"
      strokeWidth="1.2"
    >
      <path d="M0 360 V210 H38 V130 H72 V186 H110 V70 H136 V44 H156 V70 H184 V150 H222 V230 H262 V110 H300 V170 H338 V250 H376 V300 H420" />
      <path d="M110 70 V186 M136 44 V150 M262 110 V230 M300 170 V250" opacity=".5" />
      <path d="M44 210 V150 M84 186 V150 M232 230 V170 M348 250 V190" opacity=".35" />
    </svg>
  );
}
