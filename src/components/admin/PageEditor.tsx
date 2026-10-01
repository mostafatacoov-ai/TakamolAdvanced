"use client";

import { useState, type ReactNode } from "react";
import type { FormAction } from "@/lib/admin/action-state";
import type { AdminKey } from "@/lib/admin/i18n";
import { BLOCK_TYPES, newBlock, newListItem, type Block, type BlockType, type CardItem, type LItem } from "@/lib/blocks";
import type { Localized } from "@/lib/site-types";
import { SaveBar } from "./ContentEditor";
import { ActionForm, FieldError, useUnsavedWarning } from "./forms";
import { useT } from "./I18n";
import { Icon } from "./icons";
import { ImageField, MediaPicker } from "./MediaPicker";
import { Badge, buttonClass, Card, cx, EmptyState, Field, inputClass } from "./ui";

export type EditablePage = {
  slug: string;
  title: Localized;
  description: Localized;
  status: "draft" | "published";
  blocks: Block[];
};

export function PageEditor({
  page,
  action,
  links,
}: {
  page: EditablePage;
  action: FormAction;
  /** site addresses suggested for buttons */
  links: string[];
}) {
  const t = useT();
  const [data, setData] = useState(page);
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);

  const update = (patch: Partial<EditablePage>) => {
    setData((d) => ({ ...d, ...patch }));
    setDirty(true);
  };
  const setBlocks = (fn: (blocks: Block[]) => Block[]) => update({ blocks: fn(data.blocks) });

  return (
    <ActionForm action={action} notice="none" className="space-y-6">
      <input type="hidden" name="payload" value={JSON.stringify(data)} />

      <Card title={t("pages.settings")}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <LocalizedInput label={t("common.title")} value={data.title} onChange={(title) => update({ title })} />
          <div className="md:col-span-2">
            <FieldError name="title" />
          </div>
          <Field label={t("pages.address")} hint={t("pages.addressHint", { slug: data.slug || "…" })} className="md:col-span-2">
            <div dir="ltr" className="flex items-center gap-2">
              <span className="font-exo text-[15px] text-white/50">/</span>
              <input
                value={data.slug}
                onChange={(e) => update({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                className={cx(inputClass, "text-left font-exo")}
              />
            </div>
            <FieldError name="slug" />
          </Field>
          <LocalizedInput label={t("pages.seo")} value={data.description} onChange={(description) => update({ description })} multiline />
          <Field label={t("pages.publishState")} hint={t("pages.publishHint")} className="md:col-span-2">
            <div className="flex flex-wrap gap-2">
              {(["draft", "published"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => update({ status })}
                  className={cx(
                    "rounded-xl border px-4 py-2 text-[14px] font-bold transition",
                    data.status === status
                      ? status === "published" ? "border-teal bg-teal/15 text-teal-cyan" : "border-amber-300/40 bg-amber-400/10 text-amber-200"
                      : "border-white/15 text-white/60 hover:text-white",
                  )}
                >
                  {t(status === "published" ? "pages.status.published" : "pages.status.draft")}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Card>

      <Card title={t("pages.sections")} description={t("pages.menuHint")}>
        <div className="space-y-4">
          {data.blocks.length === 0 && <EmptyState>{t("pages.empty")}</EmptyState>}
          {data.blocks.map((block, i) => (
            <BlockEditor
              key={block.id}
              block={block}
              index={i}
              total={data.blocks.length}
              links={links}
              onChange={(next) => setBlocks((bs) => bs.map((b) => (b.id === block.id ? next : b)))}
              onMove={(dir) =>
                setBlocks((bs) => {
                  const copy = [...bs];
                  const j = i + dir;
                  [copy[i], copy[j]] = [copy[j], copy[i]];
                  return copy;
                })
              }
              onRemove={() => setBlocks((bs) => bs.filter((b) => b.id !== block.id))}
            />
          ))}
        </div>
        <AddBlock onAdd={(type) => setBlocks((bs) => [...bs, newBlock(type)])} />
      </Card>

      <SaveBar dirty={dirty} onSaved={() => setDirty(false)} />
    </ActionForm>
  );
}

function AddBlock({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5">
      <button type="button" onClick={() => setOpen((v) => !v)} className={buttonClass.secondary}>
        <Icon name="plus" className="h-4 w-4" />
        {t("pages.addSection")}
      </button>
      {open && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {BLOCK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onAdd(type);
                setOpen(false);
              }}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-start transition hover:border-teal/50 hover:bg-white/[0.06]"
            >
              <span className="block text-[14px] font-bold text-white">{t(`block.${type}` as AdminKey)}</span>
              <span className="mt-0.5 block text-[12px] leading-relaxed text-steel">{t(`block.${type}.hint` as AdminKey)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- one section ------------------------------------------------------- */

function BlockEditor({
  block,
  index,
  total,
  links,
  onChange,
  onMove,
  onRemove,
}: {
  block: Block;
  index: number;
  total: number;
  links: string[];
  onChange: (block: Block) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(true);
  // the fields differ per section type; sanitizeBlocks() re-checks them on save
  const set = (key: string, value: unknown) => onChange({ ...block, [key]: value } as Block);

  return (
    <div className="rounded-xl border border-white/10 bg-[#041a2b]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="font-exo text-[13px] font-bold text-teal">{index + 1}</span>
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex-1 text-start text-[14px] font-bold text-white">
          {t(`block.${block.type}` as AdminKey)}
        </button>
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className={buttonClass.icon} aria-label={t("common.moveUp")}>
          <Icon name="up" className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className={buttonClass.icon} aria-label={t("common.moveDown")}>
          <Icon name="down" className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => window.confirm(t("common.confirmDelete")) && onRemove()}
          className={cx(buttonClass.icon, "hover:border-rose-400 hover:text-rose-300")}
          aria-label={t("common.remove")}
        >
          <Icon name="trash" className="h-4 w-4" />
        </button>
      </div>
      {open && <div className="space-y-4 p-4">{fields()}</div>}
    </div>
  );

  function fields(): ReactNode {
    switch (block.type) {
      case "hero":
        return (
          <>
            <LocalizedInput label={t("f.title")} value={block.title} onChange={(v) => set("title", v)} />
            <LocalizedInput label={t("f.subtitle")} value={block.subtitle} onChange={(v) => set("subtitle", v)} multiline />
            <Field label={t("common.image")}>
              <ImageField value={block.image} onChange={(v) => set("image", v)} />
            </Field>
          </>
        );
      case "intro":
        return (
          <>
            <LocalizedInput label={t("f.title")} value={block.title} onChange={(v) => set("title", v)} />
            <LocalizedInput label={t("f.tagline")} value={block.tagline} onChange={(v) => set("tagline", v)} />
            <LocalizedInput label={t("f.text")} value={block.text} onChange={(v) => set("text", v)} multiline />
          </>
        );
      case "text":
        return (
          <>
            <LocalizedInput label={t("f.title")} value={block.title} onChange={(v) => set("title", v)} />
            <LocalizedInput label={t("f.text")} hint={t("f.textHint")} value={block.text} onChange={(v) => set("text", v)} multiline rows={6} />
          </>
        );
      case "imageText":
        return (
          <>
            <LocalizedInput label={t("f.title")} value={block.title} onChange={(v) => set("title", v)} />
            <LocalizedInput label={t("f.text")} hint={t("f.textHint")} value={block.text} onChange={(v) => set("text", v)} multiline rows={5} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label={t("common.image")}>
                <ImageField value={block.image} onChange={(v) => set("image", v)} />
              </Field>
              <Field label={t("f.imageSide")}>
                <select value={block.imageSide} onChange={(e) => set("imageSide", e.target.value as "start" | "end")} className={inputClass}>
                  <option value="start">{t("f.side.start")}</option>
                  <option value="end">{t("f.side.end")}</option>
                </select>
              </Field>
            </div>
          </>
        );
      case "features":
        return (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px]">
              <LocalizedInput label={t("f.hub")} value={block.hub} onChange={(v) => set("hub", v)} />
              <Field label={t("f.layout")}>
                <select value={block.layout} onChange={(e) => set("layout", e.target.value as "sides" | "below")} className={inputClass}>
                  <option value="sides">{t("f.layout.sides")}</option>
                  <option value="below">{t("f.layout.below")}</option>
                </select>
              </Field>
            </div>
            <ListEditor<LItem>
              items={block.items}
              onChange={(items) => set("items", items)}
              create={newListItem.features}
              render={(item, update) => (
                <>
                  <LocalizedInput label={t("f.title")} value={item.title} onChange={(v) => update({ ...item, title: v })} />
                  <LocalizedInput label={t("f.desc")} value={item.desc} onChange={(v) => update({ ...item, desc: v })} multiline />
                </>
              )}
            />
          </>
        );
      case "steps":
        return (
          <ListEditor<Localized>
            items={block.items}
            onChange={(items) => set("items", items)}
            create={newListItem.steps}
            render={(item, update) => <LocalizedInput label={t("f.title")} value={item} onChange={update} />}
          />
        );
      case "cards":
        return (
          <>
            <LocalizedInput label={t("f.title")} value={block.title} onChange={(v) => set("title", v)} />
            <ListEditor<CardItem>
              items={block.items}
              onChange={(items) => set("items", items)}
              create={newListItem.cards}
              render={(item, update) => (
                <>
                  <LocalizedInput label={t("f.title")} value={item.title} onChange={(v) => update({ ...item, title: v })} />
                  <LocalizedInput label={t("f.desc")} value={item.desc} onChange={(v) => update({ ...item, desc: v })} multiline />
                  <Field label={t("common.image")}>
                    <ImageField value={item.image} onChange={(v) => update({ ...item, image: v })} />
                  </Field>
                </>
              )}
            />
          </>
        );
      case "banner":
        return (
          <>
            <LocalizedInput label={t("f.title")} value={block.title} onChange={(v) => set("title", v)} />
            <LocalizedInput label={t("f.text")} value={block.text} onChange={(v) => set("text", v)} multiline />
            <Field label={t("common.image")}>
              <ImageField value={block.image} onChange={(v) => set("image", v)} />
            </Field>
          </>
        );
      case "cta":
        return (
          <>
            <LocalizedInput label={t("f.title")} value={block.title} onChange={(v) => set("title", v)} />
            <LocalizedInput label={t("f.text")} value={block.text} onChange={(v) => set("text", v)} multiline />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <LocalizedInput label={t("f.button")} value={block.button} onChange={(v) => set("button", v)} />
              <Field label={t("f.href")} hint={t("f.hrefHint")}>
                <input
                  dir="ltr"
                  list={`links-${block.id}`}
                  value={block.href}
                  onChange={(e) => set("href", e.target.value)}
                  className={cx(inputClass, "text-left font-exo")}
                />
                <datalist id={`links-${block.id}`}>
                  {links.map((href) => <option key={href} value={href} />)}
                </datalist>
              </Field>
            </div>
          </>
        );
      case "gallery":
        return (
          <GalleryEditor images={block.images} onChange={(images) => set("images", images)} />
        );
    }
  }
}

/* ---- building blocks of the editor ------------------------------------- */

function LocalizedInput({
  label,
  hint,
  value,
  onChange,
  multiline = false,
  rows = 3,
}: {
  label: string;
  hint?: string;
  value: Localized;
  onChange: (value: Localized) => void;
  multiline?: boolean;
  rows?: number;
}) {
  const t = useT();
  const control = (lang: "ar" | "en") => {
    const common = {
      value: value[lang],
      dir: lang === "ar" ? "rtl" : "ltr",
      placeholder: t(lang === "ar" ? "common.arabic" : "common.english"),
      className: cx(inputClass, lang === "ar" ? "text-right" : "text-left"),
    } as const;
    return multiline ? (
      <textarea {...common} rows={rows} onChange={(e) => onChange({ ...value, [lang]: e.target.value })} className={cx(common.className, "resize-y leading-relaxed")} />
    ) : (
      <input {...common} onChange={(e) => onChange({ ...value, [lang]: e.target.value })} />
    );
  };
  return (
    <Field label={label} hint={hint} className="md:col-span-2">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {control("ar")}
        {control("en")}
      </div>
    </Field>
  );
}

function ListEditor<T>({
  items,
  onChange,
  create,
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  render: (item: T, update: (item: T) => void) => ReactNode;
}) {
  const t = useT();
  const move = (i: number, dir: -1 | 1) => {
    const copy = [...items];
    [copy[i], copy[i + dir]] = [copy[i + dir], copy[i]];
    onChange(copy);
  };
  return (
    <div>
      <p className="mb-2 text-[13px] font-bold text-iceblue">{t("f.items")}</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Badge tone="gray">{t("f.item", { n: i + 1 })}</Badge>
              <span className="flex-1" />
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={buttonClass.icon} aria-label={t("common.moveUp")}>
                <Icon name="up" className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className={buttonClass.icon} aria-label={t("common.moveDown")}>
                <Icon name="down" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className={cx(buttonClass.icon, "hover:border-rose-400 hover:text-rose-300")}
                aria-label={t("common.remove")}
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">{render(item, (next) => onChange(items.map((x, j) => (j === i ? next : x))))}</div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, create()])} className={cx(buttonClass.small, "mt-3")}>
        <Icon name="plus" className="h-4 w-4" />
        {t("f.addItem")}
      </button>
    </div>
  );
}

function GalleryEditor({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const t = useT();
  const [picking, setPicking] = useState(false);
  return (
    <div>
      <p className="mb-2 text-[13px] font-bold text-iceblue">{t("f.images")}</p>
      <div className="space-y-2">
        {images.map((src, i) => (
          <ImageField
            key={`${src}-${i}`}
            value={src}
            onChange={(v) => onChange(v ? images.map((x, j) => (j === i ? v : x)) : images.filter((_, j) => j !== i))}
          />
        ))}
        <button type="button" onClick={() => setPicking(true)} className={buttonClass.small}>
          <Icon name="plus" className="h-4 w-4" />
          {t("f.addImage")}
        </button>
      </div>
      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={(url) => {
            onChange([...images, url]);
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}
