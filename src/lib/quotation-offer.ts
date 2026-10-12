/* The quotation sent to the client, in the company's own quotation template
   (Arabic, US Letter, on the letterhead). It is drafted from the brief and
   then edited in the admin, down to the template's own wording (company
   details, headings, terms, bank details): every quotation keeps its own
   copy. Shared by the editor, the printable sheet and the Word export, so it
   must stay free of server-only imports.

   Texts may mark words as bold with **double asterisks**, as the template
   does for the land area, the location and the delivery time. A section
   left empty is left out of the document. */

import { computeTotals, DEFAULT_PAYMENTS, round2, todayIso, type QuotationRecord, type ServiceKey } from "./quotation";

export type OfferItem = { area: string; details: string; quantity: number; price: number };
export type OfferBankRow = { label: string; value: string; accent: boolean };

/** The headings and labels printed around the content. */
export type OfferLabels = {
  number: string;
  date: string;
  valid: string;
  from: string;
  to: string;
  documents: string;
  timeline: string;
  financial: string;
  area: string;
  details: string;
  quantity: string;
  price: string;
  subtotal: string;
  vat: string;
  total: string;
  payments: string;
  companyDuties: string;
  clientDuties: string;
  confidentiality: string;
  termination: string;
  bank: string;
};

export type QuotationOffer = {
  /** "Quotation #", e.g. S00355 */
  number: string;
  /** "YYYY-MM-DD" */
  date: string;
  validUntil: string;
  /** e.g. عرض سعر خدمة دراسة أفضل استخدام */
  title: string;
  /** e.g. الأستاذ / ابو محمد */
  recipient: string;
  /** the sentence under the recipient: what the client wants, for which land */
  intro: string;
  /** البيانات والمستندات المطلوبة */
  documents: string[];
  /** مدة التنفيذ */
  timeline: string[];
  /** rows of العرض المالي */
  items: OfferItem[];
  /** الدفعات */
  payments: string[];
  labels: OfferLabels;
  company: { name: string; registry: string; license: string; address: string[] };
  companyDuties: string[];
  clientDuties: string[];
  confidentiality: string[];
  termination: string[];
  bank: OfferBankRow[];
  /** "العرض مقدم من", then the signing company and department */
  signature: { lead: string; lines: string[] };
};

export const OFFER_LIMITS = { items: 8, lines: 12, bank: 10, text: 800, short: 160 } as const;

/* ---- the template's wording (the starting point of every quotation) ----- */

export const DEFAULT_LABELS: OfferLabels = {
  number: "Quotation #",
  date: "DATE",
  valid: "Quotation Valid",
  from: "عرض سعر من :",
  to: "إلى",
  documents: "البيانات والمستندات المطلوبة:",
  timeline: "مدة التنفيذ",
  financial: "العرض المالي",
  area: "مساحة الأرض",
  details: "تفاصيل الخدمة",
  quantity: "العدد",
  price: "السعر",
  subtotal: "اجمالي السعر",
  vat: "الضريبة",
  total: "الاجمالي بعد الضريبة",
  payments: "الدفعات :-",
  companyDuties: "مسؤوليات شركة تكامل المتقدمة",
  clientDuties: "مسؤوليات العميل",
  confidentiality: "السرية",
  termination: "إنهاء الاتفاقية",
  bank: "بيانات الحساب البنكي للشركة",
};

export const DEFAULT_COMPANY = {
  name: "شركة تكامل المتقدمة",
  registry: "السجل التجاري  : 1009037765",
  license: "الرخصة : 1200028134",
  address: [
    "العنوان : الرياض – الياسمين – تقاطع ابي بكر الصديق مع انس بن مالك – مبنى (BSH) الدور الثاني.",
    "المشار إليها فيما بعد بـ \"شركة تكامل المتقدمة\".",
  ],
};

export const DEFAULT_COMPANY_DUTIES = [
  "**تقديم الخدمات بجودة عالية**، والالتزام بالمعايير المهنية المعمول بها في القطاع.",
  "الالتزام **بالمواعيد المحددة** لتنفيذ وتسليم الخدمات.",
  "**تقديم الدعم والاستشارات** اللازمة للعميل، وضمان ردود سريعة وفعالة.",
];

export const DEFAULT_CLIENT_DUTIES = [
  "توفير جميع **المعلومات والمستندات** المطلوبة للمشروع بشكل كامل وفي الوقت المناسب.",
  "الالتزام بسداد **الدفعات** وفقاً للشروط الزمنية المتفق عليها.",
];

export const DEFAULT_CONFIDENTIALITY = [
  "يلتزم الطرفان بالحفاظ على **سرية المعلومات** المتبادلة وعدم الإفصاح عنها أو مشاركتها مع أي طرف ثالث إلا بعد موافقة كتابية مسبقة.",
];

