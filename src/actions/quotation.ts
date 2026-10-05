"use server";

import { clientIp } from "@/server/auth";
import { submitQuotation as store, type QuotationError } from "@/server/quotations";

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
    const result = store({
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
      durationDays: value("durationDays"),
      validity: value("validity"),
      payments: [value("payment1"), value("payment2"), value("payment3")],
      formats: values("formats"),
      meeting: value("meeting"),
      notes: value("notes"),
      locale: value("locale"),
      ip: await clientIp(),
    });
    return result.ok
      ? { ok: true, token: result.token, at: Date.now() }
      : { ok: false, error: result.error, fields: result.fields ?? [], at: Date.now() };
  } catch (error) {
    console.error("[quotation]", error);
    return { ok: false, error: "errorGeneric", fields: [], at: Date.now() };
  }
}
