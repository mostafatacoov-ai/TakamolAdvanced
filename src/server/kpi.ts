import "server-only";
import {
  isReportStatus, newEvaluation, PERIOD, reportScore, sanitizeContent, sanitizeEvaluations,
  type Department, type Employee, type Evaluation, type KpiReport, type KpiRow, type ReportContent, type ReportStatus,
} from "@/lib/kpi";
import { all, one, run, transaction } from "./db";

/* ---- departments ------------------------------------------------------- */

type DepartmentRow = { id: number; name: string; name_en: string; sort_order: number; employees: number };

const toDepartment = (r: DepartmentRow): Department => ({
  id: r.id, name: r.name, nameEn: r.name_en, sortOrder: r.sort_order, employees: r.employees,
});

const DEPARTMENT_SELECT = `SELECT d.*, (SELECT COUNT(*) FROM employees e WHERE e.department_id = d.id AND e.active = 1) AS employees
  FROM departments d`;

export const listDepartments = () => all<DepartmentRow>(`${DEPARTMENT_SELECT} ORDER BY d.sort_order, d.id`).map(toDepartment);

export function getDepartment(id: number) {
  const row = one<DepartmentRow>(`${DEPARTMENT_SELECT} WHERE d.id = ?`, id);
  return row ? toDepartment(row) : null;
}

export function createDepartment(name: string, nameEn: string) {
  const next = (one<{ n: number | null }>("SELECT MAX(sort_order) AS n FROM departments")?.n ?? -1) + 1;
  return run("INSERT INTO departments (name, name_en, sort_order) VALUES (?, ?, ?)", name, nameEn, next).id;
}

export function updateDepartment(id: number, name: string, nameEn: string) {
  run("UPDATE departments SET name = ?, name_en = ? WHERE id = ?", name, nameEn, id);
}

/** Removes the department with its employees and reports. */
export function deleteDepartment(id: number) {
  run("DELETE FROM departments WHERE id = ?", id);
}

export function moveDepartment(id: number, direction: -1 | 1) {
  const rows = all<{ id: number }>("SELECT id FROM departments ORDER BY sort_order, id");
  const index = rows.findIndex((r) => r.id === id);
  const other = index + direction;
  if (index < 0 || other < 0 || other >= rows.length) return;
  [rows[index], rows[other]] = [rows[other], rows[index]];
  transaction(() => rows.forEach((r, i) => run("UPDATE departments SET sort_order = ? WHERE id = ?", i, r.id)));
}

/* ---- employees --------------------------------------------------------- */

type EmployeeRow = { id: number; department_id: number; department: string; name: string; title: string; active: number; sort_order: number };

const toEmployee = (r: EmployeeRow): Employee => ({
  id: r.id, departmentId: r.department_id, department: r.department, name: r.name, title: r.title,
  active: r.active === 1, sortOrder: r.sort_order,
});

const EMPLOYEE_SELECT = `SELECT e.*, d.name AS department FROM employees e JOIN departments d ON d.id = e.department_id`;

export function listEmployees(filter: { departmentId?: number; activeOnly?: boolean } = {}) {
  const where: string[] = [];
  const params: number[] = [];
  if (filter.departmentId) {
    where.push("e.department_id = ?");
    params.push(filter.departmentId);
  }
  if (filter.activeOnly) where.push("e.active = 1");
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return all<EmployeeRow>(`${EMPLOYEE_SELECT} ${clause} ORDER BY d.sort_order, e.sort_order, e.id`, ...params).map(toEmployee);
}

export function getEmployee(id: number) {
  const row = one<EmployeeRow>(`${EMPLOYEE_SELECT} WHERE e.id = ?`, id);
  return row ? toEmployee(row) : null;
}

export type EmployeeInput = { departmentId: number; name: string; title: string; active: boolean };

export function createEmployee(input: EmployeeInput) {
  const next = (one<{ n: number | null }>("SELECT MAX(sort_order) AS n FROM employees WHERE department_id = ?", input.departmentId)?.n ?? -1) + 1;
  return run(
    "INSERT INTO employees (department_id, name, title, active, sort_order) VALUES (?, ?, ?, ?, ?)",
    input.departmentId, input.name, input.title, input.active, next,
  ).id;
}

export function updateEmployee(id: number, input: EmployeeInput) {
  run("UPDATE employees SET department_id = ?, name = ?, title = ?, active = ? WHERE id = ?", input.departmentId, input.name, input.title, input.active, id);
}

