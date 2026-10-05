/* The quotation intake brief that sales people fill in before a quote is
   prepared. Shared by the public form, the printable sheet and the admin
   area, so it must stay free of server-only imports. */

export const CLIENT_TYPES = ["individual", "company", "government"] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

export const SERVICES = ["bestUse", "feasibility", "investmentFile", "other"] as const;
export type ServiceKey = (typeof SERVICES)[number];

export const DOCUMENTS = ["deed", "survey", "coordinates", "media"] as const;
export type DocumentKey = (typeof DOCUMENTS)[number];

export const FORMATS = ["pdf", "presentation", "printed"] as const;
export type FormatKey = (typeof FORMATS)[number];

export const QUOTATION_STATUSES = ["new", "preparing", "sent", "accepted", "declined"] as const;
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];
export const isQuotationStatus = (v: string): v is QuotationStatus =>
  (QUOTATION_STATUSES as readonly string[]).includes(v);

export const SALES_PEOPLE = ["Waleed Al-Anzan", "Mohamed Almohyfeed", "Mohamed Altuwaim", "Hajar Saad"] as const;

export const VAT_RATE = 0.15;
export const DEFAULT_PAYMENTS = [50, 20, 30] as const;
export const DEFAULT_DEPARTMENT = { ar: "إدارة الدراسات والاستشارات", en: "Studies & Consulting Department" };

export type QuotationFile = { id: number; name: string; mime: string; size: number };

/** Files a brief may carry: deeds, plans, photos, map exports. */
export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const ATTACHMENT_MAX_COUNT = 10;
export const ATTACHMENT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx", "xls", "xlsx", "kml", "kmz", "dwg", "dxf", "zip"] as const;

/** The brief as stored, with the money figures already worked out. */
export type QuotationRecord = {
  id: number;
  token: string;
  reference: string;
  salesPerson: string;
  requestDate: string;
  department: string;
  clientName: string;
  clientType: ClientType | "";
  clientContact: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  services: ServiceKey[];
  serviceOther: string;
  projectName: string;
  projectLocation: string;
  landArea: string;
  boundaries: string;
  studyGoal: string;
  documents: DocumentKey[];
  clientRequirements: string;
  /** the low end of the price range (or the single price) */
  amount: number | null;
  vat: number | null;
  total: number | null;
  /** the high end of the price range; null when a single price was given */
  amountMax: number | null;
  vatMax: number | null;
  totalMax: number | null;
  durationDays: number | null;
  validity: string;
  payments: [number, number, number] | null;
  formats: FormatKey[];
  meeting: boolean | null;
  notes: string;
  attachments: QuotationFile[];
  status: QuotationStatus;
  adminNotes: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
};

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** VAT and total for an amount before tax. */
export function computeTotals(amount: number) {
  const vat = round2(amount * VAT_RATE);
  return { vat, total: round2(amount + vat) };
}

const numberLocale = (locale: string) => (locale === "en" ? "en-US" : "ar-SA-u-nu-latn");

export function formatMoney(value: number, locale: string) {
  return new Intl.NumberFormat(numberLocale(locale), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatInteger(value: number, locale: string) {
  return new Intl.NumberFormat(numberLocale(locale)).format(value);
}

/** A "YYYY-MM-DD" day as a readable date. */
export function formatDay(value: string, locale: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return value;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ar-SA-u-ca-gregory-nu-latn", {
    dateStyle: "long", timeZone: "UTC",
  }).format(date);
}

/** Today in Riyadh as "YYYY-MM-DD". */
export function todayIso() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(new Date());
}

/** Looks up dotted keys ("services.bestUse") in a nested messages object. */
export function lookup(messages: unknown): (key: string) => string {
  return (key) => {
    let current: unknown = messages;
    for (const part of key.split(".")) {
      if (!current || typeof current !== "object") return key;
      current = (current as Record<string, unknown>)[part];
    }
    return typeof current === "string" ? current : key;
  };
}

export type SheetRow = { label: string; value: string; multiline?: boolean; ltr?: boolean };
export type SheetSection = { title: string; rows: SheetRow[] };