export const DEFAULT_TERMINATION = [
  "يحق لأي طرف إنهاء الاتفاقية في حال إخلال الطرف الآخر بالتزاماته، على أن يتم توجيه إشعار خطي وإتاحة فترة مناسبة للطرف المخالف لتصحيح الخلل.",
  "في حالة الانهاء الاتفاقية من طرف العميل، يتم الدفع لشركة تكامل المتقدمة جميع التكاليف المرتبطة بالخدمة التي تم تنفيذها حتى تاريخ الإلغاء.",
];

export const DEFAULT_BANK: OfferBankRow[] = [
  { label: "اسم الشركة", value: "شركة تكامل المتقدمة العقارية", accent: false },
  { label: "البنك", value: "مصرف الراجحي – Alrajhi Bank", accent: false },
  { label: "رقم الهوية الوطنية", value: "7040338902", accent: false },
  { label: "رقم الحساب", value: "611000010006089065888", accent: true },
  { label: "رقم الحساب الدولي - الأيبان", value: "SA8080000611608019065888", accent: true },
];

export const DEFAULT_SIGNATURE = { lead: "العرض مقدم من", lines: ["شركة تكامل المتقدمة", "إدارة الدراسات"] };

export const DEFAULT_DOCUMENTS = [
  "صك الأرض، الرفع المساحي أو الكروكي إن وجد.",
  "الموقع، أبعاد الأرض، وعرض الشوارع المحيطة.",
];

/** The template's wording, as a fresh copy for a new quotation. */
const templateWording = () => ({
  labels: { ...DEFAULT_LABELS },
  company: { ...DEFAULT_COMPANY, address: [...DEFAULT_COMPANY.address] },
  companyDuties: [...DEFAULT_COMPANY_DUTIES],
  clientDuties: [...DEFAULT_CLIENT_DUTIES],
  confidentiality: [...DEFAULT_CONFIDENTIALITY],
  termination: [...DEFAULT_TERMINATION],
  bank: DEFAULT_BANK.map((row) => ({ ...row })),
  signature: { lead: DEFAULT_SIGNATURE.lead, lines: [...DEFAULT_SIGNATURE.lines] },
});

/* ---- drafting from the brief -------------------------------------------- */

const SERVICE_NAMES: Record<Exclude<ServiceKey, "other">, string> = {
  full: "دراسة كاملة",
  medium: "دراسة متوسطة",
  preliminary: "دراسة مبدئية",
  bestUse: "دراسة أفضل استخدام",
};

const PAYMENT_STAGES = [
  "دفعة مقدمة عند بدء العمل.",
  "دفعة مرحلية عند تقديم المسودة الأولى.",
  "عند الانتهاء وقبل التسليم النهائي للمخرجات.",
];

const toLatinDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

/** "YYYY-MM-DD" plus a number of days. */
export function addDays(day: string, days: number) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return day;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days));
  return date.toISOString().slice(0, 10);
}

function workingDays(days: number | null) {
  if (days === null || days <= 0) return "10–12 أيام عمل";
  return days <= 10 ? `${days} أيام عمل` : `${days} يوم عمل`;
}

/** The quotation as the template words it, filled in from the brief. */
export function draftOffer(q: QuotationRecord, today = todayIso()): QuotationOffer {
  const service = q.services[0];
  const serviceName = !service ? "دراسة" : service === "other" ? q.serviceOther || "دراسة" : SERVICE_NAMES[service];
  const area = q.landArea.trim();
  const location = q.projectLocation.trim();
  // "30 يومًا من تاريخ العرض" → 30 days of validity
  const validity = Number(/\d+/.exec(toLatinDigits(q.validity))?.[0] ?? 30) || 30;
  const formats = q.formats.length ? q.formats : ["pdf"];
  const [p1, p2, p3] = q.payments ?? DEFAULT_PAYMENTS;

  return {
    number: q.reference,
    date: today,
    validUntil: addDays(today, validity),
    title: `عرض سعر خدمة ${serviceName}`,
    recipient: `${q.clientType === "individual" || !q.clientType ? "الأستاذ" : "السادة"} / ${q.clientName}`,
    intro:
      `والذي يرغب بخدمة ${serviceName} للأرض` +
      (area ? ` - أرض بمساحة **${area}** م²` : "") +
      (location ? ` في **${location}**` : "") +
      ".",
    documents: [...DEFAULT_DOCUMENTS],
    timeline: [
      "يبدأ تنفيذ العمل فور توقيع الطرفين على اتفاقية عرض السعر واستلام الدفعة الاولى",
      `تقوم شركة تكامل المتقدمة بتسليم الخدمات خلال **${workingDays(q.durationDays)}** من تاريخ استلام كامل البيانات والدفعة الأولى.`,
      "تلتزم شركة تكامل بتقديم تقرير الدراسة" +
        (formats.includes("pdf") ? " بصيغة **PDF**" : "") +
        (formats.includes("presentation") ? " وعرض تقديمي" : "") +
        (formats.includes("printed") ? " ونسخة مطبوعة" : "") +
        (q.meeting === false ? "" : " واجتماع لعرض ومناقشة النتائج النهائية") +
        ".",
    ],
    items: [
      {
        area,
        details: `إعداد ${serviceName} للأرض` + (location ? ` في ${location}` : "") + (area ? ` بمساحة ${area} م²` : "") + ".",
        quantity: 1,
        price: q.amount ?? 0,
      },
    ],
    payments: [p1, p2, p3].flatMap((p, i) => (p > 0 ? [`${p}% ${PAYMENT_STAGES[i]}`] : [])),
    ...templateWording(),
  };
}

