"use client";

import { useState } from "react";
import type { FormAction } from "@/lib/admin/action-state";
import { pick, type Localized, type NavItem } from "@/lib/site-types";
import { SaveBar } from "./ContentEditor";
import { ActionForm, FieldError, useUnsavedWarning } from "./forms";
import { useAdminLang, useT } from "./I18n";
import { Icon } from "./icons";
import { Banner, buttonClass, cx, Field, inputClass } from "./ui";

type Target = { href: string; label: Localized };

export function NavEditor({
  items: initial,
  sitePages,
  customPages,
  action,
}: {
  items: NavItem[];
  sitePages: Target[];
  customPages: Target[];
  action: FormAction;
}) {
  const t = useT();
  const lang = useAdminLang();
  const [items, setItems] = useState(initial);
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);

  const change = (next: NavItem[]) => {
    setItems(next);
    setDirty(true);
  };
  const patch = (i: number, p: Partial<NavItem>) => change(items.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const move = (i: number, dir: -1 | 1) => {
    const copy = [...items];
    [copy[i], copy[i + dir]] = [copy[i + dir], copy[i]];
    change(copy);
  };
  const known = new Set([...sitePages, ...customPages].map((p) => p.href));
  const visibleCount = items.filter((i) => i.visible).length;

  return (
    <ActionForm action={action} notice="none" className="space-y-4">
      <input type="hidden" name="payload" value={JSON.stringify(items)} />
      {visibleCount > 7 && <Banner tone="amber" icon="warning">{t("menu.tooMany")}</Banner>}

      {items.map((item, i) => (
        <div key={item.id} className={cx("rounded-2xl border bg-white/[0.035] p-4 md:p-5", item.visible ? "border-white/10" : "border-dashed border-white/15 opacity-70")}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="font-exo text-[14px] font-bold text-teal">{i + 1}</span>
            <span className="flex-1 text-[15px] font-bold text-white">{pick(item.label, lang) || "—"}</span>
            <label className="me-2 inline-flex cursor-pointer items-center gap-2 text-[13px] font-bold text-white/75">
              <input type="checkbox" checked={item.visible} onChange={(e) => patch(i, { visible: e.target.checked })} className="h-4 w-4 accent-teal" />
              {t("common.visible")}
            </label>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={buttonClass.icon} aria-label={t("common.moveUp")}>
              <Icon name="up" className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className={buttonClass.icon} aria-label={t("common.moveDown")}>
              <Icon name="down" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => window.confirm(t("common.confirmDelete")) && change(items.filter((_, j) => j !== i))}
              className={cx(buttonClass.icon, "hover:border-rose-400 hover:text-rose-300")}
              aria-label={t("common.remove")}
            >
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label={t("menu.label")}>
              <div className="grid grid-cols-2 gap-2">
                <input dir="rtl" value={item.label.ar} placeholder={t("common.arabic")} onChange={(e) => patch(i, { label: { ...item.label, ar: e.target.value } })} className={inputClass} />
                <input dir="ltr" value={item.label.en} placeholder={t("common.english")} onChange={(e) => patch(i, { label: { ...item.label, en: e.target.value } })} className={cx(inputClass, "text-left")} />
              </div>
              <FieldError name={`label-${i}`} />
            </Field>
            <Field label={t("menu.opens")}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[180px_1fr]">
                <select
                  value={item.external ? "url" : "page"}
                  onChange={(e) =>
                    patch(i, e.target.value === "url" ? { external: true, href: "https://" } : { external: false, href: "/" })
                  }
                  className={inputClass}
                >
                  <option value="page">{t("menu.type.page")}</option>
                  <option value="url">{t("menu.type.url")}</option>
                </select>
                {item.external ? (
                  <input dir="ltr" value={item.href} onChange={(e) => patch(i, { href: e.target.value })} placeholder="https://" className={cx(inputClass, "text-left font-exo")} />
                ) : (
                  <select value={item.href} onChange={(e) => patch(i, { href: e.target.value })} className={inputClass}>
                    {!known.has(item.href) && <option value={item.href}>{item.href}</option>}
                    <optgroup label={t("menu.sitePages")}>
                      {sitePages.map((p) => (
                        <option key={p.href} value={p.href}>{pick(p.label, lang)} ({p.href})</option>
                      ))}
                    </optgroup>
                    {customPages.length > 0 && (
                      <optgroup label={t("menu.yourPages")}>
                        {customPages.map((p) => (
                          <option key={p.href} value={p.href}>{pick(p.label, lang)} ({p.href})</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                )}
              </div>
              <FieldError name={`href-${i}`} />
            </Field>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          change([...items, { id: Math.random().toString(36).slice(2, 10), label: { ar: "", en: "" }, href: "/", external: false, visible: true }])
        }
        className={buttonClass.secondary}
      >
        <Icon name="plus" className="h-4 w-4" />
        {t("menu.add")}
      </button>

      <SaveBar dirty={dirty} onSaved={() => setDirty(false)} />
    </ActionForm>
  );
}
