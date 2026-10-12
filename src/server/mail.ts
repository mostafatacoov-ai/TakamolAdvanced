import "server-only";
import nodemailer from "nodemailer";
import { formatMoney, type QuotationRecord } from "@/lib/quotation";
import type { ApplicationRecord } from "./applications";

/* Email notifications to the team when something is submitted on the site,
   and the quotations the admin sends to clients. They go out through the
   Zoho Mail API (ZOHO_REFRESH_TOKEN), else Zoho's ZeptoMail API
   (ZOHO_API_KEY), else an SMTP mailbox (see README › Environment variables).
   When none is configured a submission still succeeds and a line is logged. */

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

export type MailAttachment = { name: string; mime: string; content: Buffer };

type Message = {
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
  text: string;
  attachments?: MailAttachment[];
};

type ZohoUpload = { storeName?: string; attachmentPath?: string; attachmentName?: string };

async function sendWithZohoMail(m: Message) {
  const token = await zohoAccessToken();
  const account = await zohoAccountId(token);
  const api = `${ZOHO_MAIL_URL}/api/accounts/${account}/messages`;
  const auth = `Zoho-oauthtoken ${token}`;

  // attachments are uploaded to Zoho's file store first (all in one multipart
  // request), then referenced by the message
  let attachments: ZohoUpload[] = [];
  if (m.attachments?.length) {
    const form = new FormData();
    for (const a of m.attachments) form.append("attach", new Blob([new Uint8Array(a.content)], { type: a.mime }), a.name);
    const response = await fetch(`${api}/attachments?uploadType=multipart`, {
      method: "POST",
      headers: { Authorization: auth, Accept: "application/json" },
      body: form,
    });
    const text = await response.text();
    let data: { data?: ZohoUpload | ZohoUpload[] } = {};
    try {
      data = JSON.parse(text);
    } catch {}
    const uploaded = Array.isArray(data.data) ? data.data : data.data ? [data.data] : [];
    if (!response.ok || uploaded.length !== m.attachments.length || uploaded.some((u) => !u.storeName)) {
      throw new Error(`Zoho Mail attachment upload ${response.status}: ${text.slice(0, 500)}`);
    }
    attachments = uploaded.map((u) => ({ storeName: u.storeName, attachmentPath: u.attachmentPath, attachmentName: u.attachmentName }));
  }

  const response = await fetch(api, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      fromAddress: MAIL_FROM,
      toAddress: m.to.join(","),
      ...(m.cc?.length ? { ccAddress: m.cc.join(",") } : {}),
      subject: m.subject,
      content: m.html,
      mailFormat: "html",
      ...(attachments.length ? { attachments } : {}),
    }),
  });
  if (!response.ok) throw new Error(`Zoho Mail ${response.status}: ${(await response.text()).slice(0, 500)}`);
}

/* ---- Zoho ZeptoMail ---------------------------------------------------- */

/** Zoho ZeptoMail: a "Send Mail Token" from the ZeptoMail console. */
const ZOHO_API_KEY = process.env.ZOHO_API_KEY;
const ZOHO_API_URL = process.env.ZOHO_API_URL || "https://api.zeptomail.com/v1.1/email";