/* ---- reading back what was stored or typed ------------------------------ */

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {});
const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n?/g, "\n").trim().slice(0, max) : "");
const lines = (v: unknown, max: number = OFFER_LIMITS.lines) =>
  (Array.isArray(v) ? v : []).map((l) => str(l, OFFER_LIMITS.text)).filter(Boolean).slice(0, max);
const day = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");
const num = (v: unknown, max: number) => {
  const n = typeof v === "number" ? v : Number(toLatinDigits(String(v ?? "")).replace(/[,\s]/g, ""));
  return Number.isFinite(n) && n >= 0 && n <= max ? round2(n) : 0;
};
/** A part missing from what was stored (saved before it could be edited) keeps the template's wording. */
const or = <T>(v: unknown, fallback: T, read: (v: unknown) => T): T => (v === undefined ? fallback : read(v));

/** A well-formed offer from untrusted JSON (stored, or posted by the editor). */
export function normalizeOffer(value: unknown): QuotationOffer {
  const o = obj(value);
  const t = templateWording();
  const labels = obj(o.labels);
  const company = obj(o.company);
  const signature = obj(o.signature);

  return {
    number: str(o.number, 40),
    date: day(o.date),
    validUntil: day(o.validUntil),
    title: str(o.title, 200),
    recipient: str(o.recipient, 200),
    intro: str(o.intro, OFFER_LIMITS.text),
    documents: lines(o.documents),
    timeline: lines(o.timeline),
    items: (Array.isArray(o.items) ? o.items : [])
      .map((raw) => {
        const i = obj(raw);
        return {
          area: str(i.area, OFFER_LIMITS.short),
          details: str(i.details, OFFER_LIMITS.text),
          quantity: Math.round(num(i.quantity, 10000)),
          price: num(i.price, 1e11),
        };
      })
      .filter((i) => i.details || i.price)
      .slice(0, OFFER_LIMITS.items),
    payments: lines(o.payments),
    labels: Object.fromEntries(
      (Object.keys(DEFAULT_LABELS) as (keyof OfferLabels)[]).map((k) => [k, or(labels[k], t.labels[k], (v) => str(v, OFFER_LIMITS.short))]),
    ) as OfferLabels,
    company: {
      name: or(company.name, t.company.name, (v) => str(v, OFFER_LIMITS.short)),
      registry: or(company.registry, t.company.registry, (v) => str(v, OFFER_LIMITS.short)),
      license: or(company.license, t.company.license, (v) => str(v, OFFER_LIMITS.short)),
      address: or(company.address, t.company.address, (v) => lines(v, 4)),
    },
    companyDuties: or(o.companyDuties, t.companyDuties, (v) => lines(v)),
    clientDuties: or(o.clientDuties, t.clientDuties, (v) => lines(v)),
    confidentiality: or(o.confidentiality, t.confidentiality, (v) => lines(v)),
    termination: or(o.termination, t.termination, (v) => lines(v)),
    bank: or(o.bank, t.bank, (v) =>
      (Array.isArray(v) ? v : [])
        .map((raw) => {
          const r = obj(raw);
          return { label: str(r.label, OFFER_LIMITS.short), value: str(r.value, OFFER_LIMITS.short), accent: r.accent === true };
        })
        .filter((r) => r.label || r.value)
        .slice(0, OFFER_LIMITS.bank),
    ),
    signature: {
      lead: or(signature.lead, t.signature.lead, (v) => str(v, OFFER_LIMITS.short)),
      lines: or(signature.lines, t.signature.lines, (v) => lines(v, 4)),
    },
  };
}

export function parseOffer(raw: string): QuotationOffer | null {
  if (!raw) return null;
  try {
    return normalizeOffer(JSON.parse(raw));
  } catch {
    return null;
  }
}

/* ---- figures and formatting --------------------------------------------- */

export function offerTotals(items: OfferItem[]) {
  const subtotal = round2(items.reduce((sum, i) => sum + i.quantity * i.price, 0));
  return { subtotal, ...computeTotals(subtotal) };
}

/** "10,000.00 SAR", as in the template. */
export const offerMoney = (n: number) =>
  `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} SAR`;

/** "YYYY-MM-DD" → "11/10/2026" (day first), as in the template. */
export function offerDate(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
}

/** Splits **bold** runs out of a text: odd parts are bold. */
export const boldParts = (text: string) => text.split("**");
