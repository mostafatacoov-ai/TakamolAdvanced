import "server-only";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Localized } from "@/lib/site-types";
import { all, getMeta, one, run } from "./db";
import { getJob } from "./jobs";
import { DIRS, within } from "./paths";

export const APPLICATION_STATUSES = ["new", "reviewing", "shortlisted", "interview", "hired", "rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export const isApplicationStatus = (v: string): v is ApplicationStatus =>
  (APPLICATION_STATUSES as readonly string[]).includes(v);

export type ApplicationRecord = {
  id: number;
  jobId: number | null;
  jobTitle: Localized | null;
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  message: string;
  cvName: string;
  cvMime: string;
  cvSize: number;
  status: ApplicationStatus;
  notes: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
};

type Row = {
  id: number; job_id: number | null; job_title: string; name: string; email: string; phone: string;
  linkedin: string; message: string; cv_file: string; cv_name: string; cv_mime: string; cv_size: number;
  status: string; notes: string; locale: string; created_at: string; updated_at: string;
};

function parseTitle(raw: string): Localized | null {
  try {
    const v = JSON.parse(raw) as Partial<Localized>;
    return v.ar || v.en ? { ar: v.ar ?? "", en: v.en ?? "" } : null;
  } catch {
    return null;
  }
}

const toRecord = (r: Row): ApplicationRecord => ({
  id: r.id,
  jobId: r.job_id,
  jobTitle: parseTitle(r.job_title),
  name: r.name,
  email: r.email,
  phone: r.phone,
  linkedin: r.linkedin,
  message: r.message,
  cvName: r.cv_name,
  cvMime: r.cv_mime,
  cvSize: r.cv_size,
  status: isApplicationStatus(r.status) ? r.status : "new",
  notes: r.notes,
  locale: r.locale,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export function listApplications(filter: { status?: string; jobId?: number | "general"; q?: string; page?: number }) {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (filter.status && isApplicationStatus(filter.status)) {
    where.push("status = ?");
    params.push(filter.status);
  }
  if (filter.jobId === "general") where.push("job_id IS NULL AND job_title = '{}'");
  else if (typeof filter.jobId === "number") {
    where.push("job_id = ?");
    params.push(filter.jobId);
  }
  if (filter.q) {
    where.push("(name LIKE ? OR email LIKE ? OR phone LIKE ?)");
    const like = `%${filter.q.replace(/[%_]/g, "")}%`;
    params.push(like, like, like);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const perPage = 25;
  const page = Math.max(1, filter.page ?? 1);
  const total = one<{ n: number }>(`SELECT COUNT(*) AS n FROM applications ${clause}`, ...params)?.n ?? 0;
  const rows = all<Row>(
    `SELECT * FROM applications ${clause} ORDER BY id DESC LIMIT ? OFFSET ?`,
    ...params, perPage, (page - 1) * perPage,
  );
  return { rows: rows.map(toRecord), total, page, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export function getApplication(id: number) {
  const row = one<Row>("SELECT * FROM applications WHERE id = ?", id);
  return row ? toRecord(row) : null;
}

/** Absolute path of the stored CV, if the file still exists. */
export function cvFile(id: number) {
  const row = one<{ cv_file: string; cv_name: string; cv_mime: string }>(
    "SELECT cv_file, cv_name, cv_mime FROM applications WHERE id = ?", id,
  );
  if (!row) return null;
  const file = within(DIRS.cvs, row.cv_file);
  return file && fs.existsSync(file) ? { file, name: row.cv_name, mime: row.cv_mime } : null;
}

export function updateApplication(id: number, status: ApplicationStatus, notes: string) {
  run("UPDATE applications SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?", status, notes, id);
}

export function deleteApplication(id: number) {
  const app = getApplication(id);
  if (!app) return null;
  const cv = cvFile(id);
  if (cv) fs.unlinkSync(cv.file);
  run("DELETE FROM applications WHERE id = ?", id);
  return app;
}

export function countNewApplications() {
  return one<{ n: number }>("SELECT COUNT(*) AS n FROM applications WHERE status = 'new'")?.n ?? 0;
}

export function recentApplications(limit = 5) {
  return all<Row>("SELECT * FROM applications ORDER BY id DESC LIMIT ?", limit).map(toRecord);
}

/* ---- public submission ------------------------------------------------- */

export const CV_MAX_BYTES = 5 * 1024 * 1024;

export type SubmitError =
  | "errorRequired" | "errorEmail" | "errorCv" | "errorConsent" | "errorRate" | "errorGeneric";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Accept PDF and Word files only, recognised by their first bytes rather
   than by the name or the type the browser claims. */
async function detectCv(file: File) {
  const head = Buffer.from(await file.slice(0, 8).arrayBuffer());
  const name = file.name.toLowerCase();
  if (head.subarray(0, 5).toString("latin1") === "%PDF-") return { ext: "pdf", mime: "application/pdf" };
  if (head.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) && name.endsWith(".docx")) {
    return { ext: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
  }
  if (head.equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) && name.endsWith(".doc")) {
    return { ext: "doc", mime: "application/msword" };
  }
  return null;
}

export function hashIp(ip: string) {
  return createHash("sha256").update(`${getMeta("ip_salt") ?? ""}:${ip}`).digest("hex");
}

export async function submitApplication(input: {
  name: string; email: string; phone: string; linkedin: string; message: string;
  jobId: number | null; consent: boolean; cv: File | null; locale: string; ip: string;
}): Promise<{ ok: true } | { ok: false; error: SubmitError }> {
  const name = input.name.trim().slice(0, 120);
  const email = input.email.trim().slice(0, 200);
  const phone = input.phone.trim().slice(0, 40);
  if (name.length < 2 || !phone) return { ok: false, error: "errorRequired" };
  if (!EMAIL.test(email)) return { ok: false, error: "errorEmail" };
  if (!input.consent) return { ok: false, error: "errorConsent" };
  const cv = input.cv;
  if (!cv || typeof cv === "string" || cv.size === 0 || cv.size > CV_MAX_BYTES) return { ok: false, error: "errorCv" };
  const kind = await detectCv(cv);
  if (!kind) return { ok: false, error: "errorCv" };

  const ipHash = hashIp(input.ip);
  const recent = one<{ n: number }>(
    "SELECT COUNT(*) AS n FROM applications WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')", ipHash,
  )?.n ?? 0;
  if (recent >= 5) return { ok: false, error: "errorRate" };

  const job = input.jobId ? getJob(input.jobId) : null;
  const linkedin = /^https?:\/\/\S+$/i.test(input.linkedin.trim()) ? input.linkedin.trim().slice(0, 300) : "";
  const stored = `${randomUUID()}.${kind.ext}`;
  const original = path.basename(cv.name).replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 150) || `cv.${kind.ext}`;

  fs.writeFileSync(path.join(DIRS.cvs, stored), Buffer.from(await cv.arrayBuffer()));
  run(
    `INSERT INTO applications (job_id, job_title, name, email, phone, linkedin, message, cv_file, cv_name, cv_mime,
       cv_size, locale, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    job && job.status === "open" ? job.id : null,
    job && job.status === "open" ? JSON.stringify(job.title) : "{}",
    name, email, phone, linkedin, input.message.trim().slice(0, 3000),
    stored, original, kind.mime, cv.size, input.locale === "en" ? "en" : "ar", ipHash,
  );
  return { ok: true };
}
