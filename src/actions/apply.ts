"use server";

import { submitApplication as store, type SubmitError } from "@/server/applications";
import { clientIp } from "@/server/auth";

export type ApplyState = { ok: boolean; error?: SubmitError; at: number } | null;

/* The public application form on the Join page. */
export async function submitApplication(_previous: ApplyState, form: FormData): Promise<ApplyState> {
  // a field people can't see: only bots fill it in
  if (String(form.get("website") ?? "")) return { ok: true, at: Date.now() };

  const value = (name: string) => {
    const v = form.get(name);
    return typeof v === "string" ? v : "";
  };
  const job = Number(value("job"));
  const cv = form.get("cv");

  try {
    const result = await store({
      name: value("name"),
      email: value("email"),
      phone: value("phone"),
      linkedin: value("linkedin"),
      message: value("message"),
      jobId: Number.isInteger(job) && job > 0 ? job : null,
      consent: form.get("consent") === "on",
      cv: cv instanceof File ? cv : null,
      locale: value("locale"),
      ip: await clientIp(),
    });
    return result.ok ? { ok: true, at: Date.now() } : { ok: false, error: result.error, at: Date.now() };
  } catch (error) {
    console.error("[apply]", error);
    return { ok: false, error: "errorGeneric", at: Date.now() };
  }
}
