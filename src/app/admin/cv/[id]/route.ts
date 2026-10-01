import fs from "node:fs";
import { cvFile } from "@/server/applications";
import { can, getCurrentUser } from "@/server/auth";

/* Applicants' CVs: only for signed-in users allowed to view applications. */

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !can(user, "applications.view")) return new Response("Not found", { status: 404 });
  const id = Number((await params).id);
  const cv = Number.isInteger(id) ? cvFile(id) : null;
  if (!cv) return new Response("Not found", { status: 404 });

  const inline = new URL(request.url).searchParams.has("inline") && cv.mime === "application/pdf";
  const ascii = cv.name.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "");
  return new Response(new Uint8Array(fs.readFileSync(cv.file)), {
    headers: {
      "Content-Type": cv.mime,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(cv.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
