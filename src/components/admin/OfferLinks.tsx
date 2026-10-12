import type { Translate } from "@/lib/admin/i18n";
import { Icon } from "./icons";
import { buttonClass } from "./ui";

/** View the quotation, or download it as a PDF (through the print window) or as a Word file. */
export function OfferLinks({ id, t, view = true }: { id: number; t: Translate; view?: boolean }) {
  return (
    <>
      {view && (
        <a href={`/admin/quotation-print/${id}`} target="_blank" rel="noopener noreferrer" className={buttonClass.secondary}>
          <Icon name="eye" className="h-4 w-4" />
          {t("offer.view")}
        </a>
      )}
      <a href={`/admin/quotation-print/${id}?print=1`} target="_blank" rel="noopener noreferrer" className={buttonClass.secondary}>
        <Icon name="download" className="h-4 w-4" />
        {t("offer.downloadPdf")}
      </a>
      <a href={`/admin/quotation-docx/${id}`} download className={buttonClass.secondary}>
        <Icon name="file" className="h-4 w-4" />
        {t("offer.downloadWord")}
      </a>
    </>
  );
}
