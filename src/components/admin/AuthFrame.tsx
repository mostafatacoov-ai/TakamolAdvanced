import type { ReactNode } from "react";
import { setAdminLang } from "@/app/admin/_actions/auth";
import { Icon } from "./icons";

/* Centered card used by the sign-in and first-setup screens. */
export function AuthFrame({
  title,
  subtitle,
  lang,
  switchLabel,
  children,
}: {
  title: string;
  subtitle: string;
  lang: "ar" | "en";
  switchLabel: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-teal/10 blur-[140px]" />
      <div className="relative w-full max-w-[440px]">
        <div className="mb-6 flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="Takamol Advanced" className="h-10 w-auto" />
          <form action={setAdminLang}>
            <input type="hidden" name="lang" value={lang === "ar" ? "en" : "ar"} />
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[13px] font-bold text-white/80 hover:border-teal hover:text-teal">
              <Icon name="globe" className="h-4 w-4" />
              {switchLabel}
            </button>
          </form>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#062236]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,.45)] backdrop-blur md:p-8">
          <h1 className="text-[22px] font-bold text-white">{title}</h1>
          <p className="mt-1.5 text-[14px] leading-relaxed text-steel">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
