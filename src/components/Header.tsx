"use client";

import { useEffect, useState } from "react";
import { Link, usePathname, useRouter } from "@/navigation";
import { useTranslations, useLocale } from "next-intl";

/* Floating header bar from the design: one rounded, outlined bar holding the
   logo, the links (separated by thin dividers, current page boxed) and the
   language switch in a circle. */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname(); // without the locale prefix, e.g. "/about"
  const router = useRouter();

  const t = useTranslations("Header");
  const tc = useTranslations("Common");
  const locale = useLocale();

  const NAV = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/services", label: t("services") },
    { href: "/platforms", label: t("platforms") },
    { href: "/knowledge", label: t("knowledge") },
    { href: "/join", label: t("join") },
  ];

  const isActive = (href: string) =>
    href === pathname || (href !== "/" && pathname.startsWith(`${href}/`));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLanguage = () => {
    router.replace(pathname, { locale: locale === "ar" ? "en" : "ar" });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3 md:pt-4">
      <div className="container-tk">
        <div
          className={`rounded-[16px] border backdrop-blur-md transition-all duration-500 ${
            scrolled || open
              ? "border-white/20 bg-[#062a3f]/90 shadow-[0_14px_40px_rgba(0,10,20,.5)]"
              : "border-white/15 bg-gradient-to-b from-[#0d3a50]/70 to-[#062a3f]/60 shadow-[0_10px_30px_rgba(0,10,20,.25)]"
          }`}
        >
          <div className="flex h-[64px] items-center justify-between gap-4 px-4 md:h-[70px] md:px-6">
            {/* logo */}
            <Link href="/" className="group relative shrink-0">
              <span className="logo-anim-mark relative inline-block h-[38px] w-[142px] transition-transform duration-500 group-hover:scale-105 md:h-[42px] md:w-[158px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/logo.png"
                  alt="تكامل المتقدمة — Takamol Advanced"
                  className="h-full w-full object-contain"
                />
                <span aria-hidden className="logo-anim-shine absolute inset-0 overflow-hidden">
                  <span className="absolute top-0 h-full w-[38%] -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                </span>
              </span>
            </Link>

            {/* desktop links */}
            <nav className="hidden flex-1 items-center justify-start lg:flex">
              {NAV.map((item, i) => {
                const active = isActive(item.href);
                return (
                  <div key={item.href} className="flex items-center">
                    {i > 0 && <span aria-hidden className="h-5 w-px bg-white/25" />}
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`mx-1.5 whitespace-nowrap rounded-[9px] border px-3 py-1.5 text-[14px] font-bold transition-all duration-300 xl:mx-2 xl:px-3.5 xl:text-[15px] ${
                        active
                          ? "border-white/35 bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.12)]"
                          : "border-transparent text-white/90 hover:border-white/15 hover:text-teal"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </div>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {/* language switch */}
              <button
                onClick={toggleLanguage}
                aria-label={tc("switchLanguage")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/45 font-exo text-[13px] font-bold text-white transition-colors hover:border-teal hover:text-teal"
              >
                {locale === "ar" ? "EN" : "AR"}
              </button>

              {/* mobile toggle */}
              <button
                aria-label={tc("menu")}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="flex h-10 w-10 flex-col items-center justify-center gap-[6px] lg:hidden"
              >
                <span className={`h-[2.5px] w-6 rounded bg-white transition-all duration-300 ${open ? "translate-y-[8.5px] rotate-45" : ""}`} />
                <span className={`h-[2.5px] w-6 rounded bg-white transition-all duration-300 ${open ? "opacity-0" : ""}`} />
                <span className={`h-[2.5px] w-6 rounded bg-white transition-all duration-300 ${open ? "-translate-y-[8.5px] -rotate-45" : ""}`} />
              </button>
            </div>
          </div>

          {/* mobile menu */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
              open ? "max-h-[520px] border-t border-white/10" : "max-h-0"
            }`}
          >
            <nav className="flex flex-col gap-1 p-4">
              {NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-[10px] border px-4 py-2.5 text-start text-[16px] font-bold transition-colors ${
                      active
                        ? "border-white/30 bg-white/[0.07] text-white"
                        : "border-transparent text-white/90 hover:bg-white/5 hover:text-teal"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
