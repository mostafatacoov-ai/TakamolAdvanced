"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/admin/action-state";
import { sanitizeBlocks } from "@/lib/blocks";
import { done, failed, guard, handle, idField, localized, refreshSite, text } from "@/server/action-utils";
import { logActivity } from "@/server/activity";
import { createPage, deletePage, getPage, slugError, updatePage } from "@/server/pages";

export async function createPageAction(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("pages.manage");
    const title = localized(form, "title", 200);
    const slug = text(form, "slug", 80).toLowerCase();
    const errors: Record<string, "err.required" | NonNullable<ReturnType<typeof slugError>>> = {};
    if (!title.ar && !title.en) errors.title_ar = "err.required";
    const slugProblem = slugError(slug);
    if (slugProblem) errors.slug = slugProblem;
    if (Object.keys(errors).length) return failed("msg.invalid", errors);
    const id = createPage(slug, title, user.id);
    logActivity(user, "page.create", `/${slug}`);
    redirect(`/admin/pages/${id}?created=1`);
  });
}

export async function savePageAction(id: number, _state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("pages.manage");
    if (!getPage(id)) return failed("msg.error");
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text(form, "payload", 1_000_000));
    } catch {
      return failed("msg.invalid");
    }
    const loc = (v: unknown, max: number) => {
      const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
      return {
        ar: typeof o.ar === "string" ? o.ar.trim().slice(0, max) : "",
        en: typeof o.en === "string" ? o.en.trim().slice(0, max) : "",
      };
    };
    const slug = typeof data.slug === "string" ? data.slug.trim().toLowerCase() : "";
    const title = loc(data.title, 200);
    const description = loc(data.description, 400);
    const errors: Record<string, NonNullable<ReturnType<typeof slugError>>> = {};
    if (!title.ar && !title.en) errors.title = "err.required";
    const slugProblem = slugError(slug, id);
    if (slugProblem) errors.slug = slugProblem;
    if (Object.keys(errors).length) return failed("msg.invalid", errors);

    updatePage(id, {
      slug, title, description,
      blocks: sanitizeBlocks(data.blocks),
      status: data.status === "published" ? "published" : "draft",
    }, user.id);
    logActivity(user, "page.update", `/${slug}`);
    refreshSite();
    return done();
  });
}

export async function deletePageAction(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("pages.manage");
    const id = idField(form);
    const page = id ? deletePage(id) : null;
    if (page) logActivity(user, "page.delete", `/${page.slug}`);
    refreshSite();
    redirect("/admin/pages");
  });
}
