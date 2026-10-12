"use client";

import { useEffect, useState } from "react";
import { useT } from "./I18n";
import { Icon } from "./icons";

/** Warns when a page of the quotation outgrows its sheet (it would print on an extra page). */
export function OfferOverflowNotice() {
  const t = useT();
  const [pages, setPages] = useState<number[]>([]);

  useEffect(() => {
    const check = () => {
      const sheets = [...document.querySelectorAll<HTMLElement>(".qo-sheet")];
      // a sheet is one US Letter page tall (792pt) unless its content pushes it longer
      setPages(sheets.flatMap((s, i) => (s.offsetHeight > (792 * 4) / 3 + 1 ? [i + 1] : [])));
    };
    check();
    void document.fonts?.ready.then(check);
  }, []);

  if (!pages.length) return null;
  return (
    <p role="status" className="flex items-start gap-2 text-[12.5px] font-bold leading-relaxed text-amber-200">
      <Icon name="warning" className="mt-0.5 h-4 w-4 shrink-0" />
      {t("offer.overflow", { pages: pages.join("، ") })}
    </p>
  );
}
