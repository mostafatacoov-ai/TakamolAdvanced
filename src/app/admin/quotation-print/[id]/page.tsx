import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoPrint } from "@/components/admin/AutoPrint";
import { Icon } from "@/components/admin/icons";
import { OfferOverflowNotice } from "@/components/admin/OfferOverflowNotice";
import { PrintButton } from "@/components/admin/PrintButton";
import { buttonClass } from "@/components/admin/ui";
import QuotationOfferSheet from "@/components/quotation/QuotationOfferSheet";
import { resolveAssetSrc } from "@/lib/assets";
import { getAdminT } from "@/server/admin-lang";
import { can, requirePermission } from "@/server/auth";
import { getAssetOverrides } from "@/server/images";
import { getQuotation, quotationOffer } from "@/server/quotations";

/* The quotation in the company's template, outside the panel's sidebar so
   "Save as PDF" gets only the three Letter pages. */

export const dynamic = "force-dynamic";

const LETTERHEAD = "/assets/quotation/letterhead.jpg";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const q = Number.isInteger(id) ? getQuotation(id) : null;
  // the title becomes the PDF's file name
  return { title: { absolute: q ? `Quotation - ${quotationOffer(q).offer.number || q.clientName}` : "Quotation" } };
}

export default async function QuotationPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const user = await requirePermission("quotations.view");
  const id = Number((await params).id);
  const q = Number.isInteger(id) ? getQuotation(id) : null;
  if (!q) notFound();
  const t = await getAdminT();
  const { offer } = quotationOffer(q);
  // "Download PDF" opens the print window straight away
  const autoPrint = (await searchParams).print !== undefined;

  return (
    <div className="min-h-screen bg-[#0a2437] print:bg-white">
      {/* the template is a US Letter page printed edge to edge */}
      <style>{"@page { size: letter; margin: 0; }"}</style>
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#041a2b]/95 backdrop-blur print:hidden">
        <div className="mx-auto flex w-full max-w-[816px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/quotations/${q.id}`} className={buttonClass.secondary}>
              <Icon name="up" className="h-4 w-4 -rotate-90 rtl:rotate-90" />
              {t("common.back")}
            </Link>
            {can(user, "quotations.manage") && (
              <Link href={`/admin/quotations/${q.id}/offer`} className={buttonClass.secondary}>
                <Icon name="edit" className="h-4 w-4" />
                {t("offer.edit")}
              </Link>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="hidden text-[12.5px] text-steel sm:inline">{t("offer.printHint")}</span>
            <a href={`/admin/quotation-docx/${q.id}`} download className={buttonClass.secondary}>
              <Icon name="file" className="h-4 w-4" />
              {t("offer.downloadWord")}
            </a>
            <PrintButton />
          </div>
        </div>
        <div className="mx-auto w-full max-w-[816px] px-4 pb-3 empty:hidden">
          <OfferOverflowNotice />
        </div>
      </div>
      {autoPrint && <AutoPrint />}
      <main className="overflow-x-auto px-3 py-6 sm:px-6 sm:py-10 print:overflow-visible print:p-0">
        <QuotationOfferSheet offer={offer} letterhead={resolveAssetSrc(LETTERHEAD, getAssetOverrides())} />
      </main>
    </div>
  );
}
