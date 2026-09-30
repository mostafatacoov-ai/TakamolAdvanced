"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

export default function InteractiveVision() {
  const t = useTranslations("InteractiveVision");
  const locale = useLocale();
  const [stage, setStage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-linked: the scene advances from land to vision as the section
  // travels up through the viewport (no pinned scroll zone).
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh * 0.3;
      const scrolled = vh * 0.8 - rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / total));
      if (progress > 0 && progress < 1) {
        setStage(1 + progress * 2);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStage(parseFloat(e.target.value));
  };

  const getOpacity = (targetStage: number) => {
    const distance = Math.abs(stage - targetStage);
    return Math.max(0, 1 - distance);
  };

  return (
    <section id="vision" ref={containerRef} className="relative overflow-hidden bg-navy-deep py-14 text-white md:py-20">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] binary-bg" />
      <div className="relative w-full">
        <div className="container-tk relative z-10 flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          
          {/* Left Side: Interactive Viewer */}
          <div className="w-full lg:w-1/2 flex flex-col items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {/* Image Container */}
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl mb-6">
              <Image
                src="/assets/interactive-1.jpg"
                alt="The Land"
                fill
                className="object-cover absolute inset-0 pointer-events-none"
                style={{ opacity: getOpacity(1), transition: 'opacity 0.1s ease-out' }}
              />
              <Image
                src="/assets/interactive-2.jpg"
                alt="The Development"
                fill
                className="object-cover absolute inset-0 pointer-events-none"
                style={{ opacity: getOpacity(2), transition: 'opacity 0.1s ease-out' }}
              />
              <Image
                src="/assets/interactive-3.jpg"
                alt="The Vision"
                fill
                className="object-cover absolute inset-0 pointer-events-none"
                style={{ opacity: getOpacity(3), transition: 'opacity 0.1s ease-out' }}
              />

              {/* Overlay Elements inside Image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              <div className={`absolute bottom-6 z-10 ${locale === 'ar' ? 'right-6 text-right' : 'left-6 text-left'}`}>
                <p className="text-sm text-gray-300 mb-1">
                  {stage < 1.5 ? t("stage1Desc") : stage < 2.5 ? t("stage2Desc") : t("stage3Desc")}
                </p>
                <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">
                  {stage < 1.5 ? t("stage1Title") : stage < 2.5 ? t("stage2Title") : t("stage3Title")}
                </h3>
                <p className="text-xs text-gray-400">
                  {t("stageSubtitle")}
                </p>
              </div>

              <div className={`absolute bottom-6 z-10 ${locale === 'ar' ? 'left-6' : 'right-6'}`}>
                <button 
                  className="bg-black/40 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                  onClick={() => {
                    let current = stage;
                    const interval = setInterval(() => {
                      current += 0.05;
                      if (current >= 3) {
                        current = 3;
                        clearInterval(interval);
                      }
                      setStage(current);
                    }, 50);
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4l12 6-12 6V4z" />
                  </svg>
                  {t("playScene")}
                </button>
              </div>
            </div>

            {/* Controls Below Image */}
            <div className={`flex flex-col sm:flex-row items-center justify-between w-full gap-6 mt-6 ${locale === 'ar' ? '' : 'sm:flex-row-reverse'}`}>
              <div className="flex-1 max-w-sm flex items-center gap-4 w-full order-2 sm:order-1">
                <span className="text-sm font-bold text-gray-300 whitespace-nowrap">{t("controlScene")}</span>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  step="0.01" 
                  value={stage}
                  onChange={handleStageChange}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00a69c]"
                  style={{ direction: 'ltr' }}
                />
              </div>

              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button 
                  onClick={() => setStage(1)}
                  className={`px-5 py-2 rounded-lg font-bold text-sm transition-all border ${stage < 1.5 ? 'glow-pulse bg-teal border-teal text-navy' : 'bg-transparent border-white/20 text-iceblue hover:bg-white/10'}`}
                >
                  {t("land")}
                </button>
                <button 
                  onClick={() => setStage(2)}
                  className={`px-5 py-2 rounded-lg font-bold text-sm transition-all border ${stage >= 1.5 && stage < 2.5 ? 'glow-pulse bg-teal border-teal text-navy' : 'bg-transparent border-white/20 text-iceblue hover:bg-white/10'}`}
                >
                  {t("development")}
                </button>
                <button 
                  onClick={() => setStage(3)}
                  className={`px-5 py-2 rounded-lg font-bold text-sm transition-all border ${stage >= 2.5 ? 'glow-pulse bg-teal border-teal text-navy' : 'bg-transparent border-white/20 text-iceblue hover:bg-white/10'}`}
                >
                  {t("vision")}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Text */}
          <div className={`w-full lg:w-1/2 ${locale === 'ar' ? 'text-right' : 'text-left'}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <h2 className="glow-title text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              {t("mainTitle1")} <br/>
              {t("mainTitle2")}
            </h2>
            <p className="text-lg text-iceblue leading-relaxed max-w-lg">
              {t("mainDesc")}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
