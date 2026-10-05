import "server-only";
import type { DatabaseSync } from "node:sqlite";
import { reportScore, weightedScore } from "@/lib/kpi";
import { SEED_DEPARTMENTS, SEED_REPORTS } from "@/lib/kpi-seed";

/* Loads the departments, team and August 2026 reports once, inside the
   migration that creates the KPI tables. */
export function seedKpi(db: DatabaseSync) {
  const department = db.prepare("INSERT INTO departments (name, name_en, sort_order) VALUES (?, ?, ?)");
  const employee = db.prepare("INSERT INTO employees (department_id, name, title, sort_order) VALUES (?, ?, ?, ?)");
  const report = db.prepare(
    "INSERT INTO kpi_reports (department_id, period, title, status, content, score) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const evaluation = db.prepare(
    "INSERT INTO kpi_evaluations (report_id, employee_id, name, title, highlights, kpis, score, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );

  const departments = new Map<string, number>();
  const employees = new Map<string, { id: number; name: string; title: string }>();
  SEED_DEPARTMENTS.forEach((d, i) => {
    const id = Number(department.run(d.name, d.nameEn, i).lastInsertRowid);
    departments.set(d.key, id);
    d.employees.forEach((e, j) => {
      const eid = Number(employee.run(id, e.name, e.title, j).lastInsertRowid);
      employees.set(e.key, { id: eid, name: e.name, title: e.title });
    });
  });

  for (const r of SEED_REPORTS) {
    const departmentId = departments.get(r.department);
    if (!departmentId) continue;
    const evaluations = r.evaluations
      .map((e) => ({ ...e, who: employees.get(e.employee) }))
      .filter((e) => e.who)
      .map((e) => ({ ...e, score: weightedScore(e.kpis) }));
    const id = Number(
      report.run(departmentId, r.period, r.title, r.status, JSON.stringify(r.content), reportScore(evaluations, r.content.teamKpis)).lastInsertRowid,
    );
    evaluations.forEach((e, i) => {
      evaluation.run(id, e.who!.id, e.who!.name, e.who!.title, JSON.stringify(e.highlights), JSON.stringify(e.kpis), e.score, i);
    });
  }
}
