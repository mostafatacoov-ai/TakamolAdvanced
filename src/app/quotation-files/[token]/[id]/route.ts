import fs from "node:fs";
import { quotationFile } from "@/server/quotations";

/* Attachments of a quotation brief, served behind the brief's unguessable
   token (the same link that opens its printable sheet). */

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await params;
  const fileId = Number(id);
  const file = Number.isInteger(fileId) ? quotationFile(token, fileId) : null;
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