/** The brief as labelled sections, for the printable sheet and the admin. */
export function quotationSections(q: QuotationRecord, t: (key: string) => string, locale: string): SheetSection[] {
  const dash = "—";
  const yesNo = (v: boolean | null) => (v === null ? dash : v ? t("yes") : t("no"));
  const list = (keys: readonly string[], ns: string) => (keys.length ? keys.map((k) => t(`${ns}.${k}`)).join("، ") : dash);
  const money = (v: number | null, max: number | null) =>
    v === null ? dash
    : max === null || max === v ? `${formatMoney(v, locale)} ${t("currency")}`
    : t("range").replace("{from}", formatMoney(v, locale)).replace("{to}", formatMoney(max, locale)) + ` ${t("currency")}`;
  const services = q.services.map((k) => (k === "other" && q.serviceOther ? `${t("services.other")}: ${q.serviceOther}` : t(`services.${k}`)));

  return [
    {
      title: t("sections.sales"),
      rows: [
        { label: t("salesPerson"), value: q.salesPerson || dash },
        { label: t("requestDate"), value: q.requestDate ? formatDay(q.requestDate, locale) : dash },
        { label: t("reference"), value: q.reference || dash, ltr: true },
        { label: t("department"), value: q.department || dash },
      ],
    },
    {
      title: t("sections.client"),
      rows: [
        { label: t("clientName"), value: q.clientName || dash },
        { label: t("clientType"), value: q.clientType ? t(`clientTypes.${q.clientType}`) : dash },
        { label: t("clientContact"), value: q.clientContact || dash },
        { label: t("clientPhone"), value: q.clientPhone || dash, ltr: true },
        { label: t("clientEmail"), value: q.clientEmail || dash, ltr: true },
        { label: t("clientAddress"), value: q.clientAddress || dash },
      ],
    },
    {
      title: t("sections.project"),
      rows: [
        { label: t("serviceType"), value: services.length ? services.join("، ") : dash, multiline: true },
        { label: t("projectName"), value: q.projectName || dash },
        { label: t("projectLocation"), value: q.projectLocation || dash },
        { label: t("landArea"), value: q.landArea ? `${q.landArea} ${t("landAreaUnit")}` : dash },
        { label: t("boundaries"), value: q.boundaries || dash, multiline: true },
        { label: t("studyGoal"), value: q.studyGoal || dash, multiline: true },
      ],
    },
    {
      title: t("sections.documents"),
      rows: [
        { label: t("documentsReceived"), value: list(q.documents, "documents"), multiline: true },
        { label: t("clientRequirements"), value: q.clientRequirements || dash, multiline: true },
        {
          label: t("attachments"),
          value: q.attachments.length ? q.attachments.map((f) => `${f.name} (${formatBytes(f.size)})`).join("\n") : dash,
          multiline: true,
        },
      ],
    },
    {
      title: t("sections.financial"),
      rows: [
        { label: t("amount"), value: money(q.amount, q.amountMax), ltr: q.amountMax !== null },
        { label: t("vat"), value: money(q.vat, q.vatMax), ltr: q.vatMax !== null },
        { label: t("total"), value: money(q.total, q.totalMax), ltr: q.totalMax !== null },
        { label: t("duration"), value: q.durationDays === null ? dash : `${formatInteger(q.durationDays, locale)} ${t("durationUnit")}` },
        { label: t("validity"), value: q.validity || dash },
        {
          label: t("paymentsTitle"),
          value: q.payments
            ? [t("payment1"), t("payment2"), t("payment3")].map((l, i) => `${l}: ${formatInteger(q.payments![i], locale)}%`).join("\n")
            : dash,
          multiline: true,
        },
      ],
    },
    {
      title: t("sections.deliverables"),
      rows: [
        { label: t("reportFormat"), value: list(q.formats, "formats") },
        { label: t("meeting"), value: yesNo(q.meeting) },
        { label: t("notes"), value: q.notes || dash, multiline: true },
      ],
    },
  ];
}
