import "server-only";
import nodemailer from "nodemailer";
import { formatMoney, type QuotationRecord } from "@/lib/quotation";
import type { ApplicationRecord } from "./applications";

/* Email notifications to the team when something is submitted on the site.
   Sending needs an SMTP mailbox (see README › Environment variables); when
   none is configured the submission still succeeds and a line is logged. */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://takamoladvanced.sa").replace(/\/$/, "");

/** Who is told about new submissions. */
export const NOTIFY_TO = process.env.NOTIFY_EMAIL || "pm@takamoladvanced.sa";
/** The mailbox the notifications come from (and sign in as, unless SMTP_USER differs). */
export const MAIL_FROM = process.env.MAIL_FROM || process.env.SMTP_USER || "info@takamoladvanced.sa";

function transport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || MAIL_FROM;
  const pass = process.env.SMTP_PASS;
  if (!host || !pass) return null;
  const port = Number(process.env.SMTP_PORT) || 465;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

const escape = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

type Row = [label: string, value: string];

/** A simple right-to-left table email with a button to the admin page. */
function render(title: string, rows: Row[], links: { label: string; href: string }[]) {
  const table = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 10px;color:#5c7a8c;white-space:nowrap;vertical-align:top">${escape(k)}</td>` +
        `<td style="padding:6px 10px;color:#0b2a3f;white-space:pre-line">${escape(v)}</td></tr>`,
    )
    .join("");
  const buttons = links
    .map(
      (l) =>
        `<a href="${l.href}" style="display:inline-block;margin:4px 6px 4px 0;padding:10px 18px;background:#00b4ac;color:#00304d;` +
        `font-weight:bold;text-decoration:none;border-radius:10px">${escape(l.label)}</a>`,
    )
    .join("");
  const html =
    `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#eef5f8;padding:24px">` +
    `<div style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden">` +
    `<div style="background:#00304d;color:#fff;padding:18px 22px;font-size:18px;font-weight:bold">${escape(title)}</div>` +
    `<table style="border-collapse:collapse;width:100%;font-size:14px;padding:8px">${table}</table>` +
    `<div style="padding:14px 22px 22px">${buttons}</div>` +
    `<div style="padding:0 22px 18px;font-size:12px;color:#5c7a8c">تكامل المتقدمة · Takamol Advanced</div>` +
    `</div></div>`;
  const text = `${title}\n\n${rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${links
    .map((l) => `${l.label}: ${l.href}`)
    .join("\n")}`;
  return { html, text };
}

async function send(subject: string, body: { html: string; text: string }) {
  const t = transport();
  if (!t) {
    console.warn(`[mail] not configured (SMTP_HOST / SMTP_PASS missing): would have sent "${subject}" to ${NOTIFY_TO}`);
    return;
  }
  try {
    await t.sendMail({ from: `"Takamol Advanced" <${MAIL_FROM}>`, to: NOTIFY_TO, subject, ...body });
  } catch (error) {
    console.error("[mail] failed to send", subject, error);
  }
}

/** A new job application from the Join page. */
export function notifyNewApplication(app: ApplicationRecord) {
  const position = app.jobTitle ? app.jobTitle.ar || app.jobTitle.en : "طلب عام";
  const subject = `طلب توظيف جديد: ${app.name} – ${position}`;
  const body = render(
    "طلب توظيف جديد عبر الموقع",
    [
      ["المتقدم", app.name],
      ["الوظيفة", position],
      ["البريد الإلكتروني", app.email],
      ["الجوال", app.phone],
      ["لينكدإن", app.linkedin],
      ["السيرة الذاتية", app.cvName],
      ["الرسالة", app.message],
    ],
    [{ label: "فتح الطلب في لوحة التحكم", href: `${SITE_URL}/admin/applications/${app.id}` }],
  );
  return send(subject, body);
}

/** A new quotation brief from the sales form. */
export function notifyNewQuotation(q: QuotationRecord, labels: (key: string) => string) {
  const service = q.services[0] ? (q.services[0] === "other" ? `أخرى: ${q.serviceOther}` : labels(`services.${q.services[0]}`)) : "";
  const price =
    q.amount === null ? "" : q.amountMax === null
      ? `${formatMoney(q.amount, "ar")} ريال`
      : `${formatMoney(q.amount, "ar")} – ${formatMoney(q.amountMax, "ar")} ريال`;
  const subject = `نموذج عرض سعر جديد: ${q.clientName}${q.reference ? ` (${q.reference})` : ""}`;
  const body = render(
    "نموذج عرض سعر جديد من فريق المبيعات",
    [
      ["مسؤول المبيعات", q.salesPerson],
      ["رقم العرض", q.reference],
      ["العميل", q.clientName],
      ["نوع العميل", q.clientType ? labels(`clientTypes.${q.clientType}`) : ""],
      ["الجوال", q.clientPhone],
      ["نوع الخدمة", service],
      ["المشروع", q.projectName],
      ["الموقع", q.projectLocation],
      ["القيمة قبل الضريبة", price],
      ["المرفقات", q.attachments.map((f) => f.name).join("، ")],
    ],
    [
      { label: "فتح النموذج في لوحة التحكم", href: `${SITE_URL}/admin/quotations/${q.id}` },
      { label: "النسخة القابلة للطباعة (PDF)", href: `${SITE_URL}/quotation-request/${q.token}` },
    ],
  );
  return send(subject, body);
}
