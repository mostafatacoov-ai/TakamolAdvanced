"use client";

import NextImage from "next/image";
import { useRef } from "react";
import { replaceImage, restoreImage } from "@/app/admin/_actions/content";
import { formatBytes } from "@/lib/admin/format";
import { ActionForm, SubmitButton, useFormResult } from "./forms";
import { useT } from "./I18n";
import { Icon } from "./icons";
import { Badge, buttonClass } from "./ui";

/* One website image with Replace / Restore. Choosing a file submits at once. */
export function ImageTile({
  rel,
  src,
  size,
  replaced,
  replaceable,
}: {
  rel: string;
  src: string;
  size: number;
  replaced: boolean;
  replaceable: boolean;
}) {
  const t = useT();
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="relative aspect-[4/3] bg-[repeating-conic-gradient(#0b2a3d_0_25%,#08202f_0_50%)] bg-[length:16px_16px]">
        <NextImage src={src} alt={rel} fill sizes="240px" className="object-contain" />
        {replaced && (
          <span className="absolute start-2 top-2">
            <Badge tone="teal">{t("images.replaced")}</Badge>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p dir="ltr" className="truncate text-[12px] text-white/70" title={rel}>{rel.split("/").pop()}</p>
        <p className="font-exo text-[11px] text-white/35">{formatBytes(size)}</p>
        {replaceable ? (
          <div className="mt-auto flex flex-wrap gap-2">
            <ActionForm action={replaceImage} notice="bottom" className="contents">
              <ReplaceButton rel={rel} />
            </ActionForm>
            {replaced && (
              <ActionForm action={restoreImage} notice="none" className="contents">
                <input type="hidden" name="rel" value={rel} />
                <SubmitButton variant="small" confirm="images.restore">
                  <Icon name="restore" className="h-3.5 w-3.5" />
                  {t("images.restore")}
                </SubmitButton>
              </ActionForm>
            )}
          </div>
        ) : (
          <p className="mt-auto text-[11.5px] text-white/40">{t("images.svgNote")}</p>
        )}
      </div>
    </div>
  );
}

function ReplaceButton({ rel }: { rel: string }) {
  const t = useT();
  const { pending } = useFormResult();
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input type="hidden" name="rel" value={rel} />
      <input
        ref={input}
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => e.target.files?.length && e.target.form?.requestSubmit()}
      />
      <button type="button" disabled={pending} onClick={() => input.current?.click()} className={buttonClass.small}>
        <Icon name="upload" className="h-3.5 w-3.5" />
        {pending ? t("common.uploading") : t("images.replace")}
      </button>
    </>
  );
}