async function sendWithZoho(m: Message) {
  const recipients = (list: string[]) => list.map((address) => ({ email_address: { address } }));
  const response = await fetch(ZOHO_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Zoho-enczapikey ${ZOHO_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      from: { address: MAIL_FROM, name: "Takamol Advanced" },
      to: recipients(m.to),
      ...(m.cc?.length ? { cc: recipients(m.cc) } : {}),
      subject: m.subject,
      htmlbody: m.html,
      textbody: m.text,
      ...(m.attachments?.length
        ? { attachments: m.attachments.map((a) => ({ name: a.name, mime_type: a.mime, content: a.content.toString("base64") })) }
        : {}),
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

/** A letter in the admin's own words, for a client: no tables, no admin links. */
function letter(message: string) {
  const dir = /\p{Script=Arabic}/u.test(message) ? "rtl" : "ltr";
  const html =
    `<div dir="${dir}" style="font-family:Tahoma,Arial,sans-serif;background:#eef5f8;padding:24px">` +
    `<div style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden">` +
    `<div style="background:#00304d;color:#fff;padding:18px 22px;font-size:18px;font-weight:bold">تكامل المتقدمة · Takamol Advanced</div>` +
    `<div style="padding:22px;font-size:15px;line-height:1.8;color:#0b2a3f">${escape(message).replace(/\n/g, "<br>")}</div>` +
    `<div style="padding:0 22px 18px;font-size:12px;color:#5c7a8c">` +
    `<a href="${SITE_URL}" style="color:#00b4ac;text-decoration:none">${escape(SITE_URL.replace(/^https?:\/\//, ""))}</a></div>` +
    `</div></div>`;
  return { html, text: message };
}

export type MailService = "zoho-mail" | "zeptomail" | "smtp";

/** The service email goes out through, in order of preference; null when none is set up. */
export function mailService(): MailService | null {
  if (ZOHO_REFRESH_TOKEN && ZOHO_CLIENT_ID && ZOHO_CLIENT_SECRET) return "zoho-mail";
  if (ZOHO_API_KEY) return "zeptomail";
  return process.env.SMTP_HOST && process.env.SMTP_PASS ? "smtp" : null;
}

/** Sends through the first service configured: false when there is none, throws when sending fails. */
async function deliver(m: Message): Promise<boolean> {
  const service = mailService();
  if (service === "zoho-mail") await sendWithZohoMail(m);
  else if (service === "zeptomail") await sendWithZoho(m);
  else {
    const t = transport();
    if (!t) return false;
    await t.sendMail({
      from: `"Takamol Advanced" <${MAIL_FROM}>`,
      to: m.to.join(", "),
      cc: m.cc?.length ? m.cc.join(", ") : undefined,
      subject: m.subject,
      html: m.html,
      text: m.text,
      attachments: m.attachments?.map((a) => ({ filename: a.name, content: a.content, contentType: a.mime })),
    });
  }
  return true;
}

/** A notification to the team: a failure is logged, never shown to whoever submitted the form. */
async function send(subject: string, body: { html: string; text: string }) {
  try {
    const to = NOTIFY_TO.split(",").map((address) => address.trim()).filter(Boolean);
    if (!(await deliver({ to, subject, ...body }))) {
      console.warn(`[mail] not configured (ZOHO_REFRESH_TOKEN, ZOHO_API_KEY or SMTP_HOST / SMTP_PASS missing): would have sent "${subject}" to ${NOTIFY_TO}`);
    }
  } catch (error) {
    console.error("[mail] failed to send", subject, error);
  }
}

/** A valid one-page PDF, so the test goes through the same attachment path as a quotation. */
function testPdf() {
  const text = "BT /F1 22 Tf 72 700 Td (Takamol Advanced - test email) Tj ET";
  const objects = [
    "<</Type/Catalog/Pages 2 0 R>>",
    "<</Type/Pages/Kids[3 0 R]/Count 1>>",
    "<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>",
    `<</Length ${text.length}>>stream\n${text}\nendstream`,
    "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((body, i) => {
    const at = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return at;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

/** A test message with a small PDF attached, to check the mail settings from the admin. Throws when sending fails. */
export function sendTestEmail(to: string) {
  return deliver({
    to: [to],
    subject: "رسالة تجريبية من موقع تكامل المتقدمة · Test email",
    attachments: [{ name: "test.pdf", mime: "application/pdf", content: testPdf() }],
    ...letter(
      "هذه رسالة تجريبية من لوحة تحكم الموقع، ومعها ملف PDF مرفق. وصولها يعني أن إرسال عروض الأسعار بالبريد يعمل.\n\n" +
        "This is a test from the website's control panel, with a PDF attached. If it arrived, quotations can be emailed.",
    ),
  });
}

/** A prepared quotation emailed to the client. False when email isn't set up; throws when sending fails. */
export function sendQuotationEmail(mail: { to: string[]; cc: string[]; subject: string; message: string; attachments: MailAttachment[] }) {
  return deliver({ to: mail.to, cc: mail.cc, subject: mail.subject, attachments: mail.attachments, ...letter(mail.message) });
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
