"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/admin/action-state";
import { emptyContent, isReportStatus, PERIOD } from "@/lib/kpi";
import { done, failed, guard, handle, idField, refreshAdmin, text } from "@/server/action-utils";
import { logActivity } from "@/server/activity";
import {
  createDepartment, createEmployee, createReport, deleteDepartment, deleteEmployee, deleteReport, getDepartment, getEmployee,
  getReport, moveDepartment, moveEmployee, reportExists, saveReport, updateDepartment, updateEmployee,
} from "@/server/kpi";

/* ---- departments ------------------------------------------------------- */

/** Add / rename / reorder / delete from the team page ("intent" = "update:12"). */
export async function departmentAction(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("kpi.manage");
    const [intent, rawId] = String(form.get("intent") ?? "").split(":");
    const name = text(form, "name", 150);
    const nameEn = text(form, "name_en", 150);
    if (intent === "create") {
      if (!name) return failed("msg.invalid", { name: "err.required" });
      createDepartment(name, nameEn);
      logActivity(user, "kpi.department", name);
      refreshAdmin();
      return done("msg.created");
    }
    const id = Number(rawId);
    const department = Number.isInteger(id) && id > 0 ? getDepartment(id) : null;
    if (!department) return failed("msg.error");
    switch (intent) {
      case "update":
        if (!name) return failed("msg.invalid", { [`name_${id}`]: "err.required" });
        updateDepartment(id, name, nameEn);
        logActivity(user, "kpi.department", name);
        break;
      case "up":
        moveDepartment(id, -1);
        break;
      case "down":
        moveDepartment(id, 1);
        break;
      case "delete":
        deleteDepartment(id);
        logActivity(user, "kpi.departmentDelete", department.name);
        refreshAdmin();
        return done("msg.deleted");
      default:
        return failed("msg.error");
    }
    refreshAdmin();
    return done();
  });
}

/* ---- employees --------------------------------------------------------- */

export async function employeeAction(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("kpi.manage");
    const [intent, rawId] = String(form.get("intent") ?? "").split(":");
    const input = {
      departmentId: idField(form, "department") ?? 0,
      name: text(form, "name", 120),
      title: text(form, "title", 160),
      // the row posts a hidden "0" plus the checkbox's "1", so any "1" means checked
      active: form.has("active") ? form.getAll("active").some((v) => v === "1" || v === "on") : true,
    };
    if (intent === "create") {
      const errors: Record<string, "err.required"> = {};
      if (!input.name) errors.name = "err.required";
      if (!input.departmentId || !getDepartment(input.departmentId)) errors.department = "err.required";
      if (Object.keys(errors).length) return failed("msg.invalid", errors);
      createEmployee(input);
      logActivity(user, "kpi.employee", input.name);
      refreshAdmin();
      return done("msg.created");
    }
    const id = Number(rawId);
    const employee = Number.isInteger(id) && id > 0 ? getEmployee(id) : null;
    if (!employee) return failed("msg.error");
    switch (intent) {
      case "update":
        if (!input.name) return failed("msg.invalid", { [`name_${id}`]: "err.required" });
        if (!input.departmentId || !getDepartment(input.departmentId)) return failed("msg.error");
        updateEmployee(id, input);
        logActivity(user, "kpi.employee", input.name);
        break;
      case "up":
        moveEmployee(id, -1);
        break;
      case "down":
        moveEmployee(id, 1);
        break;
      case "delete":
        deleteEmployee(id);
        logActivity(user, "kpi.employeeDelete", employee.name);
        refreshAdmin();
        return done("msg.deleted");
      default:
        return failed("msg.error");
    }
    refreshAdmin();
    return done();
  });
}

/* ---- reports ----------------------------------------------------------- */

export async function createReportAction(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("kpi.manage");
    const departmentId = idField(form, "department");
    const period = text(form, "period", 7);
    const department = departmentId ? getDepartment(departmentId) : null;
    const errors: Record<string, "err.required" | "err.periodTaken"> = {};
    if (!department) errors.department = "err.required";
    if (!PERIOD.test(period)) errors.period = "err.required";
    if (department && PERIOD.test(period) && reportExists(department.id, period)) errors.period = "err.periodTaken";
    if (Object.keys(errors).length) return failed("msg.invalid", errors);

    const title = text(form, "title", 300) || `تقرير الأداء والإنجاز الشهري — ${department!.name}`;
    const content = emptyContent();
    content.meta.preparedBy = text(form, "prepared_by", 200);
    const id = createReport({ departmentId: department!.id, period, title, content });
    logActivity(user, "kpi.reportCreate", `${department!.name} ${period}`);
    refreshAdmin();
    redirect(`/admin/kpi/reports/${id}?created=1`);
  });
}

export async function saveReportAction(id: number, _state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("kpi.manage");
    const report = getReport(id);
    if (!report) return failed("msg.error");
    let payload: { title?: unknown; status?: unknown; content?: unknown; evaluations?: unknown };
    try {
      payload = JSON.parse(text(form, "payload", 2_000_000));
    } catch {
      return failed("msg.error");
    }
    const title = typeof payload.title === "string" ? payload.title.trim().slice(0, 300) : "";
    if (!title) return failed("msg.invalid", { title: "err.required" });
    const status = typeof payload.status === "string" && isReportStatus(payload.status) ? payload.status : report.status;
    saveReport(id, { title, status, content: payload.content, evaluations: payload.evaluations }, user.id);
    logActivity(user, "kpi.reportUpdate", `${report.department} ${report.period}`);
    refreshAdmin();
    return done();
  });
}

export async function deleteReportAction(_state: ActionState, form: FormData): Promise<ActionState> {
  return handle(async () => {
    const user = await guard("kpi.manage");
    const id = idField(form);
    const report = id ? getReport(id) : null;
    if (report) {
      deleteReport(report.id);
      logActivity(user, "kpi.reportDelete", `${report.department} ${report.period}`);
    }
    refreshAdmin();
    redirect("/admin/kpi");
  });
}
