/* Monthly performance (KPI) reports: one report per department per month,
   with the department's indicators and plan, and a KPI card for each
   employee. Shared by the admin editor, the printable sheet and the server,
   so it must stay free of server-only imports. */

export type KpiRow = { indicator: string; weight: number; score: number | null; note: string };

export type Evaluation = {
  employeeId: number;
  /** the employee's name and title as they were when the report was written */
  name: string;
  title: string;
  highlights: string[];
  kpis: KpiRow[];
  /** the weighted average of the KPI scores, kept for lists and history */
  score: number | null;
};

export type ReportMeta = { addressedTo: string; supervisedBy: string; preparedBy: string; generalStatus: string };
export type Achievement = { title: string; text: string };
export type Indicators = { columns: string[]; rows: string[][] };
export type Signatory = { title: string; name: string };

export type ReportContent = {
  meta: ReportMeta;
  summary: string;
  achievements: Achievement[];
  indicators: Indicators;
  /** a KPI card for the department as a whole (optional) */
  teamKpis: KpiRow[];
  plan: string[];
  signatories: Signatory[];
};

export const REPORT_STATUSES = ["draft", "approved"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];
export const isReportStatus = (v: string): v is ReportStatus => (REPORT_STATUSES as readonly string[]).includes(v);

export type Department = { id: number; name: string; nameEn: string; sortOrder: number; employees: number };
export type Employee = {
  id: number;
  departmentId: number;
  department: string;
  name: string;
  title: string;
  active: boolean;
  sortOrder: number;
};

export type KpiReport = {
  id: number;
  departmentId: number;
  department: string;
  /** "YYYY-MM" */
  period: string;
  title: string;
  status: ReportStatus;
  content: ReportContent;
  evaluations: Evaluation[];
  /** how many KPI cards the report holds (known even when the cards aren't loaded) */
  cards: number;
  /** the average of the employees' scores */
  score: number | null;
  createdAt: string;
  updatedAt: string;
};

/* ---- scoring ------------------------------------------------------------ */

export const round1 = (n: number) => Math.round(n * 10) / 10;
export const round2 = (n: number) => Math.round(n * 100) / 100;

/** The weighted average of the KPI scores (out of 10), or null when none are scored. */
export function weightedScore(kpis: KpiRow[]): number | null {
  let sum = 0;
  let weights = 0;
  for (const k of kpis) {
    if (k.score === null || !(k.weight > 0)) continue;
    sum += k.weight * k.score;
    weights += k.weight;
  }
  return weights > 0 ? round2(sum / weights) : null;
}

export const totalWeight = (kpis: KpiRow[]) => kpis.reduce((s, k) => s + (k.weight > 0 ? k.weight : 0), 0);

export const RATINGS = ["excellent", "veryGood", "good", "fair", "weak"] as const;
export type Rating = (typeof RATINGS)[number];

/** The rating band for a score out of 10. */
export function rating(score: number | null): Rating | null {
  if (score === null) return null;
  if (score >= 9) return "excellent";
  if (score >= 8) return "veryGood";
  if (score >= 7) return "good";
  if (score >= 6) return "fair";
  return "weak";
}

export const RATING_LABELS: Record<Rating, { ar: string; en: string }> = {
  excellent: { ar: "ممتاز", en: "Excellent (Exceeds Expectations)" },
  veryGood: { ar: "جيد جدًا", en: "Very good" },
  good: { ar: "جيد", en: "Good" },
  fair: { ar: "مقبول", en: "Fair" },
  weak: { ar: "يحتاج إلى تحسين", en: "Needs improvement" },
};

export const formatScore = (score: number | null) => (score === null ? "—" : `${score.toFixed(score % 1 === 0 ? 1 : 2).replace(/0$/, "")} / 10`);

/* ---- periods ------------------------------------------------------------ */

export const PERIOD = /^\d{4}-(0[1-9]|1[0-2])$/;

/** "2026-08" → "أغسطس 2026" / "August 2026". */
export function formatPeriod(period: string, locale: string) {
  if (!PERIOD.test(period)) return period;
  const [y, m] = period.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ar-SA-u-ca-gregory-nu-latn", {
    month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, 1)));
}

/** The current month in Riyadh as "YYYY-MM". */
export function currentPeriod() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit" }).format(new Date());
}

/* ---- defaults ----------------------------------------------------------- */

export const DEFAULT_COLUMNS = ["المعيار / بند الإنجاز", "المستهدف", "المتحقق الفعلي", "الحالة / نسبة الإنجاز"];

export const DEFAULT_SIGNATORIES: Signatory[] = [
  { title: "عضو اللجنة التنفيذية ومدير إدارة التقنية والتشغيل", name: "م. عبدالرحمن الصياد" },
  { title: "المدير التقني", name: "م. أحمد عزت" },
  { title: "مدير العمليات", name: "أ. محمد مصطفى" },
];

