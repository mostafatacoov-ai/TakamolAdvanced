import "server-only";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import type { ActionState } from "@/lib/admin/action-state";
import type { AdminKey } from "@/lib/admin/i18n";
import type { Permission } from "@/lib/admin/permissions";
import { can, getCurrentUser, type SessionUser } from "./auth";
import { UserError } from "./errors";

/* Helpers shared by the admin server actions. Every action calls guard()
   first: hiding a button is never the only protection. */

export async function guard(permission?: Permission): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new UserError("msg.unauthorized");
  if (permission && !can(user, permission)) throw new UserError("msg.forbidden");
  return user;
}

export const done = (message: AdminKey = "msg.saved", detail?: string): ActionState => ({
  ok: true, message, detail, at: Date.now(),
});

export const failed = (message: AdminKey, errors?: Record<string, AdminKey>): ActionState => ({
  ok: false, message, errors, at: Date.now(),
});

/** Runs an action body, turning expected problems into a form message. */
export async function handle(body: () => Promise<ActionState>): Promise<ActionState> {
  try {
    return await body();
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof UserError) {
      return failed(error.errors ? "msg.invalid" : error.key, error.errors);
    }
    console.error("[admin action]", error);
    return failed("msg.error");
  }
}

/* ---- reading form fields ---------------------------------------------- */

export const text = (form: FormData, name: string, max = 500) => {
  const value = form.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
};

export const localized = (form: FormData, name: string, max = 500) => ({
  ar: text(form, `${name}_ar`, max),
  en: text(form, `${name}_en`, max),
});

export const checked = (form: FormData, name: string) => form.get(name) === "on" || form.get(name) === "1";

export const fileField = (form: FormData, name: string) => {
  const value = form.get(name);
  return value instanceof File && value.size > 0 ? value : null;
};

export const idField = (form: FormData, name = "id") => {
  const n = Number(form.get(name));
  return Number.isInteger(n) && n > 0 ? n : null;
};

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---- cache refresh ----------------------------------------------------- */

/** After a change visitors can see: rebuild every public page on next visit. */
export const refreshSite = () => revalidatePath("/", "layout");

/** After a change only the admin area shows. */
export const refreshAdmin = () => revalidatePath("/admin", "layout");
