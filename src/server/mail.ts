import "server-only";
import nodemailer from "nodemailer";
import { formatMoney, type QuotationRecord } from "@/lib/quotation";
import type { ApplicationRecord } from "./applications";

/* Email notifications to the team when something is submitted on the site.
   They go out through the Zoho Mail API (ZOHO_REFRESH_TOKEN), else Zoho's
   ZeptoMail API (ZOHO_API_KEY), else an SMTP mailbox (see README ›
   Environment variables). When none is configured the submission still
   succeeds and a line is logged. */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://takamoladvanced.sa").replace(/\/$/, "");

/** Who is told about new submissions. */
export const NOTIFY_TO = process.env.NOTIFY_EMAIL || "pm@takamoladvanced.sa";
/** The mailbox the notifications come from (and sign in as, unless SMTP_USER differs). */
export const MAIL_FROM = process.env.MAIL_FROM || process.env.SMTP_USER || "info@takamoladvanced.sa";

/* ---- Zoho Mail API (OAuth) -------------------------------------------
   A "Self Client" in the Zoho API console gives a client id and secret, and
   a one-time code that `npm run zoho:token` turns into a refresh token.
   Access tokens are minted from it as needed and kept for their lifetime. */

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_ACCOUNTS_URL = (process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com").replace(/\/$/, "");
const ZOHO_MAIL_URL = (process.env.ZOHO_MAIL_URL || "https://mail.zoho.com").replace(/\/$/, "");

const zoho = globalThis as typeof globalThis & {
  __zohoToken?: { value: string; expires: number };
  __zohoAccount?: string;
};

async function zohoAccessToken() {
  const cached = zoho.__zohoToken;
  if (cached && cached.expires > Date.now()) return cached.value;
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: ZOHO_CLIENT_ID ?? "",
    client_secret: ZOHO_CLIENT_SECRET ?? "",
    refresh_token: ZOHO_REFRESH_TOKEN ?? "",
  });
  const response = await fetch(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, { method: "POST", body: params });
  const data = (await response.json()) as { access_token?: string; expires_in?: number; error?: string };
  if (!response.ok || !data.access_token) throw new Error(`Zoho token: ${data.error ?? response.status}`);
  // keep it a minute short of its lifetime (an hour by default)
  zoho.__zohoToken = { value: data.access_token, expires: Date.now() + ((data.expires_in ?? 3600) - 60) * 1000 };
  return data.access_token;
}

/** The Zoho Mail account that owns MAIL_FROM (or the first one the token can see). */
async function zohoAccountId(token: string) {
  if (zoho.__zohoAccount) return zoho.__zohoAccount;
  const response = await fetch(`${ZOHO_MAIL_URL}/api/accounts`, { headers: { Authorization: `Zoho-oauthtoken ${token}` } });
  const data = (await response.json()) as {
    data?: { accountId: string; primaryEmailAddress?: string; emailAddress?: { mailId?: string }[] }[];
  };
  if (!response.ok || !data.data?.length) throw new Error(`Zoho accounts: ${response.status}`);
  const from = MAIL_FROM.toLowerCase();
  const account =
    data.data.find((a) => a.primaryEmailAddress?.toLowerCase() === from) ??
    data.data.find((a) => a.emailAddress?.some((e) => e.mailId?.toLowerCase() === from)) ??
    data.data[0];
  zoho.__zohoAccount = account.accountId;
  return account.accountId;
}

async function sendWithZohoMail(subject: string, body: { html: string; text: string }) {
  const token = await zohoAccessToken();
  const account = await zohoAccountId(token);
  const response = await fetch(`${ZOHO_MAIL_URL}/api/accounts/${account}/messages`, {
    method: "POST",
    headers: { Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      fromAddress: MAIL_FROM,
      toAddress: NOTIFY_TO,
      subject,
      content: body.html,
      mailFormat: "html",
    }),
  });
  if (!response.ok) throw new Error(`Zoho Mail ${response.status}: ${(await response.text()).slice(0, 500)}`);
}

/* ---- Zoho ZeptoMail ---------------------------------------------------- */

/** Zoho ZeptoMail: a "Send Mail Token" from the ZeptoMail console. */
const ZOHO_API_KEY = process.env.ZOHO_API_KEY;
const ZOHO_API_URL = process.env.ZOHO_API_URL || "https://api.zeptomail.com/v1.1/email";

async function sendWithZoho(subject: string, body: { html: string; text: string }) {
  const response = await fetch(ZOHO_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Zoho-enczapikey ${ZOHO_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      from: { address: MAIL_FROM, name: "Takamol Advanced" },
      to: NOTIFY_TO.split(",").map((address) => ({ email_address: { address: address.trim() } })),
      subject,
      htmlbody: body.html,
      textbody: body.text,
    }),
  });
  if (!response.ok) throw new Error(`ZeptoMail ${response.status}: ${(await response.text()).slice(0, 500)}`);
}

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
  try {
    if (ZOHO_REFRESH_TOKEN && ZOHO_CLIENT_ID && ZOHO_CLIENT_SECRET) {
      await sendWithZohoMail(subject, body);
      return;
    }
    if (ZOHO_API_KEY) {
      await sendWithZoho(subject, body);
      return;
    }
    const t = transport();
    if (!t) {
      console.warn(`[mail] not configured (ZOHO_REFRESH_TOKEN, ZOHO_API_KEY or SMTP_HOST / SMTP_PASS missing): would have sent "${subject}" to ${NOTIFY_TO}`);
      return;
    }
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
