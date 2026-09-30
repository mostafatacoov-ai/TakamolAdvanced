"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

const TABS = ["vision", "mission", "values"] as const;
type Tab = (typeof TABS)[number];

const BANNER: Record<Exclude<Tab, "values">, string> = {
  vision: "/assets/about/vision.jpg",
  mission: "/assets/about/mission.jpg",
};

type Value = { title: string; desc: string };

/* رؤيتنا / مهمتنا / قيمنا tabs from the design: the statement under the
   tabs, then a full-width banner photo (vision, mission) or the four
   ringed value cards (values). */
export default function VisionMission() {
  const t = useTranslations("VisionMission");
  const tv = useTranslations("Values");
  const [active, setActive] = useState<Tab>("vision");
  const values = tv.raw("items") as Value[];

  return (
    <section className="relative overflow-hidden py-12 md:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />

      <div className="container-tk relative">
        {/* tabs */}
        <div role="tablist" className="stagger mx-auto flex w-fit items-center gap-3 md:gap-5">
          {TABS.map((id) => {
            const on = id === active;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(id)}
                className={`relative rounded-[12px] border px-5 py-2.5 text-[16px] font-bold transition-all duration-300 md:px-9 md:text-[20px] ${
                  on
                    ? "border-white/30 bg-white/[0.12] text-white shadow-[0_10px_30px_rgba(0,20,30,.35)]"
                    : "border-white/15 bg-white/[0.05] text-white/85 hover:border-teal/50 hover:text-white"
                }`}
              >
                {t(`${id}Label`)}
                {/* glowing underline under the active tab */}
                <span
                  aria-hidden
                  className={`glow-bar absolute -bottom-[7px] start-1/2 h-[3px] w-14 -translate-x-1/2 rounded-full bg-teal transition-opacity duration-300 rtl:translate-x-1/2 ${
                    on ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* statement */}
        <p
          key={active}
          className="tab-in mx-auto mt-10 max-w-[820px] text-center text-[17px] font-bold leading-[2] text-white md:text-[21px]"
        >
          {t(`${active}Text`)}
        </p>
      </div>

      {active === "values" ? (
        <ValuesGrid items={values} />
      ) : (
        <div key={active} className="tab-in relative mt-10 h-[260px] overflow-hidden md:h-[400px] lg:h-[460px]">
          <Image
            src={BANNER[active]}
            alt={t(`${active}Label`)}
            fill
            sizes="100vw"
            className="ken-burns object-cover"
          />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-navy to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-navy to-transparent" />
        </div>
      )}
    </section>
  );
}

/* Four value cards, each with a ringed title circle sitting on its top
   edge, joined by a thin rail with ring nodes on wide screens. */
function ValuesGrid({ items }: { items: Value[] }) {
  return (
    <div className="container-tk relative mt-8">
      <div className="tab-in relative pt-14">
        <span aria-hidden className="absolute inset-x-[12%] top-[64%] hidden h-px bg-teal/30 lg:block" />
        <ol className="stagger grid grid-cols-1 gap-x-8 gap-y-20 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((v, i) => (
            <li
              key={i}
              className="relative rounded-[26px] border border-teal/40 bg-[#062d42]/90 px-6 pb-7 pt-16 text-center shadow-[0_18px_40px_rgba(0,10,20,.4)] backdrop-blur-sm"
            >
              {/* ringed title circle */}
              <div className="glow-pulse absolute -top-12 start-1/2 flex h-[104px] w-[104px] -translate-x-1/2 items-center justify-center rounded-full bg-[#052536] rtl:translate-x-1/2">
                <svg aria-hidden viewBox="0 0 104 104" className="absolute inset-0 h-full w-full">
                  <circle cx="52" cy="52" r="48" fill="none" stroke="rgba(0,180,172,.22)" strokeWidth="6" />
                  <g className="arc-spin-slow">
                    <g transform={`rotate(${200 + i * 35} 52 52)`}>
                      <circle
                        cx="52" cy="52" r="48" fill="none"
                        stroke="#00B4AC" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray="190 312"
                      />
                    </g>
                  </g>
                </svg>
                <h3 className="relative px-2 text-[16px] font-bold text-white md:text-[17px]">{v.title}</h3>
              </div>
              <p className="text-justify text-[13.5px] leading-[1.95] text-white/85 md:text-[14.5px]">{v.desc}</p>
            </li>
          ))}
        </ol>
        {/* ring nodes in the gaps between the cards */}
        {[25, 50, 75].map((x) => (
          <span
            key={x}
            aria-hidden
            className="absolute top-[64%] hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/60 bg-navy lg:block"
            style={{ left: `${x}%` }}
          />
        ))}
      </div>
    </div>
  );
}