/** Removes the employee and their KPI cards in every report. */
export function deleteEmployee(id: number) {
  run("DELETE FROM employees WHERE id = ?", id);
}

export function moveEmployee(id: number, direction: -1 | 1) {
  const employee = getEmployee(id);
  if (!employee) return;
  const rows = all<{ id: number }>("SELECT id FROM employees WHERE department_id = ? ORDER BY sort_order, id", employee.departmentId);
  const index = rows.findIndex((r) => r.id === id);
  const other = index + direction;
  if (index < 0 || other < 0 || other >= rows.length) return;
  [rows[index], rows[other]] = [rows[other], rows[index]];
  transaction(() => rows.forEach((r, i) => run("UPDATE employees SET sort_order = ? WHERE id = ?", i, r.id)));
}

/* ---- reports ----------------------------------------------------------- */

type ReportRow = {
  id: number; department_id: number; department: string; period: string; title: string; status: string;
  content: string; score: number | null; created_at: string; updated_at: string; cards?: number;
};
type EvaluationRow = {
  id: number; report_id: number; employee_id: number; name: string; title: string; highlights: string; kpis: string;
  score: number | null; sort_order: number;
};

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const toEvaluation = (r: EvaluationRow): Evaluation => ({
  employeeId: r.employee_id,
  name: r.name,
  title: r.title,
  highlights: parseJson<string[]>(r.highlights, []),
  kpis: parseJson<KpiRow[]>(r.kpis, []),
  score: r.score,
});

