"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const SCREENS = [
  { 
    id: 1, 
    stage: "land",
    src: "/assets/real-invest/step-1.png",
  },
  { 
    id: 2, 
    stage: "land",
    src: "/assets/real-invest/step-3.png",
  },
  { 
    id: 3, 
    stage: "land",
    src: "/assets/real-invest/step-5.png",
  },
  { 
    id: 4, 
    stage: "study",
    src: "/assets/real-invest/step-4.png",
  },
  { 
    id: 5, 
    stage: "study",
    src: "/assets/real-invest/step-img-الخطوة الرابعة .png",
  },
  { 
    id: 6, 
    stage: "study",
    src: "/assets/real-invest/step-6.png",
  },
  { 
    id: 7, 
    stage: "outputs",
    src: "/assets/real-invest/step-8.png",
  },
  { 
    id: 8, 
    stage: "outputs",
    src: "/assets/real-invest/step-7.png",
  },
];

const TABS = [
  { stage: "land", labelKey: "tabLand" },
  { stage: "study", labelKey: "tabStudy" },
  { stage: "outputs", labelKey: "tabOutputs" },
];

export default function Platforms() {
  const t = useTranslations("PlatformShowcase");
  const [idx, setIdx] = useState(0);
  const activeSlide = SCREENS[idx];
  const title = (i: number) => t(`screens.${i}.title`);

  // Auto-advance animation
  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % SCREENS.length);
    }, 4500); // Change slide every 4.5 seconds
    
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setIdx((prev) => (prev + 1) % SCREENS.length);
  };

  const handlePrev = () => {
    setIdx((prev) => (prev - 1 + SCREENS.length) % SCREENS.length);
  };

  return (
    <section id="platforms" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] binary-bg" />
      <div className="pointer-events-none absolute -left-20 top-20 h-[420px] w-[420px] rounded-full bg-teal/[0.08] blur-[150px]" />
      <div className="container-tk relative">
        
        {/* Header Area */}
        <div className="flex flex-col items-start text-start mb-10">
          <span className="text-teal font-bold text-sm mb-2">{t("eyebrow")}</span>
          <h2 className="glow-title text-3xl md:text-5xl font-extrabold text-white mb-4">
            {t("title")}
          </h2>
          <p className="text-iceblue max-w-3xl text-lg leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          {TABS.map((tab) => {
            const active = activeSlide.stage === tab.stage;
            return (
              <button
                key={tab.stage}
                onClick={() => setIdx(SCREENS.findIndex((s) => s.stage === tab.stage))}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm border transition-colors ${
                  active
                    ? "glow-pulse bg-teal/15 border-teal text-teal-cyan"
                    : "bg-white/[0.04] border-white/15 text-white/70 hover:border-teal/40 hover:text-white"
                }`}
              >
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Main Interface Showcase */}
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-sm shadow-[0_20px_50px_rgba(0,10,20,.35)] p-6 md:p-10">
          
          {/* Main Large Image */}
          <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mb-8 border border-white/10 bg-navy-deep/60 group">
            {SCREENS.map((s, i) => (
              <Image 
                key={s.src} 
                src={s.src} 
                alt={title(i)} 
                fill 
                className={`object-contain lg:object-cover transition-opacity duration-700 ease-in-out ${idx === i ? 'opacity-100' : 'opacity-0'}`}
                priority={i === 0}
              />
            ))}
          </div>

          {/* Details & Navigation */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-10 mb-10">
            
            {/* Text details on the right (RTL start) */}
            <div className="text-start mb-6 md:mb-0">
              <div className="text-steel font-bold text-sm mb-3 flex items-center justify-end gap-1" dir="ltr">
                <span className="text-teal">{idx + 1}</span>
                <span>/</span>
                <span>{SCREENS.length}</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3">{title(idx)}</h3>
              <p className="text-steel max-w-xl text-[15px] leading-relaxed">
                {t(`screens.${idx}.desc`)}
                <span className="block text-steel/70 mt-2 text-sm">{t("screenshot")}</span>
              </p>
            </div>

            {/* Navigation Arrows on the left (RTL end) */}
            <div className="flex items-center gap-3 ltr:flex-row-reverse">
              {/* Right Arrow (Next in RTL) */}
              <button 
                onClick={handleNext} 
                className="w-12 h-12 rounded-full border border-white/25 flex items-center justify-center text-white/80 hover:border-teal hover:text-teal hover:bg-teal/10 transition-all"
                aria-label={t("next")}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {/* Left Arrow (Prev in RTL) */}
              <button 
                onClick={handlePrev} 
                className="w-12 h-12 rounded-full border border-white/25 flex items-center justify-center text-white/80 hover:border-teal hover:text-teal hover:bg-teal/10 transition-all"
                aria-label={t("prev")}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Thumbnails Gallery */}
          <div className="stagger grid grid-cols-2 md:grid-cols-4 gap-4">
            {SCREENS.map((s, i) => (
              <div 
                key={s.id} 
                onClick={() => setIdx(i)} 
                className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                  idx === i ? 'border-teal shadow-[0_0_24px_rgba(0,180,172,.35)] ring-4 ring-teal/15' : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="relative aspect-video w-full bg-navy-deep/60">
                  <Image src={s.src} fill className="object-cover" alt={title(i)} />
                </div>
                <div className={`p-3 text-center text-xs font-bold transition-colors ${idx === i ? 'bg-teal text-navy' : 'bg-white/[0.06] text-white'}`}>
                  {title(i)}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
