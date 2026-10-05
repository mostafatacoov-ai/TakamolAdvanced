"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/admin/action-state";
import { done, failed, guard, handle, idField, refreshAdmin, text } from "@/server/action-utils";
import { logActivity } from "@/server/activity";
import { deleteQuotation, getQuotation, isQuotationStatus, updateQuotation } from "@/server/quotations";

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
