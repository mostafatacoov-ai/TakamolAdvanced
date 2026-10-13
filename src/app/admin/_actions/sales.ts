"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/admin/action-state";
import type { AdminKey } from "@/lib/admin/i18n";
import { DEFAULT_LABELS, normalizeOffer } from "@/lib/quotation-offer";
import { done, EMAIL, failed, guard, handle, idField, refreshAdmin, text } from "@/server/action-utils";
import { logActivity } from "@/server/activity";
import {
  deleteQuotation, getQuotation, isQuotationStatus, saveQuotationOffer, sendQuotationReply, updateQuotation,
} from "@/server/quotations";

/* ---- quotation briefs -------------------------------------------------- */

export async function updateQuotationAction(id: number, _state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("quotations.manage");
    const q = getQuotation(id);
    if (!q) return failed("msg.error");
    const status = text(form, "status", 30);
    if (!isQuotationStatus(status)) return failed("msg.invalid");
    updateQuotation(id, status, text(form, "notes", 4000));
    logActivity(user, "quotation.update", `#${id} ${q.reference || q.clientName}`);
    refreshAdmin();
    return done();
  });
}

export async function deleteQuotationAction(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("quotations.manage");
    const id = idField(form);
    const q = id ? deleteQuotation(id) : null;
    if (q) logActivity(user, "quotation.delete", `#${q.id} ${q.reference || q.clientName}`);
    refreshAdmin();
    redirect("/admin/quotations");
  });
}

/* ---- the quotation document ------------------------------------------- */

/** A price or quantity as typed ("10,000", Arabic digits): a number, not below zero. */
const isAmount = (v: string) => {
  const n = Number(v.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[,\s]/g, ""));
  return Number.isFinite(n) && n >= 0;
};

export async function saveOfferAction(id: number, _state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("quotations.manage");
    const q = getQuotation(id);
    if (!q) return failed("msg.error");
    // "draft again from the brief": drop the stored quotation, whatever the fields hold
    if (text(form, "intent", 10) === "reset") {
      saveQuotationOffer(id, null);
      logActivity(user, "quotation.offer", `#${id} ${q.reference || q.clientName}`);
      refreshAdmin();
      return done("msg.offerReset");
    }
    // one entry per line
    const lines = (name: string) => text(form, name, 8000).split("\n");
    const column = (name: string) => form.getAll(name).map((v) => (typeof v === "string" ? v.trim() : ""));
    const [areas, details, quantities, prices] = ["itemArea", "itemDetails", "itemQuantity", "itemPrice"].map(column);
    const [bankLabels, bankValues] = ["bankLabel", "bankValue"].map(column);
    const accented = new Set(column("bankAccent"));

    const errors: Record<string, AdminKey> = {};
    // every row in use needs a price, and a quantity if one is typed
    const used = (i: number) => Boolean(prices[i] || details[i]);
    if (prices.some((p, i) => used(i) && (!isAmount(p || "x") || (quantities[i] && !isAmount(quantities[i]))))) {
      errors.items = "err.offerPrice";
    }
    const offer = normalizeOffer({
      number: text(form, "number", 40),
      date: text(form, "date", 10),
      validUntil: text(form, "validUntil", 10),
      title: text(form, "title", 200),
      recipient: text(form, "recipient", 200),
      intro: text(form, "intro", 2000),
      documents: lines("documents"),
      timeline: lines("timeline"),
      payments: lines("payments"),
      items: details.map((d, i) => ({ area: areas[i], details: d, quantity: quantities[i] || "1", price: prices[i] })),
      labels: Object.fromEntries(Object.keys(DEFAULT_LABELS).map((k) => [k, text(form, `labels.${k}`, 200)])),
      company: {
        name: text(form, "companyName", 200),
        registry: text(form, "companyRegistry", 200),
        license: text(form, "companyLicense", 200),
        address: lines("companyAddress"),
      },
      companyDuties: lines("companyDuties"),
      clientDuties: lines("clientDuties"),
      confidentiality: lines("confidentiality"),
      termination: lines("termination"),
      bank: bankLabels.map((label, i) => ({ label, value: bankValues[i], accent: accented.has(String(i)) })),
      signature: { lead: text(form, "signatureLead", 200), lines: lines("signatureLines") },
    });
    if (!offer.date) errors.date = "err.required";
    if (!offer.validUntil) errors.validUntil = "err.required";
    if (!offer.title) errors.title = "err.required";
    if (!offer.recipient) errors.recipient = "err.required";
    if (!offer.items.length) errors.items ??= "err.offerItems";
    if (Object.keys(errors).length) return failed("msg.invalid", errors);

    saveQuotationOffer(id, offer);
    logActivity(user, "quotation.offer", `#${id} ${offer.number || q.clientName}`);
    refreshAdmin();
    return done();
  });
}

/* ---- emailing the quotation -------------------------------------------- */

/** "a@x.sa, b@y.com" as a list, or null when one of them isn't an address. */
const addresses = (value: string) => {
  const list = [...new Set(value.split(/[\s,;،]+/).filter(Boolean))];
  return list.length <= 10 && list.every((a) => EMAIL.test(a) && a.length <= 200) ? list : null;
};

export async function replyQuotationAction(id: number, _state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("quotations.manage");
    const q = getQuotation(id);
    if (!q) return failed("msg.error");
    const to = addresses(text(form, "to", 2000));
    const cc = addresses(text(form, "cc", 2000));
    const subject = text(form, "subject", 200).replace(/[\r\n]+/g, " ");
    const message = text(form, "message", 5000);
    const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

    const errors: Record<string, AdminKey> = {};
    if (!to) errors.to = "err.emailInvalid";
    else if (!to.length) errors.to = "err.required";
    if (!cc) errors.cc = "err.emailInvalid";
    if (!subject) errors.subject = "err.required";
    if (!message) errors.message = "err.required";
    if (!files.length) errors.files = "err.required";
    if (!to || !cc || Object.keys(errors).length) return failed("msg.invalid", errors);

    await sendQuotationReply(q, { to, cc, subject, message, files }, user);
    logActivity(user, "quotation.reply", `#${id} ${q.reference || q.clientName} → ${to.join(", ")}`);
    refreshAdmin();
    return done("msg.quoteSent");
  });
}