export const emptyContent = (): ReportContent => ({
  meta: {
    addressedTo: "م. عبد الرحمن الصياد / الإدارة العليا",
    supervisedBy: "أ/ محمد مصطفى (مدير العمليات - COO) & م/ أحمد عزت (المدير التقني - CTO)",
    preparedBy: "",
    generalStatus: "",
  },
  summary: "",
  achievements: [],
  indicators: { columns: [...DEFAULT_COLUMNS], rows: [] },
  teamKpis: [],
  plan: [],
  signatories: DEFAULT_SIGNATORIES.map((s) => ({ ...s })),
});

export const emptyKpi = (): KpiRow => ({ indicator: "", weight: 25, score: null, note: "" });

/** The same indicators and weights, ready to be scored again. */
export const templateKpis = (kpis: KpiRow[]): KpiRow[] =>
  kpis.filter((k) => k.indicator).map((k) => ({ indicator: k.indicator, weight: k.weight, score: null, note: "" }));

/** A card for the employee, starting from their previous indicators when there are any. */
export const newEvaluation = (employee: { id: number; name: string; title: string }, template: KpiRow[] = []): Evaluation => ({
  employeeId: employee.id,
  name: employee.name,
  title: employee.title,
  highlights: [],
  kpis: template.length ? templateKpis(template) : [emptyKpi(), emptyKpi(), emptyKpi(), emptyKpi()],
  score: null,
});

/** A new month's content carried over from the previous report: header,
    table columns, signatures and the department card's indicators, with
    the month-specific parts (status, summary, achievements, rows, plan) blank. */
export function carryOverContent(previous: ReportContent): ReportContent {
  return {
    meta: { ...previous.meta, generalStatus: "" },
    summary: "",
    achievements: [],
    indicators: { columns: [...previous.indicators.columns], rows: [] },
    teamKpis: templateKpis(previous.teamKpis),
    plan: [],
    signatories: previous.signatories.map((s) => ({ ...s })),
  };
}

/* ---- cleaning what the editor sends ------------------------------------- */

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = <T>(v: unknown, max: number, map: (x: unknown) => T | null): T[] =>
  Array.isArray(v) ? v.slice(0, max).map(map).filter((x): x is T => x !== null) : [];

const num = (v: unknown, min: number, max: number): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

function sanitizeKpis(raw: unknown): KpiRow[] {
  return list(raw, 12, (k) => {
    const row = (k ?? {}) as Record<string, unknown>;
    const indicator = str(row.indicator, 300);
    const weight = num(row.weight, 0, 100) ?? 0;
    const score = num(row.score, 0, 10);
    const note = str(row.note, 1000);
    return indicator || note || score !== null ? { indicator, weight, score, note } : null;
  });
}

export function sanitizeContent(raw: unknown): ReportContent {
  const r = (raw ?? {}) as Record<string, unknown>;
  const meta = (r.meta ?? {}) as Record<string, unknown>;
  const ind = (r.indicators ?? {}) as Record<string, unknown>;
  const columns = list(ind.columns, 8, (c) => str(c, 80));
  const width = columns.length || DEFAULT_COLUMNS.length;
  return {
    meta: {
      addressedTo: str(meta.addressedTo, 200),
      supervisedBy: str(meta.supervisedBy, 300),
      preparedBy: str(meta.preparedBy, 200),
      generalStatus: str(meta.generalStatus, 600),
    },
    summary: str(r.summary, 6000),
    achievements: list(r.achievements, 30, (a) => {
      const o = (a ?? {}) as Record<string, unknown>;
      const title = str(o.title, 200);
      const text = str(o.text, 2000);
      return title || text ? { title, text } : null;
    }),
    indicators: {
      columns: columns.length ? columns : [...DEFAULT_COLUMNS],
      rows: list(ind.rows, 40, (row) => {
        const cells = list(row, width, (c) => str(c, 600));
        while (cells.length < width) cells.push("");
        return cells.some(Boolean) ? cells : null;
      }),
    },
    teamKpis: sanitizeKpis(r.teamKpis),
    plan: list(r.plan, 30, (p) => str(p, 1000) || null),
    signatories: list(r.signatories, 8, (s) => {
      const o = (s ?? {}) as Record<string, unknown>;
      const title = str(o.title, 200);
      const name = str(o.name, 120);
      return title || name ? { title, name } : null;
    }),
  };
}

export function sanitizeEvaluations(raw: unknown): Evaluation[] {
  return list(raw, 60, (e) => {
    const o = (e ?? {}) as Record<string, unknown>;
    const employeeId = num(o.employeeId, 1, 1e9);
    if (employeeId === null) return null;
    const kpis = sanitizeKpis(o.kpis);
    return {
      employeeId,
      name: str(o.name, 120),
      title: str(o.title, 160),
      highlights: list(o.highlights, 20, (h) => str(h, 600) || null),
      kpis,
      score: weightedScore(kpis),
    };
  });
}

/** The report's score: the average of its employees' scores, or the
    department card's score when the team is evaluated as a whole. */
export function reportScore(evaluations: { score: number | null }[], teamKpis: KpiRow[] = []): number | null {
  const scores = evaluations.map((e) => e.score).filter((s): s is number => s !== null);
  return scores.length ? round2(scores.reduce((a, b) => a + b, 0) / scores.length) : weightedScore(teamKpis);
}
