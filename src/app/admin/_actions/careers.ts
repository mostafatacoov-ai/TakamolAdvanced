"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/admin/action-state";
import { isAllowedImage } from "@/lib/blocks";
import { pick } from "@/lib/site-types";
import { done, failed, guard, handle, idField, localized, refreshAdmin, refreshSite, text } from "@/server/action-utils";
import { logActivity } from "@/server/activity";
import { deleteApplication, getApplication, isApplicationStatus, updateApplication } from "@/server/applications";
import { createJob, deleteJob, getJob, moveJob, setJobStatus, updateJob, type JobInput } from "@/server/jobs";

/* ---- jobs -------------------------------------------------------------- */

export async function saveJobAction(id: number | null, _state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("jobs.manage");
    const image = text(form, "image", 300);
    const input: JobInput = {
      title: localized(form, "title", 200),
      location: localized(form, "location", 120),
      type: localized(form, "type", 80),
      description: localized(form, "description", 3000),
      image: image && isAllowedImage(image) ? image : "",
      status: form.get("status") === "closed" ? "closed" : "open",
    };
    if (!input.title.ar && !input.title.en) return failed("msg.invalid", { title_ar: "err.required" });

    if (id) {
      if (!getJob(id)) return failed("msg.error");
      updateJob(id, input);
      logActivity(user, "job.update", pick(input.title, "en"));
      refreshSite();
      return done();
    }
    createJob(input);
    logActivity(user, "job.create", pick(input.title, "en"));
    refreshSite();
    redirect("/admin/jobs?saved=1");
  });
}

/** Close / reopen / move / delete from the jobs list ("intent" = "close:12"). */
export async function jobListAction(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("jobs.manage");
    const [intent, rawId] = String(form.get("intent") ?? "").split(":");
    const id = Number(rawId);
    const job = Number.isInteger(id) && id > 0 ? getJob(id) : null;
    if (!job) return failed("msg.error");
    const title = pick(job.title, "en");
    switch (intent) {
      case "close":
        setJobStatus(id, "closed");
        logActivity(user, "job.update", title);
        break;
      case "open":
        setJobStatus(id, "open");
        logActivity(user, "job.update", title);
        break;
      case "up":
        moveJob(id, -1);
        break;
      case "down":
        moveJob(id, 1);
        break;
      case "delete":
        deleteJob(id);
        logActivity(user, "job.delete", title);
        refreshSite();
        return done("msg.deleted");
      default:
        return failed("msg.error");
    }
    refreshSite();
    return done();
  });
}

/* ---- applications ------------------------------------------------------ */

export async function updateApplicationAction(id: number, _state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("applications.manage");
    const app = getApplication(id);
    if (!app) return failed("msg.error");
    const status = text(form, "status", 30);
    if (!isApplicationStatus(status)) return failed("msg.invalid");
    updateApplication(id, status, text(form, "notes", 4000));
    logActivity(user, "application.update", `#${id} ${app.name}`);
    refreshAdmin();
    return done();
  });
}

export async function deleteApplicationAction(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("applications.manage");
    const id = idField(form);
    const app = id ? deleteApplication(id) : null;
    if (app) logActivity(user, "application.delete", `#${app.id} ${app.name}`);
    refreshAdmin();
    redirect("/admin/applications");
  });
}