const toReport = (r: ReportRow, evaluations: Evaluation[] = []): KpiReport => ({
  id: r.id,
  departmentId: r.department_id,
  department: r.department,
  period: r.period,
  title: r.title,
  status: isReportStatus(r.status) ? r.status : "draft",
  content: sanitizeContent(parseJson<Partial<ReportContent>>(r.content, {})),
  evaluations,
  cards: r.cards ?? evaluations.length,
  score: r.score,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const REPORT_SELECT = `SELECT r.*, d.name AS department, (SELECT COUNT(*) FROM kpi_evaluations ev WHERE ev.report_id = r.id) AS cards
  FROM kpi_reports r JOIN departments d ON d.id = r.department_id`;

export function listReports(filter: { departmentId?: number; period?: string; status?: string } = {}) {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (filter.departmentId) {
    where.push("r.department_id = ?");
    params.push(filter.departmentId);
  }
  if (filter.period && PERIOD.test(filter.period)) {
    where.push("r.period = ?");
    params.push(filter.period);
  }
  if (filter.status && isReportStatus(filter.status)) {
    where.push("r.status = ?");
    params.push(filter.status);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return all<ReportRow>(`${REPORT_SELECT} ${clause} ORDER BY r.period DESC, d.sort_order, r.id DESC`, ...params).map((r) => toReport(r));
}

export function getReport(id: number) {
  const row = one<ReportRow>(`${REPORT_SELECT} WHERE r.id = ?`, id);
  if (!row) return null;
  const evaluations = all<EvaluationRow>("SELECT * FROM kpi_evaluations WHERE report_id = ? ORDER BY sort_order, id", id).map(toEvaluation);
  return toReport(row, evaluations);
}

export const reportExists = (departmentId: number, period: string, exceptId?: number) =>
  !!one<{ id: number }>("SELECT id FROM kpi_reports WHERE department_id = ? AND period = ? AND id != ?", departmentId, period, exceptId ?? 0);

/** A new report for the department and month, with a blank KPI card for each active employee. */
export function createReport(input: { departmentId: number; period: string; title: string; content: ReportContent }) {
  return transaction(() => {
    const id = run(
      "INSERT INTO kpi_reports (department_id, period, title, content) VALUES (?, ?, ?, ?)",
      input.departmentId, input.period, input.title, JSON.stringify(input.content),
    ).id;
    listEmployees({ departmentId: input.departmentId, activeOnly: true }).forEach((e, i) => {
      const ev = newEvaluation(e);
      run(
        "INSERT INTO kpi_evaluations (report_id, employee_id, name, title, highlights, kpis, score, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        id, e.id, ev.name, ev.title, JSON.stringify(ev.highlights), JSON.stringify(ev.kpis), ev.score, i,
      );
    });
    return id;
  });
}

export function saveReport(
  id: number,
  input: { title: string; status: ReportStatus; content: unknown; evaluations: unknown },
  userId: number,
) {
  const content = sanitizeContent(input.content);
  const evaluations = sanitizeEvaluations(input.evaluations);
  transaction(() => {
    run(
      "UPDATE kpi_reports SET title = ?, status = ?, content = ?, score = ?, updated_by = ?, updated_at = datetime('now') WHERE id = ?",
      input.title, input.status, JSON.stringify(content), reportScore(evaluations, content.teamKpis), userId, id,
    );
    run("DELETE FROM kpi_evaluations WHERE report_id = ?", id);
    evaluations.forEach((e, i) => {
      // only people who still exist can hold a card
      if (!one<{ id: number }>("SELECT id FROM employees WHERE id = ?", e.employeeId)) return;
      run(
        "INSERT INTO kpi_evaluations (report_id, employee_id, name, title, highlights, kpis, score, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        id, e.employeeId, e.name, e.title, JSON.stringify(e.highlights), JSON.stringify(e.kpis), e.score, i,
      );
    });
  });
  return { content, evaluations };
}

export function setReportStatus(id: number, status: ReportStatus, userId: number) {
  run("UPDATE kpi_reports SET status = ?, updated_by = ?, updated_at = datetime('now') WHERE id = ?", status, userId, id);
}

export function deleteReport(id: number) {
  run("DELETE FROM kpi_reports WHERE id = ?", id);
}

export const listPeriods = () => all<{ period: string }>("SELECT DISTINCT period FROM kpi_reports ORDER BY period DESC").map((r) => r.period);

export const countReports = () => one<{ n: number }>("SELECT COUNT(*) AS n FROM kpi_reports")?.n ?? 0;
export const countDraftReports = () => one<{ n: number }>("SELECT COUNT(*) AS n FROM kpi_reports WHERE status = 'draft'")?.n ?? 0;

/* ---- people across reports --------------------------------------------- */

export type EmployeeHistoryEntry = {
  reportId: number;
  period: string;
  department: string;
  reportTitle: string;
  status: ReportStatus;
  evaluation: Evaluation;
};

/** Every KPI card the employee has had, newest month first. */
export function employeeHistory(employeeId: number): EmployeeHistoryEntry[] {
  return all<EvaluationRow & { period: string; department: string; report_title: string; status: string }>(
    `SELECT ev.*, r.period, r.title AS report_title, r.status, d.name AS department
     FROM kpi_evaluations ev JOIN kpi_reports r ON r.id = ev.report_id JOIN departments d ON d.id = r.department_id
     WHERE ev.employee_id = ? ORDER BY r.period DESC, r.id DESC`,
    employeeId,
  ).map((r) => ({
    reportId: r.report_id,
    period: r.period,
    department: r.department,
    reportTitle: r.report_title,
    status: isReportStatus(r.status) ? r.status : "draft",
    evaluation: toEvaluation(r),
  }));
}

export type EmployeeOverview = Employee & {
  reports: number;
  average: number | null;
  latest: { period: string; score: number | null; reportId: number } | null;
};

/** Everyone, with their latest card and their average score across all reports. */
export function employeesOverview(): EmployeeOverview[] {
  const employees = listEmployees();
  const stats = new Map(
    all<{ employee_id: number; n: number; avg: number | null }>(
      "SELECT employee_id, COUNT(*) AS n, AVG(score) AS avg FROM kpi_evaluations WHERE score IS NOT NULL GROUP BY employee_id",
    ).map((r) => [r.employee_id, r]),
  );
  const latest = new Map(
    all<{ employee_id: number; period: string; score: number | null; report_id: number }>(
      `SELECT ev.employee_id, r.period, ev.score, ev.report_id
       FROM kpi_evaluations ev JOIN kpi_reports r ON r.id = ev.report_id
       WHERE r.id = (SELECT r2.id FROM kpi_evaluations ev2 JOIN kpi_reports r2 ON r2.id = ev2.report_id
                     WHERE ev2.employee_id = ev.employee_id ORDER BY r2.period DESC, r2.id DESC LIMIT 1)`,
    ).map((r) => [r.employee_id, r]),
  );
  return employees.map((e) => {
    const s = stats.get(e.id);
    const l = latest.get(e.id);
    return {
      ...e,
      reports: s?.n ?? 0,
      average: s?.avg === null || s?.avg === undefined ? null : Math.round(s.avg * 100) / 100,
      latest: l ? { period: l.period, score: l.score, reportId: l.report_id } : null,
    };
  });
}
