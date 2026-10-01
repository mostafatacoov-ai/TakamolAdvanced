"use client";

import NextImage from "next/image";
import { useState } from "react";
import type { FormAction } from "@/lib/admin/action-state";
import type { Partner } from "@/lib/site-types";
import { SaveBar } from "./ContentEditor";
import { ActionForm, FieldError, useUnsavedWarning } from "./forms";
import { useT } from "./I18n";
import { Icon } from "./icons";
import { ImageField, MediaPicker } from "./MediaPicker";
import { buttonClass, cx, Field, inputClass } from "./ui";

export function PartnersEditor({ items: initial, action }: { items: Partner[]; action: FormAction }) {
  const t = useT();
  const [items, setItems] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [picking, setPicking] = useState(false);
  useUnsavedWarning(dirty);

  const change = (next: Partner[]) => {
    setItems(next);
    setDirty(true);
  };
  const patch = (i: number, p: Partial<Partner>) => change(items.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const move = (i: number, dir: -1 | 1) => {
    const copy = [...items];
    [copy[i], copy[i + dir]] = [copy[i + dir], copy[i]];
    change(copy);
  };

  return (
    <ActionForm action={action} notice="none" className="space-y-4">
      <input type="hidden" name="payload" value={JSON.stringify(items)} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((p, i) => (
          <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="relative mb-4 flex h-24 items-center justify-center rounded-xl bg-navy">
              {p.logo && <NextImage src={p.logo} alt={p.name} fill sizes="300px" className="object-contain p-5" />}
            </div>
            <div className="space-y-3">
              <Field label={t("partners.logo")} hint={t("partners.logoHint")}>
                <ImageField value={p.logo} onChange={(logo) => logo && patch(i, { logo })} />
                <FieldError name={`logo-${i}`} />
              </Field>
              <Field label={t("partners.name")}>
                <input value={p.name} placeholder={t("partners.untitled", { n: i + 1 })} onChange={(e) => patch(i, { name: e.target.value })} className={inputClass} />
              </Field>
              <Field label={`${t("partners.url")} (${t("common.optional")})`}>
                <input dir="ltr" value={p.url} placeholder="https://" onChange={(e) => patch(i, { url: e.target.value })} className={cx(inputClass, "text-left font-exo")} />
                <FieldError name={`url-${i}`} />
              </Field>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
              <span className="font-exo text-[13px] font-bold text-teal">{i + 1}</span>
              <span className="flex-1" />
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={buttonClass.icon} aria-label={t("common.moveUp")}>
                <Icon name="up" className="h-4 w-4 -rotate-90 rtl:rotate-90" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className={buttonClass.icon} aria-label={t("common.moveDown")}>
                <Icon name="down" className="h-4 w-4 -rotate-90 rtl:rotate-90" />
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
          </div>
        ))}
      </div>

      <button type="button" onClick={() => setPicking(true)} className={buttonClass.secondary}>
        <Icon name="plus" className="h-4 w-4" />
        {t("partners.add")}
      </button>
      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={(logo) => {
            change([...items, { id: Math.random().toString(36).slice(2, 10), name: "", logo, url: "" }]);
            setPicking(false);
          }}
        />
      )}

      <SaveBar dirty={dirty} onSaved={() => setDirty(false)} />
    </ActionForm>
  );
}
