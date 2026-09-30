"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { ServiceBubbles } from "@/components/services/ServicesOverview";

export default function Services() {
  const t = useTranslations("Services");
  const locale = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0); // 0 = Services, 1 = Products

  const handleNext = () => {
    setCurrentSlide(1);
  };

  const handlePrev = () => {
    setCurrentSlide(0);
  };

  return (
    <section id="services" className="relative bg-navy py-14 md:py-16 overflow-hidden" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Background binary text pattern on the section itself */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5 binary-bg" />

      <div className="container-tk relative z-10 px-4 md:px-12">
        {/* Header */}
        <div className={`flex w-full justify-between items-center mb-6 ${locale === 'ar' ? '' : 'flex-row-reverse'}`}>
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
             {/* Right Arrow (RTL next / prev) */}
             <button 
              onClick={locale === 'ar' ? handleNext : handlePrev}
              disabled={locale === 'ar' ? currentSlide === 1 : currentSlide === 0}
              aria-label={t(locale === 'ar' ? "next" : "prev")} 
              className={`flex items-center justify-center w-10 h-10 transition-colors shrink-0 rounded-full border ${(locale === 'ar' ? currentSlide === 1 : currentSlide === 0) ? 'border-white/10 text-white/30 cursor-not-allowed' : 'border-white/30 text-white/70 hover:text-white hover:border-white'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-6 h-6 ${locale === 'en' ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button 
              onClick={locale === 'ar' ? handlePrev : handleNext}
              disabled={locale === 'ar' ? currentSlide === 0 : currentSlide === 1}
              aria-label={t(locale === 'ar' ? "prev" : "next")} 
              className={`flex items-center justify-center w-10 h-10 transition-colors shrink-0 rounded-full border ${(locale === 'ar' ? currentSlide === 0 : currentSlide === 1) ? 'border-white/10 text-white/30 cursor-not-allowed' : 'border-white/30 text-white/70 hover:text-white hover:border-white'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-6 h-6 ${locale === 'en' ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className={`flex flex-col ${locale === 'ar' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-4 ${locale === 'en' ? 'flex-row-reverse' : ''}`}>
              <p className="text-white/80 text-[18px] md:text-[22px] font-medium hidden md:block">
                {currentSlide === 0 ? t("headerSub1") : t("headerSub2")}
              </p>
              <div className="h-8 w-px bg-white/40 hidden md:block" />
              <h2 className="glow-title text-white font-bold text-[32px] md:text-[42px] leading-tight transition-all duration-300">
                {currentSlide === 0 ? t("headerTitle1") : t("headerTitle2")}
              </h2>
            </div>
            <div className={`glow-bar mt-3 h-[3px] w-[90px] bg-teal rounded-full ${locale === 'en' ? 'ml-0 mr-auto' : ''}`} />
          </div>

        </div>

        {/* Carousel / Grid Area */}
        <div className="w-full relative mt-2 perspective-1000">
          
          <AnimatePresence mode="wait">
            {currentSlide === 0 ? (
              <motion.div
                key="services"
                initial={{ opacity: 0, scale: 0.8, rotateY: locale === 'ar' ? 20 : -20, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, rotateY: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, rotateY: locale === 'ar' ? -20 : 20, filter: "blur(10px)" }}
                transition={{ duration: 0.6, staggerChildren: 0.1 }}
                className="w-full"
              >
                <ServiceBubbles embed />
              </motion.div>
            ) : (
              <motion.div
                key="products"
                initial={{ opacity: 0, scale: 0.8, rotateY: locale === 'ar' ? -20 : 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, rotateY: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, rotateY: locale === 'ar' ? 20 : -20, filter: "blur(10px)" }}
                transition={{ duration: 0.6, staggerChildren: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto transform-style-3d"
              >
                
                {/* Product 1: Real Forsa */}
                <motion.div
                  initial={{ opacity: 0, z: -150, rotateX: 60 }}
                  animate={{ opacity: 1, z: 0, rotateX: 0 }}
                  exit={{ opacity: 0, z: -150, rotateX: -60 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Link href="/platforms/real-fursa" className="h-[380px] md:h-[460px] rounded-[16px] bg-teal p-8 relative overflow-hidden border border-white/20 shadow-lg group transition-transform hover:-translate-y-2 block">
                    <div className="absolute inset-0 opacity-15 binary-bg" />
                    <div className={`absolute top-[10%] ${locale === 'ar' ? 'left-[10%]' : 'right-[10%]'} w-[180px] h-[180px] opacity-10 pointer-events-none mix-blend-overlay`}>
                       <Image src="/assets/reelforsa-main.png" alt="" fill className="object-contain" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col items-start text-start">
                       <div className="w-[120px] h-[40px] relative mb-6">
                          <Image src="/assets/logo.png" alt="Real Forsa" fill className={`object-contain ${locale === 'ar' ? 'object-right' : 'object-left'}`} />
                       </div>
                       <h3 className="text-white font-bold text-[28px] md:text-[34px] leading-[1.4] mb-4">{t("prod1Title")}</h3>
                       <p className="text-white/90 text-[16px] md:text-[18px] leading-relaxed w-3/4">{t("prod1Desc")}</p>
                       
                       <div className="mt-auto flex items-center gap-3">
                         <span className="text-white font-bold text-sm">{t("prod1Action")}</span>
                         <svg className={`w-6 h-6 text-white transition-transform ${locale === 'ar' ? 'group-hover:-translate-x-2 rotate-180' : 'group-hover:translate-x-2'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M10 8l6 4-6 4V8z" />
                         </svg>
                       </div>
                    </div>
                  </Link>
                </motion.div>

                {/* Product 2: Real Invest */}
                <motion.div
                  initial={{ opacity: 0, z: -150, rotateX: -60 }}
                  animate={{ opacity: 1, z: 0, rotateX: 0 }}
                  exit={{ opacity: 0, z: -150, rotateX: 60 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Link href="/platforms/real-invest" className="h-[380px] md:h-[460px] rounded-[16px] bg-[#9bbacd] p-8 relative overflow-hidden border border-white/20 shadow-lg group transition-transform hover:-translate-y-2 block">
                    <div className="absolute inset-0 opacity-10 binary-bg" />
                    <div className={`absolute top-[10%] ${locale === 'ar' ? 'left-[10%]' : 'right-[10%]'} w-[180px] h-[180px] opacity-10 pointer-events-none mix-blend-overlay`}>
                       <Image src="/assets/logo-icon.png" alt="" fill className="object-contain" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col items-start text-start">
                       <div className="w-[120px] h-[40px] relative mb-6">
                          <Image src="/assets/logo.png" alt="Real Invest" fill className={`object-contain ${locale === 'ar' ? 'object-right' : 'object-left'}`} />
                       </div>
                       <h3 className="text-white font-bold text-[28px] md:text-[34px] leading-[1.4] mb-4">{t("prod2Title")}</h3>
                       <p className="text-white/90 text-[16px] md:text-[18px] leading-relaxed w-3/4">{t("prod2Desc")}</p>
                       
                       <div className="mt-auto flex items-center gap-3">
                         <span className="text-[#0B202D] font-bold text-sm">{t("prod2Action")}</span>
                         <svg className={`w-6 h-6 text-[#0B202D] transition-transform ${locale === 'ar' ? 'group-hover:-translate-x-2 rotate-180' : 'group-hover:translate-x-2'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M10 8l6 4-6 4V8z" />
                         </svg>
                       </div>
                    </div>
                  </Link>
                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .perspective-1000 {
          perspective: 1500px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
      `}} />
    </section>
  );
}
