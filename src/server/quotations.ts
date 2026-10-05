import "server-only";
import { randomBytes } from "node:crypto";
import {
  CLIENT_TYPES, computeTotals, DOCUMENTS, FORMATS, isQuotationStatus, QUOTATION_STATUSES, round2, SERVICES,
  type ClientType, type DocumentKey, type FormatKey, type QuotationRecord, type QuotationStatus, type ServiceKey,
} from "@/lib/quotation";
import { hashIp } from "./applications";
import { all, one, run } from "./db";

export { QUOTATION_STATUSES, isQuotationStatus, type QuotationStatus };

type Row = {
  id: number; token: string; reference: string; sales_person: string; request_date: string; department: string;
  client_name: string; client_type: string; client_contact: string; client_phone: string; client_email: string;
  client_address: string; services: string; service_other: string; project_name: string; project_location: string;
  land_area: string; boundaries: string; study_goal: string; documents: string; client_requirements: string;
  amount: number | null; vat: number | null; total: number | null; duration_days: number | null; validity: string;
  payments: string; formats: string; meeting: number | null; notes: string; status: string; admin_notes: string;
  locale: string; created_at: string; updated_at: string;
};

function parseList<T extends string>(raw: string, allowed: readonly T[]): T[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is T => typeof x === "string" && (allowed as readonly string[]).includes(x)) : [];
  } catch {
    return [];
  }
}

function parsePayments(raw: string): [number, number, number] | null {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) && v.length === 3 && v.every((n) => Number.isFinite(n)) ? [v[0], v[1], v[2]] : null;
  } catch {
    return null;
  }
}

