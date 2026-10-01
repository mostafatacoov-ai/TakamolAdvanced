import "server-only";
import type { Job, JobStatus, Localized } from "@/lib/site-types";
import { all, one, run } from "./db";

type Row = {
  id: number;
  title_ar: string; title_en: string; location_ar: string; location_en: string;
  type_ar: string; type_en: string; description_ar: string; description_en: string;
  image: string; status: string; sort_order: number; created_at: string; updated_at: string;
  applications?: number;
};

const toJob = (r: Row): Job & { applications: number } => ({
  id: r.id,
  title: { ar: r.title_ar, en: r.title_en },
  location: { ar: r.location_ar, en: r.location_en },
  type: { ar: r.type_ar, en: r.type_en },
  description: { ar: r.description_ar, en: r.description_en },
  image: r.image,
  status: r.status === "closed" ? "closed" : "open",
  sortOrder: r.sort_order,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  applications: r.applications ?? 0,
});

export function listJobs({ openOnly = false } = {}) {
  return all<Row>(
    `SELECT j.*, (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications
     FROM jobs j ${openOnly ? "WHERE j.status = 'open'" : ""} ORDER BY j.sort_order, j.id`,
  ).map(toJob);
}

export function getJob(id: number) {
  const row = one<Row>("SELECT * FROM jobs WHERE id = ?", id);
  return row ? toJob(row) : null;
}

export type JobInput = {
  title: Localized; location: Localized; type: Localized; description: Localized;
  image: string; status: JobStatus;
};

export function createJob(input: JobInput) {
  const next = (one<{ n: number }>("SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM jobs")?.n ?? 0);
  return run(
    `INSERT INTO jobs (title_ar, title_en, location_ar, location_en, type_ar, type_en,
       description_ar, description_en, image, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.title.ar, input.title.en, input.location.ar, input.location.en, input.type.ar, input.type.en,
    input.description.ar, input.description.en, input.image, input.status, next,
  ).id;
}

export function updateJob(id: number, input: JobInput) {
  run(
    `UPDATE jobs SET title_ar = ?, title_en = ?, location_ar = ?, location_en = ?, type_ar = ?, type_en = ?,
       description_ar = ?, description_en = ?, image = ?, status = ?, updated_at = datetime('now') WHERE id = ?`,
    input.title.ar, input.title.en, input.location.ar, input.location.en, input.type.ar, input.type.en,
    input.description.ar, input.description.en, input.image, input.status, id,
  );
}

export function setJobStatus(id: number, status: JobStatus) {
  run("UPDATE jobs SET status = ?, updated_at = datetime('now') WHERE id = ?", status, id);
}

/** Swap a job with its neighbour in the display order. */
export function moveJob(id: number, direction: -1 | 1) {
  const jobs = listJobs();
  const i = jobs.findIndex((j) => j.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= jobs.length) return;
  const order = jobs.map((x) => x.id);
  [order[i], order[j]] = [order[j], order[i]];
  order.forEach((jobId, index) => run("UPDATE jobs SET sort_order = ? WHERE id = ?", index, jobId));
}

export function deleteJob(id: number) {
  const job = getJob(id);
  if (job) run("DELETE FROM jobs WHERE id = ?", id);
  return job;
}

export function countOpenJobs() {
  return one<{ n: number }>("SELECT COUNT(*) AS n FROM jobs WHERE status = 'open'")?.n ?? 0;
}
