import { can, getCurrentUser } from "@/server/auth";
import { quotationDocx } from "@/server/quotation-docx";
import { getQuotation, quotationOffer } from "@/server/quotations";

/* The quotation as a Word file in the company's template, for editing
   further: only for signed-in users allowed to view quotation briefs. */

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !can(user, "quotations.view")) return new Response("Not found", { status: 404 });
  const id = Number((await params).id);
  const q = Number.isInteger(id) ? getQuotation(id) : null;
  if (!q) return new Response("Not found", { status: 404 });

  const { offer } = quotationOffer(q);
  const name = `Quotation - ${offer.number || q.clientName}`.replace(/[\\/:*?"<>|]+/g, " ").trim();
  const ascii = name.replace(/[^\x20-\x7e]/g, "_");
  return new Response(new Uint8Array(quotationDocx(offer, name)), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${ascii}.docx"; filename*=UTF-8''${encodeURIComponent(name)}.docx`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
