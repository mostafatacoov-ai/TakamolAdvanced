"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout, setAdminLang } from "@/app/admin/_actions/auth";
import { useAdminLang, useT } from "./I18n";
import { Icon, type IconName } from "./icons";
import { cx } from "./ui";

export type SidebarGroup = { label?: string; items: { href: string; label: string; icon: IconName; badge?: number }[] };

export function Sidebar({ groups, user }: { groups: SidebarGroup[]; user: { name: string; role: string } }) {
  const pathname = usePathname();
  const t = useT();
  const lang = useAdminLang();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  const panel = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
        <Link href="/admin" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="Takamol Advanced" className="h-8 w-auto" />
        </Link>
        <span className="rounded-md border border-teal/30 bg-teal/10 px-2 py-0.5 text-[11px] font-bold text-teal-cyan">
          {t("app.panel")}
        </span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.label && <p className="mb-2 px-3 text-[11.5px] font-bold uppercase tracking-wide text-white/40">{group.label}</p>}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cx(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-bold transition",
                        active ? "bg-teal/15 text-teal-cyan" : "text-white/75 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon name={item.icon} className="h-[19px] w-[19px]" />
                      <span className="flex-1">{item.label}</span>
                      {!!item.badge && (
                        <span className="rounded-full bg-teal px-2 py-0.5 font-exo text-[11px] font-bold text-navy">{item.badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <div className="mb-2 px-3">
          <p className="truncate text-[14px] font-bold text-white">{user.name}</p>
          <p className="truncate text-[12px] text-steel">{user.role}</p>
        </div>
        <Link
          href="/admin/account"
          className={cx(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-bold transition",
            isActive("/admin/account") ? "bg-teal/15 text-teal-cyan" : "text-white/70 hover:bg-white/5 hover:text-white",
          )}
        >
          <Icon name="account" className="h-[18px] w-[18px]" />
          {t("nav.account")}
        </Link>
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-bold text-white/70 transition hover:bg-white/5 hover:text-white">
          <Icon name="external" className="h-[18px] w-[18px]" />
          {t("app.viewSite")}
        </a>
        <form action={setAdminLang}>
          <input type="hidden" name="lang" value={lang === "ar" ? "en" : "ar"} />
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-bold text-white/70 transition hover:bg-white/5 hover:text-white">
            <Icon name="globe" className="h-[18px] w-[18px]" />
            {t("lang.switch")}
          </button>
        </form>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-bold text-rose-300/90 transition hover:bg-rose-500/10">
            <Icon name="logout" className="h-[18px] w-[18px] rtl:-scale-x-100" />
            {t("app.logout")}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* phones & tablets: top bar + drawer */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#041a2b]/95 px-4 py-3 backdrop-blur lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo.png" alt="Takamol Advanced" className="h-7 w-auto" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("app.menu")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white"
        >
          <Icon name="menu" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label={t("app.close")} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60" />
          <aside className="absolute inset-y-0 start-0 w-[290px] max-w-[85vw] border-e border-white/10 bg-[#041a2b] shadow-2xl">
            {panel}
          </aside>
        </div>
      )}

      {/* desktop */}
      <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 border-e border-white/10 bg-[#041a2b] lg:block">
        {panel}
      </aside>
    </>
  );
}
