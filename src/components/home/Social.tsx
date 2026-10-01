"use client";

import Image, { SiteImg } from "@/components/SiteImage";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const POSTS = [
  { src: "/assets/insta-2.png" },
  { src: "/assets/insta-3.png" },
  { src: "/assets/insta-1.png" },
  { src: "/assets/insta-4.png" },
  { src: "/assets/insta-3.png" },
];

export default function Social() {
  const t = useTranslations("Social");
  const [activeIndex, setActiveIndex] = useState(2);

  // Auto-play animation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % POSTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const getOffset = (index: number) => {
    let diff = index - activeIndex;
    if (diff > 2) diff -= 5;
    if (diff < -2) diff += 5;
    return diff;
  };

  const getStyle = (index: number) => {
    const diff = getOffset(index);
    let translateX = "-50%";
    let scale = 1;
    let opacity = 1;
    let zIndex = 30;

    if (diff === 0) {
      translateX = "-50%";
      scale = 1;
      opacity = 1;
      zIndex = 30;
    } else if (diff === -1) {
      translateX = "calc(-50% + 280px)";
      scale = 0.7;
      opacity = 0.6;
      zIndex = 20;
    } else if (diff === 1) {
      translateX = "calc(-50% - 280px)";
      scale = 0.7;
      opacity = 0.6;
      zIndex = 20;
    } else if (diff === -2) {
      translateX = "calc(-50% + 500px)";
      scale = 0.5;
      opacity = 0.3;
      zIndex = 10;
    } else {
      translateX = "calc(-50% - 500px)";
      scale = 0.5;
      opacity = 0.3;
      zIndex = 10;
    }

    // Adjustments for mobile sizes
    if (typeof window !== "undefined" && window.innerWidth < 768) {
       if (diff === -1) translateX = "calc(-50% + 140px)";
       if (diff === 1) translateX = "calc(-50% - 140px)";
       if (diff === -2) translateX = "calc(-50% + 240px)";
       if (diff === 2) translateX = "calc(-50% - 240px)";
    }

    return {
      transform: `translate(${translateX}, -50%) scale(${scale})`,
      opacity,
      zIndex,
    };
  };

  return (
    <section id="social" className="relative overflow-hidden py-14 md:py-16 bg-navy">
      {/* deep gradient band */}
      <div className="absolute inset-x-0 top-1/2 h-[120%] -translate-y-1/2 bg-gradient-to-b from-navy via-[#002035] to-navy" />
      <div className="pointer-events-none absolute right-1/4 top-0 h-[400px] w-[400px] rounded-full bg-teal/10 blur-[140px]" />

      <div className="container-tk relative z-10 flex flex-col items-center">
        
        {/* Title */}
        <div className="w-full flex justify-end mb-6 px-4 md:px-8">
          <div className="flex flex-col items-end">
            <h2 className="glow-title text-[32px] md:text-[42px] font-bold text-white mb-2">{t("title")}</h2>
            <div className="glow-bar h-[3px] w-24 bg-teal rounded-full" />
          </div>
        </div>

        {/* Carousel Area */}
        <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden flex items-center justify-center">
          {POSTS.map((p, i) => {
            const diff = getOffset(i);
            const isActive = diff === 0;

            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 transition-all duration-700 ease-out cursor-pointer"
                style={getStyle(i)}
                onClick={() => setActiveIndex(i)}
              >
                <div className={`relative flex flex-col items-center justify-center p-6 transition-all duration-700`}>
                  
                  {/* Glass Card Background (Only visible if active) */}
                  <div className={`absolute inset-0 rounded-[40px] border border-white/20 bg-white/5 backdrop-blur-md transition-opacity duration-700 ${isActive ? "opacity-100" : "opacity-0"}`} />
                  
                  {/* Header inside Glass Card */}
                  <div className={`relative z-10 flex w-full justify-between items-start px-2 pb-6 transition-opacity duration-700 ${isActive ? "opacity-100" : "opacity-0"}`}>
                    <div className="flex items-center gap-3">
                      <div className="bg-teal p-1.5 rounded-full flex items-center justify-center w-10 h-10 shadow-lg">
                        <SiteImg src="/assets/logo-icon.png" className="w-full h-full object-contain" alt="TAC" />
                      </div>
                      <div className="text-start">
                        <div className="text-white text-[13px] font-bold leading-none mb-1 shadow-sm">Takamol Advanced</div>
                        <div className="text-teal text-[11px] font-exo drop-shadow-md">@takamoladvanced</div>
                      </div>
                    </div>
                    {/* X logo */}
                    <svg className="w-5 h-5 text-white/90 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>

                  {/* The Circular Image */}
                  <div className={`relative z-10 overflow-hidden transition-all duration-700 rounded-full border-4 shadow-xl ${isActive ? 'w-[280px] h-[280px] border-white/10' : 'w-[280px] h-[280px] border-transparent'}`}>
                    <Image src={p.src} alt={`${t("postAlt")} ${i + 1}`} fill sizes="300px" className="object-cover" />
                  </div>
                  
                  {/* Footer Text inside Glass Card */}
                  <div className={`relative z-10 mt-6 text-center transition-opacity duration-700 ${isActive ? "opacity-100" : "opacity-0"}`}>
                    <h3 className="text-white font-bold text-[22px] mb-1 drop-shadow-md">{t("cardTitle")}</h3>
                    <p className="text-white/80 text-[15px] drop-shadow-sm">{t("cardTagline")}</p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center gap-2 mt-8">
          {POSTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                activeIndex === i
                  ? "w-4 h-4 bg-transparent border-2 border-white"
                  : "w-2.5 h-2.5 bg-teal"
              }`}
              aria-label={`${t("goToSlide")} ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
