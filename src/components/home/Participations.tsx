"use client";

import Image from "@/components/SiteImage";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

const PANELS = [
  {
    id: 1,
    src: "/assets/event-1.jpg",
    textKey: "p1Text",
  },
  {
    id: 2,
    src: "/assets/event-2.jpg",
    textKey: "p2Text",
  },
  {
    id: 3,
    src: "/assets/event-4.jpg",
    textKey: "p3Text",
  },
  {
    id: 4,
    src: "/assets/event-3.jpg",
    textKey: "p4Text",
  }
];

export default function Participations() {
  const [activeIndex, setActiveIndex] = useState(3); // Start with the left-most expanded
  const t = useTranslations("Participations");
  const locale = useLocale();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PANELS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % PANELS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + PANELS.length) % PANELS.length);
  };

  return (
    <section className="relative overflow-hidden text-white py-14 md:py-16" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] binary-bg" />
      <div className="container-tk relative">
        {/* Header Text */}
        <div className={`mb-8 ${locale === 'en' ? 'text-left' : 'text-right'}`}>
          <h2 className="glow-title text-4xl md:text-[44px] font-bold mb-4">
            {t("title")}
          </h2>
          <p className={`text-iceblue max-w-3xl text-sm md:text-lg leading-relaxed ${locale === 'en' ? 'mr-0' : 'ml-0'}`}>
            {t("description")}
          </p>
        </div>

        {/* Expanding Cards Gallery */}
        <div className="flex flex-row gap-2 md:gap-4 h-[400px] md:h-[500px] mb-8" dir="ltr">
          {PANELS.map((panel, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={panel.id}
                onClick={() => setActiveIndex(idx)}
                className={`relative overflow-hidden rounded-[24px] cursor-pointer transition-all duration-700 ease-in-out ${
                  isActive ? "flex-[4] md:flex-[5]" : "flex-[1]"
                }`}
              >
                {/* Background Image */}
                <Image
                  src={panel.src}
                  alt={t(panel.textKey as any)}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className={`object-cover transition-transform duration-700 ${
                    isActive ? "scale-100" : "scale-110"
                  }`}
                />
                
                {/* Overlay gradient for text readability */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent transition-opacity duration-700 ${
                    isActive ? "opacity-100" : "opacity-30 md:opacity-0"
                  }`}
                ></div>

                {/* Text inside the active panel */}
                <div
                  className={`absolute bottom-8 right-8 left-8 transition-all duration-700 ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                >
                  <p className="text-white font-bold text-lg md:text-2xl drop-shadow-md">
                    {t(panel.textKey as any)}
                  </p>
                </div>
                
                {/* Overlay for inactive to darken them slightly */}
                <div className={`absolute inset-0 bg-navy/40 transition-opacity duration-700 ${isActive ? 'opacity-0' : 'opacity-100'}`}></div>
              </div>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className={`flex flex-col gap-6 ${locale === 'en' ? 'items-start' : 'items-end'}`}>
          <div className="flex items-center gap-6 text-white/80">
            <span className="font-bold text-lg">{activeIndex + 1} / {PANELS.length}</span>
            <div className={`flex items-center gap-2 ${locale === 'en' ? 'flex-row-reverse' : ''}`}>
              <button 
                onClick={handlePrev}
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-navy transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={handleNext}
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-navy transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
