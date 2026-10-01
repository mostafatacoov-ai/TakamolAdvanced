"use client";

import { useEffect, useState } from "react";
import type { FormAction } from "@/lib/admin/action-state";
import { ActionForm, FieldError, FormNotice, SubmitButton, useFormResult, useUnsavedWarning } from "./forms";
import { useT } from "./I18n";
import { Icon } from "./icons";
import { Badge, Card, cx, inputClass } from "./ui";

export type EditorField = {
  path: string;
  label: string;
  ar: string;
  en: string;
  arOriginal: string;
  enOriginal: string;
  edited: boolean;
};

export type EditorGroup = { key: string; label: string; fields: EditorField[] };

export function ContentEditor({ action, groups }: { action: FormAction; groups: EditorGroup[] }) {
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);

  return (
    <ActionForm action={action} notice="none" className="space-y-6">
      {groups.map((group) => (
        <Card key={group.key} title={group.label}>
          <div className="space-y-6">
            {group.fields.map((field) => (
              <TextRow key={field.path} field={field} onChange={() => setDirty(true)} />
            ))}
          </div>
        </Card>
      ))}
      <SaveBar dirty={dirty} onSaved={() => setDirty(false)} />
    </ActionForm>
  );
}

/** Sticky bar with the save button and the result of the last save. */
export function SaveBar({ dirty, onSaved }: { dirty: boolean; onSaved: () => void }) {
  const t = useT();
  const { state } = useFormResult();
  useEffect(() => {
    if (state?.ok) onSaved();
    if (state?.errors) document.querySelector("[data-field-error]")?.scrollIntoView({ block: "center", behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <div className="sticky bottom-0 z-20 -mx-4 border-t border-white/10 bg-[#03111d]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="common.saving">
          <Icon name="check" className="h-4 w-4" />
          {t("common.save")}
        </SubmitButton>
        {dirty && <span className="text-[13px] font-bold text-amber-200">{t("common.unsaved")}</span>}
        <FormNotice className="mb-0 flex-1 py-2" />
      </div>
    </div>
  );
}

function TextRow({ field, onChange }: { field: EditorField; onChange: () => void }) {
  const t = useT();
  const [ar, setAr] = useState(field.ar);
  const [en, setEn] = useState(field.en);
  const long = Math.max(field.arOriginal.length, field.enOriginal.length) > 90 || field.arOriginal.includes("\n");
  const changed = ar !== field.arOriginal || en !== field.enOriginal;

  const box = (lang: "ar" | "en", value: string, original: string, set: (v: string) => void) => (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[11.5px] font-bold uppercase tracking-wide text-white/40">
          {t(lang === "ar" ? "common.arabic" : "common.english")}
        </span>
        {value !== original && (
          <button
            type="button"
            onClick={() => {
              set(original);
              onChange();
            }}
            className="inline-flex items-center gap-1 text-[11.5px] font-bold text-teal hover:text-teal-cyan"
            title={original}
          >
            <Icon name="restore" className="h-3.5 w-3.5" />
            {t("texts.restore")}
          </button>
        )}
      </div>
      <textarea
        name={`${lang}|${field.path}`}
        value={value}
        dir={lang === "ar" ? "rtl" : "ltr"}
        rows={long ? 3 : 1}
        onChange={(e) => {
          set(e.target.value);
          onChange();
        }}
        className={cx(inputClass, "min-h-[44px] resize-y leading-relaxed [field-sizing:content]", lang === "ar" ? "text-right" : "text-left")}
      />
      <FieldError name={`${lang}:${field.path}`} />
    </div>
  );

  return (
    <div id={`f-${field.path}`} className="scroll-mt-24 rounded-xl border border-transparent target:border-teal/50 target:bg-teal/5">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[13px] font-bold text-iceblue">{field.label}</span>
        {(field.edited || changed) && <Badge tone={changed ? "teal" : "gray"}>{t("texts.edited")}</Badge>}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {box("ar", ar, field.arOriginal, setAr)}
        {box("en", en, field.enOriginal, setEn)}
      </div>
    </div>
  );
}
