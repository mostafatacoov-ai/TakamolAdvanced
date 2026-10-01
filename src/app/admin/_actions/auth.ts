"use server";

import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/admin/action-state";
import type { AdminKey } from "@/lib/admin/i18n";
import { done, EMAIL, failed, guard, handle, text } from "@/server/action-utils";
import { logActivity } from "@/server/activity";
import { ADMIN_LANG_COOKIE } from "@/server/admin-lang";
import {
  clearLoginFailures, clientIp, endOtherSessions, endSession, loginBlocked, loginKeys,
  recordLoginFailure, startSession,
} from "@/server/auth";
import { one, run } from "@/server/db";
import { hashPassword, MIN_PASSWORD, verifyPassword } from "@/server/passwords";
import { adminRoleId, countUsers, createUser, emailTaken, findUserByEmail, getUser, setUserPassword } from "@/server/users";

const password = (form: FormData, name: string) => {
  const v = form.get(name);
  return typeof v === "string" ? v.slice(0, 200) : "";
};

let dummyHash: Promise<string> | null = null;

export async function login(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const email = text(form, "email", 200).toLowerCase();
    const secret = password(form, "password");
    const keys = loginKeys(email, await clientIp());
    if (loginBlocked(keys)) return failed("login.locked");

    const account = email ? findUserByEmail(email) : undefined;
    // check a password even for unknown emails, so timing doesn't reveal which exist
    const valid = account
      ? account.active === 1 && (await verifyPassword(secret, account.password_hash))
      : (await verifyPassword(secret, await (dummyHash ??= hashPassword("not-a-real-password"))), false);
    if (!account || !valid) {
      recordLoginFailure(keys);
      return failed("login.failed");
    }
    clearLoginFailures(keys[0]);
    await startSession(account.id);
    logActivity({ id: account.id, name: getUser(account.id)?.name ?? "" }, "login");
    redirect("/admin");
  });
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function setAdminLang(form: FormData) {
  const lang = form.get("lang") === "en" ? "en" : "ar";
  (await cookies()).set(ADMIN_LANG_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/admin", "layout");
}

const sameSecret = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/* First administrator. Only possible while no account exists; in
   production it also needs the ADMIN_SETUP_TOKEN from the server settings. */
export async function setup(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    if (countUsers() > 0) redirect("/admin/login");
    if (process.env.NODE_ENV === "production") {
      const expected = process.env.ADMIN_SETUP_TOKEN ?? "";
      if (!expected) return failed("setup.disabled");
      if (!sameSecret(text(form, "token", 200), expected)) return failed("msg.invalid", { token: "setup.badToken" });
    }
    const name = text(form, "name", 120);
    const email = text(form, "email", 200).toLowerCase();
    const secret = password(form, "password");
    const errors: Record<string, AdminKey> = {};
    if (!name) errors.name = "err.required";
    if (!EMAIL.test(email)) errors.email = "err.emailInvalid";
    if (secret.length < MIN_PASSWORD) errors.password = "err.passwordShort";
    else if (secret !== password(form, "confirm")) errors.confirm = "err.passwordMismatch";
    if (Object.keys(errors).length) return failed("msg.invalid", errors);

    const id = await createUser({ name, email, roleId: adminRoleId(), password: secret, mustChange: false });
    await startSession(id);
    logActivity({ id, name }, "setup");
    redirect("/admin");
  });
}

export async function updateProfile(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard();
    const name = text(form, "name", 120);
    const email = text(form, "email", 200).toLowerCase();
    const errors: Record<string, AdminKey> = {};
    if (!name) errors.name = "err.required";
    if (!EMAIL.test(email)) errors.email = "err.emailInvalid";
    else if (emailTaken(email, user.id)) errors.email = "err.emailTaken";
    if (Object.keys(errors).length) return failed("msg.invalid", errors);
    run("UPDATE users SET name = ?, email = ? WHERE id = ?", name, email, user.id);
    revalidatePath("/admin", "layout");
    return done();
  });
}

export async function changePassword(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard();
    const current = password(form, "current");
    const next = password(form, "password");
    const row = one<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", user.id);
    if (!row || !(await verifyPassword(current, row.password_hash))) {
      return failed("msg.invalid", { current: "err.currentPassword" });
    }
    if (next.length < MIN_PASSWORD) return failed("msg.invalid", { password: "err.passwordShort" });
    if (next !== password(form, "confirm")) return failed("msg.invalid", { confirm: "err.passwordMismatch" });
    await setUserPassword(user.id, next, false);
    await endOtherSessions(user.id);
    logActivity(user, "password.change");
    revalidatePath("/admin", "layout");
    return done("account.passwordChanged");
  });
}