const toRecord = (r: Row): QuotationRecord => ({
  id: r.id,
  token: r.token,
  reference: r.reference,
  salesPerson: r.sales_person,
  requestDate: r.request_date,
  department: r.department,
  clientName: r.client_name,
  clientType: (CLIENT_TYPES as readonly string[]).includes(r.client_type) ? (r.client_type as ClientType) : "",
  clientContact: r.client_contact,
  clientPhone: r.client_phone,
  clientEmail: r.client_email,
  clientAddress: r.client_address,
  services: parseList(r.services, SERVICES),
  serviceOther: r.service_other,
  projectName: r.project_name,
  projectLocation: r.project_location,
  landArea: r.land_area,
  boundaries: r.boundaries,
  studyGoal: r.study_goal,
  documents: parseList(r.documents, DOCUMENTS),
  clientRequirements: r.client_requirements,
  amount: r.amount,
  vat: r.vat,
  total: r.total,
  durationDays: r.duration_days,
  validity: r.validity,
  payments: parsePayments(r.payments),
  formats: parseList(r.formats, FORMATS),
  meeting: r.meeting === null ? null : r.meeting === 1,
  notes: r.notes,
  status: isQuotationStatus(r.status) ? r.status : "new",
  adminNotes: r.admin_notes,
  locale: r.locale,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

/* ---- admin ------------------------------------------------------------- */

export function listQuotations(filter: { status?: string; q?: string; page?: number }) {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (filter.status && isQuotationStatus(filter.status)) {
    where.push("status = ?");
    params.push(filter.status);
  }
  if (filter.q) {
    where.push("(client_name LIKE ? OR sales_person LIKE ? OR reference LIKE ? OR client_phone LIKE ? OR project_name LIKE ?)");
    const like = `%${filter.q.replace(/[%_]/g, "")}%`;
    params.push(like, like, like, like, like);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const perPage = 25;
  const page = Math.max(1, filter.page ?? 1);
  const total = one<{ n: number }>(`SELECT COUNT(*) AS n FROM quotations ${clause}`, ...params)?.n ?? 0;
  const rows = all<Row>(
    `SELECT * FROM quotations ${clause} ORDER BY id DESC LIMIT ? OFFSET ?`,
    ...params, perPage, (page - 1) * perPage,
  );
  return { rows: rows.map(toRecord), total, page, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export function getQuotation(id: number) {
  const row = one<Row>("SELECT * FROM quotations WHERE id = ?", id);
  return row ? toRecord(row) : null;
}

/** The brief behind its unguessable link (shown to whoever submitted it). */
export function getQuotationByToken(token: string) {
  if (!/^[a-f0-9]{48}$/.test(token)) return null;
  const row = one<Row>("SELECT * FROM quotations WHERE token = ?", token);
  return row ? toRecord(row) : null;
}

export function updateQuotation(id: number, status: QuotationStatus, adminNotes: string) {
  run("UPDATE quotations SET status = ?, admin_notes = ?, updated_at = datetime('now') WHERE id = ?", status, adminNotes, id);
}

export function deleteQuotation(id: number) {
  const q = getQuotation(id);
  if (!q) return null;
  run("DELETE FROM quotations WHERE id = ?", id);
  return q;
}

export function countNewQuotations() {
  return one<{ n: number }>("SELECT COUNT(*) AS n FROM quotations WHERE status = 'new'")?.n ?? 0;
}

export function recentQuotations(limit = 5) {
  return all<Row>("SELECT * FROM quotations ORDER BY id DESC LIMIT ?", limit).map(toRecord);
}

/* ---- public submission ------------------------------------------------- */

export type QuotationError =
  | "errorRequired" | "errorClient" | "errorEmail" | "errorService" | "errorAmount" | "errorPayments"
  | "errorRate" | "errorGeneric";

export type QuotationInput = {
  salesPerson: string; requestDate: string; reference: string; department: string;
  clientName: string; clientType: string; clientContact: string; clientPhone: string; clientEmail: string; clientAddress: string;
  services: string[]; serviceOther: string;
  projectName: string; projectLocation: string; landArea: string; boundaries: string; studyGoal: string;
  documents: string[]; clientRequirements: string;
  amount: string; durationDays: string; validity: string; payments: string[];
  formats: string[]; meeting: string; notes: string;
  locale: string; ip: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const clean = (v: string, max: number) => v.trim().slice(0, max);
const keep = <T extends string>(values: string[], allowed: readonly T[]) =>
  allowed.filter((k) => values.includes(k));

/** A plain decimal typed by a person ("12,500.00" → 12500). */
function parseAmount(raw: string): number | null | undefined {
  const s = raw.trim().replace(/[,\s]/g, "").replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 && n < 1e12 ? round2(n) : undefined;
}

export function submitQuotation(input: QuotationInput):
  | { ok: true; token: string; id: number }
  | { ok: false; error: QuotationError; fields?: string[] } {
  const salesPerson = clean(input.salesPerson, 120);
  const clientName = clean(input.clientName, 200);
  const clientPhone = clean(input.clientPhone, 40);
  const clientEmail = clean(input.clientEmail, 200);
  const requestDate = DAY.test(input.requestDate.trim()) ? input.requestDate.trim() : "";

  const missing: string[] = [];
  if (salesPerson.length < 2) missing.push("salesPerson");
  if (!requestDate) missing.push("requestDate");
  if (missing.length) return { ok: false, error: "errorRequired", fields: missing };

  const clientMissing: string[] = [];
  if (clientName.length < 2) clientMissing.push("clientName");
  if (!clientPhone) clientMissing.push("clientPhone");
  if (!(CLIENT_TYPES as readonly string[]).includes(input.clientType)) clientMissing.push("clientType");
  if (clientMissing.length) return { ok: false, error: "errorClient", fields: clientMissing };
  if (clientEmail && !EMAIL.test(clientEmail)) return { ok: false, error: "errorEmail", fields: ["clientEmail"] };

  const services: ServiceKey[] = keep(input.services, SERVICES);
  const serviceOther = clean(input.serviceOther, 300);
  if (services.length === 0 || (services.includes("other") && services.length === 1 && !serviceOther)) {
    return { ok: false, error: "errorService", fields: ["services"] };
  }

  const amount = parseAmount(input.amount);
  if (amount === undefined) return { ok: false, error: "errorAmount", fields: ["amount"] };
  const totals = amount === null ? null : computeTotals(amount);

  const durationRaw = clean(input.durationDays, 10).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const durationDays = durationRaw ? Number(durationRaw) : null;
  if (durationDays !== null && !(Number.isInteger(durationDays) && durationDays >= 0 && durationDays < 10000)) {
    return { ok: false, error: "errorAmount", fields: ["durationDays"] };
  }

  let payments: [number, number, number] | null = null;
  const paymentValues = input.payments.slice(0, 3).map((p) => clean(p, 5)).map((p) => (p === "" ? null : Number(p)));
  if (paymentValues.some((p) => p !== null)) {
    const nums = paymentValues.map((p) => p ?? 0);
    const valid = nums.every((n) => Number.isInteger(n) && n >= 0 && n <= 100) && nums.reduce((a, b) => a + b, 0) === 100;
    if (!valid || nums.length !== 3) return { ok: false, error: "errorPayments", fields: ["payments"] };
    payments = [nums[0], nums[1], nums[2]];
  }

  const ipHash = hashIp(input.ip);
  const recent = one<{ n: number }>(
    "SELECT COUNT(*) AS n FROM quotations WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')", ipHash,
  )?.n ?? 0;
  if (recent >= 10) return { ok: false, error: "errorRate" };

  const documents: DocumentKey[] = keep(input.documents, DOCUMENTS);
  const formats: FormatKey[] = keep(input.formats, FORMATS);
  const meeting = input.meeting === "yes" ? 1 : input.meeting === "no" ? 0 : null;
  const token = randomBytes(24).toString("hex");

  const result = run(
    `INSERT INTO quotations (
       token, reference, sales_person, request_date, department,
       client_name, client_type, client_contact, client_phone, client_email, client_address,
       services, service_other, project_name, project_location, land_area, boundaries, study_goal,
       documents, client_requirements, amount, vat, total, duration_days, validity, payments,
       formats, meeting, notes, locale, ip_hash
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    token, clean(input.reference, 40), salesPerson, requestDate, clean(input.department, 150),
    clientName, input.clientType, clean(input.clientContact, 150), clientPhone, clientEmail, clean(input.clientAddress, 300),
    JSON.stringify(services), serviceOther, clean(input.projectName, 300), clean(input.projectLocation, 300),
    clean(input.landArea, 40), clean(input.boundaries, 1500), clean(input.studyGoal, 2000),
    JSON.stringify(documents), clean(input.clientRequirements, 3000),
    amount, totals?.vat ?? null, totals?.total ?? null, durationDays, clean(input.validity, 120),
    payments ? JSON.stringify(payments) : "",
    JSON.stringify(formats), meeting, clean(input.notes, 3000), input.locale === "en" ? "en" : "ar", ipHash,
  );
  return { ok: true, token, id: result.id };
}
