import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import PrintToolbar from "@/components/quotation/PrintToolbar";
import QuotationSheet from "@/components/quotation/QuotationSheet";
import { lookup } from "@/lib/quotation";
import { getQuotationByToken } from "@/server/quotations";

/* A submitted brief, behind its unguessable link, ready to print or save
   as a PDF. The admin area links here too. */

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const q = getQuotationByToken(token);
  const messages = await getMessages();
  const t = lookup((messages as Record<string, unknown>).Quotation);
  return {
    title: q ? `${t("title")} – ${q.reference || q.clientName}` : t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function QuotationPrintPage({ params }: Props) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const q = getQuotationByToken(token);
  if (!q) notFound();
  const messages = await getMessages();
  const t = lookup((messages as Record<string, unknown>).Quotation);

  return (
    <div className="min-h-screen bg-[#0a2437] print:bg-white">
      <PrintToolbar />
      <main className="px-3 py-6 sm:px-6 sm:py-10 print:p-0">
        <QuotationSheet q={q} t={t} locale={locale} />
      </main>
    </div>
  );
}
