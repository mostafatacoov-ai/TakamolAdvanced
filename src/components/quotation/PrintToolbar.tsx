"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

/* "Download PDF" opens the browser's print dialog, where the sheet is saved
   as a PDF; the bar itself is left out of the print. */
export default function PrintToolbar() {
  const t = useTranslations("Quotation");
  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-[#041a2b]/95 backdrop-blur print:hidden">
      <div className="mx-auto flex w-full max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/quotation-request" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-[13.5px] font-bold text-white transition hover:border-teal hover:text-teal">
          {t("print.backToForm")}
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-[12.5px] text-steel sm:inline">{t("print.downloadHint")}</span>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-[14px] font-bold text-navy transition hover:bg-teal-cyan"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" /></svg>
            {t("print.download")}
          </button>
        </div>
      </div>
    </div>
  );
}
