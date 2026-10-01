"use client";

import NextImage from "next/image";
import { useState } from "react";
import type { AdminKey } from "@/lib/admin/i18n";
import { newId } from "@/lib/blocks";
import { SOCIAL_KEYS, SOCIAL_NETWORKS, type SocialLink, type SocialNetwork } from "@/lib/social";
import { FieldError } from "./forms";
import { useT } from "./I18n";
import { Icon } from "./icons";
import { ImageField } from "./MediaPicker";
import { buttonClass, cx, EmptyState, Field, inputClass } from "./ui";

const OWN_NAME: Partial<Record<SocialNetwork, AdminKey>> = {
  website: "social.website",
  email: "social.email",
  custom: "social.custom",
};

/* The footer's social icons, edited as an ordered list. Submitted with the
   settings form as JSON in the "social" field. */
export function SocialLinksEditor({ items: initial }: { items: SocialLink[] }) {
  const t = useT();
  const [items, setItems] = useState(initial);

  const networkName = (n: SocialNetwork) => (OWN_NAME[n] ? t(OWN_NAME[n]!) : SOCIAL_NETWORKS[n].name);
  // functional updates, so quick successive clicks never work on a stale list
  const patch = (i: number, p: Partial<SocialLink>) => setItems((list) => list.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const move = (i: number, dir: -1 | 1) =>
    setItems((list) => {
      const copy = [...list];
      [copy[i], copy[i + dir]] = [copy[i + dir], copy[i]];
      return copy;
    });
  const add = () =>
    setItems((list) => {
      const used = new Set(list.map((x) => x.network));
      const next = SOCIAL_KEYS.find((k) => k !== "custom" && !used.has(k)) ?? "custom";
      return [...list, { id: newId(), network: next, url: "", label: "", icon: "" }];
    });

  return (
    <div className="space-y-3">
      <input type="hidden" name="social" value={JSON.stringify(items)} />
      {items.length === 0 && <EmptyState>{t("settings.socialEmpty")}</EmptyState>}

      {items.map((item, i) => (
        <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 md:p-4">
          <div className="flex flex-wrap items-start gap-3">
            {/* how it looks in the footer */}
            <span className="mt-6 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-[#0f4a56] text-white">
              {item.network === "custom" ? (
                item.icon ? (
                  <span className="relative h-[22px] w-[22px]">
                    <NextImage src={item.icon} alt="" fill sizes="22px" className="rounded object-contain" />
                  </span>
                ) : (
                  <Icon name="images" className="h-5 w-5 text-white/40" />
                )
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d={SOCIAL_NETWORKS[item.network].path} /></svg>
              )}
            </span>

            <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[200px_1fr]">
              <Field label={t("settings.platform")}>
                <select
                  value={item.network}
                  onChange={(e) => patch(i, { network: e.target.value as SocialNetwork })}
                  className={inputClass}
                >
                  {SOCIAL_KEYS.map((k) => (
                    <option key={k} value={k}>{networkName(k)}</option>
                  ))}
                </select>
              </Field>
              <Field label={item.network === "email" ? t("common.email") : t("settings.socialLink")}>
                <input
                  value={item.url}
                  onChange={(e) => patch(i, { url: e.target.value })}
                  dir="ltr"
                  placeholder={item.network === "email" ? "name@takamoladvanced.sa" : "https://"}
                  className={cx(inputClass, "text-left font-exo")}
                />
                <FieldError name={`social-url-${i}`} />
              </Field>

              {item.network === "custom" && (
                <>
                  <Field label={t("settings.socialName")} hint={t("settings.socialNameHint")}>
                    <input value={item.label} onChange={(e) => patch(i, { label: e.target.value })} className={inputClass} />
                    <FieldError name={`social-label-${i}`} />
                  </Field>
                  <Field label={t("settings.socialIcon")} hint={t("settings.socialIconHint")}>
                    <ImageField value={item.icon} onChange={(icon) => patch(i, { icon })} />
                    <FieldError name={`social-icon-${i}`} />
                  </Field>
                </>
              )}
            </div>

            <div className="mt-6 flex items-center gap-1.5">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={buttonClass.icon} aria-label={t("common.moveUp")}>
                <Icon name="up" className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className={buttonClass.icon} aria-label={t("common.moveDown")}>
                <Icon name="down" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setItems((list) => list.filter((x) => x.id !== item.id))}
                className={cx(buttonClass.icon, "hover:border-rose-400 hover:text-rose-300")}
                aria-label={t("common.remove")}
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={add} className={buttonClass.secondary}>
        <Icon name="plus" className="h-4 w-4" />
        {t("settings.socialAdd")}
      </button>
    </div>
  );
}
