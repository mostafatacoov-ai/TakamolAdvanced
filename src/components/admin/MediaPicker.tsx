"use client";

import NextImage from "next/image";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { uploadImageFromPicker } from "@/app/admin/_actions/content";
import type { MediaItem } from "@/lib/site-types";
import { useT } from "./I18n";
import { Icon } from "./icons";
import { buttonClass, cx } from "./ui";

/* Images an editor can pick: the media library (which grows as they
   upload) and the website's own images. Shared by every picker on a page. */

type Library = {
  items: MediaItem[];
  add: (item: MediaItem) => void;
  siteImages: string[];
  canUpload: boolean;
};

const LibraryContext = createContext<Library>({ items: [], add: () => {}, siteImages: [], canUpload: false });

export function MediaLibraryProvider({
  items,
  siteImages,
  canUpload,
  children,
}: {
  items: MediaItem[];
  siteImages: string[];
  canUpload: boolean;
  children: ReactNode;
}) {
  const [list, setList] = useState(items);
  return (
    <LibraryContext.Provider value={{ items: list, add: (item) => setList((l) => [item, ...l]), siteImages, canUpload }}>
      {children}
    </LibraryContext.Provider>
  );
}

function Thumb({ src, className }: { src: string; className?: string }) {
  return (
    <span className={cx("relative block overflow-hidden rounded-lg bg-[repeating-conic-gradient(#0b2a3d_0_25%,#08202f_0_50%)] bg-[length:16px_16px]", className)}>
      <NextImage src={src} alt="" fill sizes="200px" className="object-contain" />
    </span>
  );
}

export function MediaPicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const t = useT();
  const library = useContext(LibraryContext);
  const [tab, setTab] = useState<"uploaded" | "site">(library.items.length ? "uploaded" : "site");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    const data = new FormData();
    data.append("file", file);
    const result = await uploadImageFromPicker(data);
    setBusy(false);
    if (result.ok) {
      library.add(result.item);
      onPick(result.item.url);
    } else {
      setError(t(result.message));
    }
  };

  const images = tab === "uploaded" ? library.items.map((i) => i.url) : library.siteImages;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" aria-label={t("app.close")} onClick={onClose} className="absolute inset-0 bg-black/70" />
      <div className="relative flex max-h-[85vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#05192a] shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <h2 className="text-[16px] font-bold text-white">{t("images.pickTitle")}</h2>
          <button type="button" onClick={onClose} className={buttonClass.icon} aria-label={t("app.close")}>
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-5 py-3">
          {(["uploaded", "site"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cx(
                "rounded-lg px-3 py-1.5 text-[13px] font-bold",
                tab === key ? "bg-teal/15 text-teal-cyan" : "text-white/70 hover:text-white",
              )}
            >
              {t(key === "uploaded" ? "images.pickUploaded" : "images.pickSite")}
            </button>
          ))}
          {library.canUpload && (
            <div className="ms-auto">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file);
                  e.target.value = "";
                }}
              />
              <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className={buttonClass.small}>
                <Icon name="upload" className="h-4 w-4" />
                {busy ? t("common.uploading") : t("images.uploadHere")}
              </button>
            </div>
          )}
        </div>

        {error && <p className="mx-5 mt-3 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-100">{error}</p>}

        <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-5 sm:grid-cols-4 md:grid-cols-5">
          {images.length === 0 && <p className="col-span-full py-10 text-center text-[14px] text-steel">{t("common.empty")}</p>}
          {images.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => onPick(src)}
              className="group rounded-xl border border-white/10 p-1.5 text-start transition hover:border-teal"
            >
              <Thumb src={src} className="aspect-square" />
              <span dir="ltr" className="mt-1 block truncate text-[10.5px] text-white/45 group-hover:text-white/80">
                {src.split("/").pop()}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** An image chosen with the picker. With `name`, it's also submitted with the form. */
export function ImageField({
  value,
  onChange,
  name,
  className,
}: {
  value: string;
  onChange: (url: string) => void;
  name?: string;
  className?: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <div className={cx("flex items-center gap-3", className)}>
      {name && <input type="hidden" name={name} value={value} />}
      {value ? (
        <Thumb src={value} className="h-16 w-24 shrink-0 border border-white/10" />
      ) : (
        <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/20 text-white/30">
          <Icon name="images" />
        </span>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setOpen(true)} className={buttonClass.small}>
          <Icon name="images" className="h-4 w-4" />
          {value ? t("images.change") : t("images.choose")}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className={buttonClass.smallDanger}>
            {t("common.remove")}
          </button>
        )}
      </div>
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onPick={(url) => {
            onChange(url);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

/** ImageField for plain forms (keeps its own value). */
export function FormImageField({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  return <ImageField name={name} value={value} onChange={setValue} />;
}
