"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/admin/action-state";
import type { AdminKey } from "@/lib/admin/i18n";
import { ADMIN_ROLE, isPermission } from "@/lib/admin/permissions";
import { done, EMAIL, failed, guard, handle, idField, localized, refreshAdmin, refreshSite, text } from "@/server/action-utils";
import { logActivity } from "@/server/activity";
import { run } from "@/server/db";
import { generatePassword, MIN_PASSWORD } from "@/server/passwords";
import { getSiteSettings, saveSiteSettings } from "@/server/site";
import { isAllowedImage } from "@/lib/blocks";
import { isSocialNetwork, validSocialUrl, type SocialLink } from "@/lib/social";
import {
  createRole, createUser, deleteRole, deleteUser, emailTaken, getRole, getUser, otherActiveAdmins,
  setUserPassword, updateRole, updateUser,
} from "@/server/users";

/* ---- users ------------------------------------------------------------- */

export async function saveUserAction(id: number | null, _state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const actor = await guard("users.manage");
    const name = text(form, "name", 120);
    const email = text(form, "email", 200).toLowerCase();
    const roleId = idField(form, "roleId");
    const role = roleId ? getRole(roleId) : null;
    const errors: Record<string, AdminKey> = {};
    if (!name) errors.name = "err.required";
    if (!EMAIL.test(email)) errors.email = "err.emailInvalid";
    else if (emailTaken(email, id ?? undefined)) errors.email = "err.emailTaken";
    if (!role) errors.roleId = "err.required";

    if (!id) {
      const typed = text(form, "password", 200);
      if (typed && typed.length < MIN_PASSWORD) errors.password = "err.passwordShort";
      if (Object.keys(errors).length) return failed("msg.invalid", errors);
      const password = typed || generatePassword();
      await createUser({ name, email, roleId: role!.id, password, mustChange: true });
      logActivity(actor, "user.create", email);
      refreshAdmin();
      return done("users.created", password);
    }

    const target = getUser(id);
    if (!target) return failed("msg.error");
    const active = form.get("active") === "on";
    if (Object.keys(errors).length) return failed("msg.invalid", errors);
    if (target.id === actor.id && !active) return failed("err.self");
    const losesAdmin = target.roleKey === ADMIN_ROLE && target.active && (role!.key !== ADMIN_ROLE || !active);
    if (losesAdmin && otherActiveAdmins(target.id) === 0) return failed("err.lastAdmin");
    updateUser(id, { name, email, roleId: role!.id, active });
    logActivity(actor, "user.update", email);
    refreshAdmin();
    return done();
  });
}

export async function resetPasswordAction(id: number, _state: ActionState): Promise<ActionState> {
  return handle(async () => {
    const actor = await guard("users.manage");
    const target = getUser(id);
    if (!target) return failed("msg.error");
    const password = generatePassword();
    await setUserPassword(id, password, true);
    run("DELETE FROM sessions WHERE user_id = ?", id);
    logActivity(actor, "user.reset", target.email);
    return done("users.resetDone", password);
  });
}

export async function deleteUserAction(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const actor = await guard("users.manage");
    const id = idField(form);
    const target = id ? getUser(id) : null;
    if (!target) return failed("msg.error");
    if (target.id === actor.id) return failed("err.self");
    if (target.roleKey === ADMIN_ROLE && target.active && otherActiveAdmins(target.id) === 0) return failed("err.lastAdmin");
    deleteUser(target.id);
    logActivity(actor, "user.delete", target.email);
    refreshAdmin();
    redirect("/admin/users");
  });
}

/* ---- roles ------------------------------------------------------------- */

export async function saveRoleAction(id: number | null, _state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const actor = await guard("roles.manage");
    const name = localized(form, "name", 80);
    const permissions = form.getAll("perm").filter((p): p is string => typeof p === "string").filter(isPermission);
    if (!name.ar && !name.en) return failed("msg.invalid", { name_ar: "err.required" });

    if (id) {
      const role = getRole(id);
      if (!role) return failed("msg.error");
      if (role.locked) return failed("err.roleLocked");
      updateRole(id, name, permissions);
      logActivity(actor, "role.update", name.en || name.ar);
      refreshAdmin();
      return done();
    }
    createRole(name, permissions);
    logActivity(actor, "role.create", name.en || name.ar);
    refreshAdmin();
    redirect("/admin/roles?saved=1");
  });
}

export async function deleteRoleAction(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const actor = await guard("roles.manage");
    const id = idField(form);
    const role = id ? getRole(id) : null;
    if (!role) return failed("msg.error");
    if (role.locked) return failed("err.roleLocked");
    if (role.users > 0) return failed("err.roleInUse");
    deleteRole(role.id);
    logActivity(actor, "role.delete", role.name.en || role.name.ar);
    refreshAdmin();
    redirect("/admin/roles");
  });
}

/* ---- site settings ----------------------------------------------------- */

export async function saveSettingsAction(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const actor = await guard("settings.manage");
    const url = (v: string) => /^https?:\/\/\S+$/i.test(v);
    const settings = {
      footerEmail: text(form, "footerEmail", 200),
      requestsEmail: text(form, "requestsEmail", 200),
      phone: text(form, "phone", 40),
      whatsapp: text(form, "whatsapp", 20),
      mapUrl: text(form, "mapUrl", 500),
      hours: text(form, "hours", 60),
    };
    const errors: Record<string, AdminKey> = {};
    if (!EMAIL.test(settings.footerEmail)) errors.footerEmail = "err.emailInvalid";
    if (!EMAIL.test(settings.requestsEmail)) errors.requestsEmail = "err.emailInvalid";
    if (!settings.phone) errors.phone = "err.required";
    if (!/^\d{8,15}$/.test(settings.whatsapp)) errors.whatsapp = "err.whatsapp";
    if (!url(settings.mapUrl)) errors.mapUrl = "err.urlInvalid";
    const social = readSocial(form, errors);
    if (Object.keys(errors).length) return failed("msg.invalid", errors);
    saveSiteSettings({ ...getSiteSettings(), ...settings, social });
    logActivity(actor, "settings.update");
    refreshSite();
    return done();
  });
}

/** The footer's social links, sent by the settings form as JSON. */
function readSocial(form: FormData, errors: Record<string, AdminKey>): SocialLink[] {
  let raw: unknown;
  try {
    raw = JSON.parse(text(form, "social", 50_000) || "[]");
  } catch {
    raw = [];
  }
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  return (Array.isArray(raw) ? raw.slice(0, 20) : []).flatMap((entry, i): SocialLink[] => {
    const network = entry?.network;
    if (!isSocialNetwork(network)) return [];
    const url = str(entry.url, 500);
    const label = str(entry.label, 60);
    const icon = network === "custom" ? str(entry.icon, 300) : "";
    if (!validSocialUrl(network, url)) errors[`social-url-${i}`] = network === "email" ? "err.emailInvalid" : "err.urlInvalid";
    if (network === "custom" && !label) errors[`social-label-${i}`] = "err.required";
    if (network === "custom" && !isAllowedImage(icon)) errors[`social-icon-${i}`] = "err.imageInvalid";
    const id = str(entry.id, 40);
    return [{ id: /^[\w-]{1,40}$/.test(id) ? id : `s${i}-${Date.now().toString(36)}`, network, url, label, icon }];
  });
}
