import fs from "node:fs";
import { can, getCurrentUser } from "@/server/auth";
import { quotationReplyFile } from "@/server/quotations";

/* The copies of quotations emailed to clients: only for signed-in users
   allowed to view quotation briefs. */

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !can(user, "quotations.view")) return new Response("Not found", { status: 404 });
  const id = Number((await params).id);
  const file = Number.isInteger(id) ? quotationReplyFile(id) : null;
  if (!file) return new Response("Not found", { status: 404 });

  const inline = file.mime === "application/pdf" || file.mime.startsWith("image/");
  const ascii = file.name.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "");
  return new Response(new Uint8Array(fs.readFileSync(file.file)), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
