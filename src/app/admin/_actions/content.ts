"use server";

import type { ActionState } from "@/lib/admin/action-state";
import { isAllowedImage } from "@/lib/blocks";
import { isSafeHref } from "@/lib/links";
import type { Locale, NavItem, Partner } from "@/lib/site-types";
import { done, failed, fileField, guard, handle, idField, refreshAdmin, refreshSite, text } from "@/server/action-utils";
import { logActivity } from "@/server/activity";
import { saveSection } from "@/server/content";
import { UserError } from "@/server/errors";
import { deleteMedia, replaceSiteImage, restoreSiteImage, uploadMedia } from "@/server/images";
import { saveNavigation, savePartners } from "@/server/site";

/* ---- texts ------------------------------------------------------------- */

/** Fields arrive as "ar|Hero.title" / "en|Hero.title". */
export async function saveTexts(ns: string, _state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("content.edit");
    const values: { locale: Locale; path: string; value: string }[] = [];
    for (const [name, value] of form.entries()) {
      const [locale, path] = name.split("|");
      if ((locale === "ar" || locale === "en") && path && typeof value === "string") {
        values.push({ locale, path, value });
      }
    }
    const { errors, changed } = saveSection(ns, values, user.id);
    if (Object.keys(errors).length) return failed("msg.invalid", errors);
    if (changed) {
      logActivity(user, "texts.update", ns);
      refreshSite();
    }
    return done();
  });
}

/* ---- images ------------------------------------------------------------ */

export async function replaceImage(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("media.manage");
    const rel = text(form, "rel", 300);
    await replaceSiteImage(rel, fileField(form, "file"), user.id);
    logActivity(user, "asset.replace", rel);
    refreshSite();
    return done("msg.uploaded");
  });
}

export async function restoreImage(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("media.manage");
    const rel = text(form, "rel", 300);
    restoreSiteImage(rel);
    logActivity(user, "asset.restore", rel);
    refreshSite();
    return done("msg.restored");
  });
}

export async function uploadImages(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("media.manage");
    const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 20);
    if (!files.length) throw new UserError("err.imageInvalid");
    for (const file of files) {
      const item = await uploadMedia(file, user.id);
      logActivity(user, "media.upload", item.name);
    }
    refreshAdmin();
    return done("msg.uploaded");
  });
}

/** Called directly by the image picker; returns the new image. */
export async function uploadImageFromPicker(form: FormData) {
  try {
    const user = await guard("media.manage");
    const item = await uploadMedia(fileField(form, "file"), user.id);
    logActivity(user, "media.upload", item.name);
    refreshAdmin();
    return { ok: true as const, item };
  } catch (error) {
    return { ok: false as const, message: error instanceof UserError ? error.key : ("msg.error" as const) };
  }
}

export async function deleteImage(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("media.manage");
    const id = idField(form);
    const name = id ? deleteMedia(id) : null;
    if (name) logActivity(user, "media.delete", name);
    refreshAdmin();
    return done("msg.deleted");
  });
}

/* ---- menu tabs ---------------------------------------------------------- */

const parse = (form: FormData) => {
  try {
    return JSON.parse(text(form, "payload", 200_000));
  } catch {
    throw new UserError("msg.invalid");
  }
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function saveMenu(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("navigation.manage");
    const raw = parse(form);
    if (!Array.isArray(raw) || !raw.length) return failed("menu.empty");
    const items: NavItem[] = [];
    for (const entry of raw.slice(0, 14)) {
      const label = { ar: str(entry?.label?.ar, 60), en: str(entry?.label?.en, 60) };
      const external = entry?.external === true;
      const href = str(entry?.href, 300);
      const validHref = external ? /^https?:\/\/\S+$/i.test(href) : isSafeHref(href) && href.startsWith("/");
      if (!label.ar && !label.en) return failed("msg.invalid", { [`label-${items.length}`]: "err.required" });
      if (!validHref) return failed("msg.invalid", { [`href-${items.length}`]: "err.urlInvalid" });
      items.push({
        id: /^[\w-]{1,40}$/.test(str(entry?.id, 40)) ? str(entry?.id, 40) : Math.random().toString(36).slice(2, 10),
        label, href, external, visible: entry?.visible !== false,
      });
    }
    saveNavigation(items);
    logActivity(user, "menu.update");
    refreshSite();
    return done();
  });
}

/* ---- partners ---------------------------------------------------------- */

export async function savePartnersAction(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("content.edit");
    const raw = parse(form);
    if (!Array.isArray(raw)) return failed("msg.invalid");
    const items: Partner[] = [];
    for (const entry of raw.slice(0, 80)) {
      const logo = str(entry?.logo, 300);
      const url = str(entry?.url, 300);
      if (!isAllowedImage(logo)) return failed("msg.invalid", { [`logo-${items.length}`]: "err.imageInvalid" });
      if (url && !/^https?:\/\/\S+$/i.test(url)) return failed("msg.invalid", { [`url-${items.length}`]: "err.urlInvalid" });
      items.push({
        id: /^[\w-]{1,40}$/.test(str(entry?.id, 40)) ? str(entry?.id, 40) : Math.random().toString(36).slice(2, 10),
        name: str(entry?.name, 120), logo, url,
      });
    }
    savePartners(items);
    logActivity(user, "partners.update");
    refreshSite();
    return done();
  });
}
