"use client";

import { useState } from "react";
import { FieldError } from "./forms";
import { useT } from "./I18n";
import { cx, Field, inputClass } from "./ui";

const toSlug = (text: string) =>
  text.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60);

/* Title fields + address; the address follows the English title until edited. */
export function NewPageFields() {
  const t = useT();
  const [slug, setSlug] = useState("");
  const [touched, setTouched] = useState(false);
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field label={`${t("common.title")} — ${t("common.arabic")}`} htmlFor="title_ar">
        <input id="title_ar" name="title_ar" dir="rtl" className={inputClass} />
        <FieldError name="title_ar" />
      </Field>
      <Field label={`${t("common.title")} — ${t("common.english")}`} htmlFor="title_en">
        <input
          id="title_en"
          name="title_en"
          dir="ltr"
          className={cx(inputClass, "text-left")}
          onChange={(e) => !touched && setSlug(toSlug(e.target.value))}
        />
      </Field>
      <Field label={t("pages.address")} hint={t("pages.addressHint", { slug: slug || "…" })} htmlFor="slug" className="md:col-span-2">
        <div dir="ltr" className="flex items-center gap-2">
          <span className="font-exo text-[15px] text-white/50">/</span>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setTouched(true);
              setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
            }}
            className={cx(inputClass, "text-left font-exo")}
          />
        </div>
        <FieldError name="slug" />
      </Field>
    </div>
  );
}
