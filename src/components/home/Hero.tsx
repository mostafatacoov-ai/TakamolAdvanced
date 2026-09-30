"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { CONSULTANT_WHATSAPP } from "@/lib/contact";

const IMAGES = [
  "/assets/hero_ksa_2_1790677040006.jpg",
  "/assets/hero_ksa_3_1790677116333.jpg",
  "/assets/hero_ksa_4_1790677176773.jpg"
];

export default function Hero() {
  const t = useTranslations("Hero");
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="relative h-[100svh] min-h-[640px] overflow-hidden bg-navy">
      {/* background photos */}
      {IMAGES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === currentIdx ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ))}

      {/* solid navy on the text side, fading out toward the photo */}
      <div className="pointer-events-none absolute inset-0 z-10 from-navy from-15% via-navy/85 via-45% to-navy/10 ltr:bg-gradient-to-r rtl:bg-gradient-to-l" />
      {/* on phones the text spans the full width, so tint the whole photo */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-navy/45 md:hidden" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-navy/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-navy to-transparent" />

      <div className="container-tk relative z-20 flex h-full flex-col justify-center pb-24 pt-[110px]">
        <div className="max-w-[640px]">
          <p className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-navy/40 px-5 py-2 text-[13px] text-white/85 backdrop-blur-sm md:text-[14px]">
            <span className="h-px w-6 bg-teal" />
            {t("tagline")}
          </p>

          <h1 className="glow-title mt-7 text-[34px] font-bold leading-[1.35] text-white md:text-[46px] lg:text-[54px]">
            {t("title")}
          </h1>

          <p className="mt-6 max-w-[580px] text-[15px] font-light leading-[1.95] text-white/80 md:text-[17px]">
            {t("description")}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/platforms/real-fursa"
              className="glow-pulse rounded-full border-2 border-teal bg-navy/40 px-8 py-3.5 text-[15px] font-bold text-white transition-all duration-300 hover:bg-teal hover:text-navy md:text-[16px]"
            >
              {t("ctaForsa")}
            </Link>
            <a
              href={CONSULTANT_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/40 px-7 py-3.5 text-[15px] font-bold text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-navy md:text-[16px]"
            >
              {t("ctaConsultant")}
            </a>
            <Link
              href="/platforms/real-invest"
              className="px-2 text-[14px] font-bold text-teal underline decoration-teal/60 underline-offset-[10px] transition-colors hover:text-teal-cyan md:text-[15px]"
            >
              {t("ctaInvest")}
            </Link>
          </div>
        </div>
      </div>

      {/* bottom bar: slide label + dots | scroll cue */}
      <div className="absolute inset-x-0 bottom-8 z-30">
        <div className="container-tk">
          <div className="flex items-center justify-between border-t border-white/15 pt-4 text-[13px] text-white/70">
            <div className="flex items-center gap-4">
              <span>
                <span className="font-exo" dir="ltr">VIS-0{currentIdx + 1}</span> · {t("visLabel")}
              </span>
              <div className="flex items-center gap-2">
                {IMAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    aria-label={`${t("goToSlide")} ${i + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentIdx
                        ? "h-2 w-5 bg-teal"
                        : "h-2 w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>
            <a href="#vision" className="flex items-center gap-2 transition-colors hover:text-teal">
              {t("scrollDown")}
              <span aria-hidden className="animate-bounce">↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
