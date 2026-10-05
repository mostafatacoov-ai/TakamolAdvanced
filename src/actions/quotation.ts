"use server";

import { after } from "next/server";
import { lookup } from "@/lib/quotation";
import { clientIp } from "@/server/auth";
import { getMessagesFor } from "@/server/content";
import { notifyNewQuotation } from "@/server/mail";
import { getQuotation, submitQuotation as store, type QuotationError } from "@/server/quotations";

export type QuotationState =
  | { ok: true; token: string; at: number }
  | { ok: false; error: QuotationError; fields: string[]; at: number }
  | null;

/* The quotation intake brief filled in by sales people. */
export async function submitQuotation(_previous: QuotationState, form: FormData): Promise<QuotationState> {
  // a field people can't see: only bots fill it in
  if (String(form.get("website") ?? "")) return { ok: true, token: "", at: Date.now() };

  const value = (name: string) => {
    const v = form.get(name);
    return typeof v === "string" ? v : "";
  };
  const values = (name: string) => form.getAll(name).filter((v): v is string => typeof v === "string");

  try {
    const result = await store({
      salesPerson: value("salesPerson"),
      requestDate: value("requestDate"),
      reference: value("reference"),
      department: value("department"),
      clientName: value("clientName"),
      clientType: value("clientType"),
      clientContact: value("clientContact"),
      clientPhone: value("clientPhone"),
      clientEmail: value("clientEmail"),
      clientAddress: value("clientAddress"),
      services: values("services"),
      serviceOther: value("serviceOther"),
      projectName: value("projectName"),
      projectLocation: value("projectLocation"),
      landArea: value("landArea"),
      boundaries: value("boundaries"),
      studyGoal: value("studyGoal"),
      documents: values("documents"),
      clientRequirements: value("clientRequirements"),
      amount: value("amount"),
      amountMax: value("amountMax"),
      durationDays: value("durationDays"),
      validity: value("validity"),
      payments: [value("payment1"), value("payment2"), value("payment3")],
      formats: values("formats"),
      meeting: value("meeting"),
      notes: value("notes"),
      files: form.getAll("attachments").filter((f): f is File => f instanceof File),
      locale: value("locale"),
      ip: await clientIp(),
    });
    if (!result.ok) return { ok: false, error: result.error, fields: result.fields ?? [], at: Date.now() };
    // tell the team once the response is on its way
    after(async () => {
      const q = getQuotation(result.id);
      if (q) await notifyNewQuotation(q, lookup(getMessagesFor("ar").Quotation));
    });
    return { ok: true, token: result.token, at: Date.now() };
  } catch (error) {
    console.error("[quotation]", error);
    return { ok: false, error: "errorGeneric", fields: [], at: Date.now() };
  }
}
