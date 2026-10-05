"use client";

import { useState, type ReactNode } from "react";
import type { FormAction } from "@/lib/admin/action-state";
import {
  emptyKpi, formatPeriod, formatScore, newEvaluation, rating, RATING_LABELS, REPORT_STATUSES, totalWeight, weightedScore,
  type Achievement, type Employee, type Evaluation, type KpiReport, type KpiRow, type ReportContent, type ReportStatus, type Signatory,
} from "@/lib/kpi";
import { SaveBar } from "./ContentEditor";
import { ActionForm, FieldError, useUnsavedWarning } from "./forms";
import { useAdminLang, useT } from "./I18n";
import { Icon } from "./icons";
import { RATING_TONE } from "./status";
import { Badge, buttonClass, Card, cx, EmptyState, Field, inputClass } from "./ui";

type Draft = { title: string; status: ReportStatus; content: ReportContent; evaluations: Evaluation[] };

const area = cx(inputClass, "resize-y leading-relaxed");
const small = cx(inputClass, "px-2.5 py-1.5 text-[13px]");

/** The monthly report editor: header, summary, indicators, KPI cards, plan. */
export function KpiReportEditor({
  report,
  employees,
  templates,
  suggestions,
  action,
}: {
  report: KpiReport;
  /** the department's active employees, offered for new cards */
  employees: Employee[];
  /** each employee's previous indicators, used when their card is added */
  templates: Record<number, KpiRow[]>;
  /** indicators the department has used before, offered when adding a row */
  suggestions: string[];
  action: FormAction;
}) {
  const t = useT();
  const lang = useAdminLang();
  const [data, setData] = useState<Draft>({
    title: report.title, status: report.status, content: report.content, evaluations: report.evaluations,
  });
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);

  const update = (patch: Partial<Draft>) => {
    setData((d) => ({ ...d, ...patch }));
    setDirty(true);
  };
  const setContent = (patch: Partial<ReportContent>) => update({ content: { ...data.content, ...patch } });
  const c = data.content;
  const withoutCard = employees.filter((e) => !data.evaluations.some((ev) => ev.employeeId === e.id));

  return (
    <ActionForm action={action} notice="none" className="space-y-6">
      <input type="hidden" name="payload" value={JSON.stringify(data)} />

      <Card title={t("kpi.edit.settings")}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px]">
          <Field label={t("kpi.new.reportTitle")}>
            <input value={data.title} onChange={(e) => update({ title: e.target.value })} dir="auto" className={inputClass} />
            <FieldError name="title" />
          </Field>
          <Field label={t("common.status")}>
            <select value={data.status} onChange={(e) => update({ status: e.target.value as ReportStatus })} className={inputClass}>
              {REPORT_STATUSES.map((s) => <option key={s} value={s}>{t(`kpi.status.${s}`)}</option>)}
            </select>
          </Field>
        </div>
        <p className="mt-3 text-[13px] text-steel">{report.department} · {formatPeriod(report.period, lang)}</p>
      </Card>

      <Card title={t("kpi.edit.meta")}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(["addressedTo", "supervisedBy", "preparedBy"] as const).map((key) => (
            <Field key={key} label={t(`kpi.edit.${key}`)}>
              <input value={c.meta[key]} onChange={(e) => setContent({ meta: { ...c.meta, [key]: e.target.value } })} dir="auto" className={inputClass} />
            </Field>
          ))}
          <Field label={t("kpi.edit.generalStatus")} className="md:col-span-2">
            <textarea value={c.meta.generalStatus} onChange={(e) => setContent({ meta: { ...c.meta, generalStatus: e.target.value } })} rows={2} dir="auto" className={area} />
          </Field>
        </div>
      </Card>

      <Card title={t("kpi.edit.summary")}>
        <textarea value={c.summary} onChange={(e) => setContent({ summary: e.target.value })} rows={6} dir="auto" className={area} />
      </Card>

      <Card title={t("kpi.edit.achievements")}>
        <ListEditor<Achievement>
          items={c.achievements}
          onChange={(achievements) => setContent({ achievements })}
          create={() => ({ title: "", text: "" })}
          addLabel={t("kpi.edit.addAchievement")}
          render={(a, set) => (
            <div className="grid flex-1 grid-cols-1 gap-2">
              <input value={a.title} onChange={(e) => set({ ...a, title: e.target.value })} placeholder={t("kpi.edit.achievementTitle")} dir="auto" className={small} />
              <textarea value={a.text} onChange={(e) => set({ ...a, text: e.target.value })} placeholder={t("kpi.edit.achievementText")} rows={2} dir="auto" className={cx(small, "resize-y")} />
            </div>
          )}
        />
      </Card>

      <Card title={t("kpi.edit.indicators")} description={t("kpi.edit.indicatorsHint")}>
        <IndicatorsEditor value={c.indicators} onChange={(indicators) => setContent({ indicators })} />
      </Card>

      <Card title={t("kpi.edit.teamKpis")} description={t("kpi.edit.teamKpisHint")}>
        <KpiRowsEditor kpis={c.teamKpis} suggestions={suggestions} onChange={(teamKpis) => setContent({ teamKpis })} />
      </Card>

      <Card
        title={t("kpi.edit.evaluations")}
        actions={
          withoutCard.length > 0 ? (
            <select
              value=""
              onChange={(e) => {
                const employee = employees.find((x) => x.id === Number(e.target.value));
                if (employee) update({ evaluations: [...data.evaluations, newEvaluation(employee, templates[employee.id] ?? [])] });
              }}
              className={cx(small, "w-auto")}
            >
              <option value="">{t("kpi.edit.addCard")}…</option>
              {withoutCard.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          ) : (
            <span className="text-[12.5px] text-steel">{employees.length ? t("kpi.edit.allAdded") : t("kpi.edit.noEmployees")}</span>
          )
        }
      >
        {data.evaluations.length === 0 ? (
          <EmptyState>{employees.length ? t("kpi.edit.allAdded") : t("kpi.edit.noEmployees")}</EmptyState>
        ) : (
          <div className="space-y-6">
            {data.evaluations.map((ev, i) => (
              <EvaluationEditor
                key={ev.employeeId}
                index={i}
                evaluation={ev}
                suggestions={suggestions}
                onChange={(next) => update({ evaluations: data.evaluations.map((x, j) => (j === i ? next : x)) })}
                onRemove={() => update({ evaluations: data.evaluations.filter((_, j) => j !== i) })}
                onMove={(dir) => {
                  const list = [...data.evaluations];
                  const k = i + dir;
                  if (k < 0 || k >= list.length) return;
                  [list[i], list[k]] = [list[k], list[i]];
                  update({ evaluations: list });
                }}
              />
            ))}
          </div>
        )}
      </Card>

      <Card title={t("kpi.edit.plan")}>
        <ListEditor<string>
          items={c.plan}
          onChange={(plan) => setContent({ plan })}
          create={() => ""}
          addLabel={t("kpi.edit.addPlan")}
          render={(p, set) => <textarea value={p} onChange={(e) => set(e.target.value)} rows={2} dir="auto" className={cx(small, "flex-1 resize-y")} />}
        />
      </Card>

      <Card title={t("kpi.edit.signatories")}>
        <ListEditor<Signatory>
          items={c.signatories}
          onChange={(signatories) => setContent({ signatories })}
          create={() => ({ title: "", name: "" })}
          addLabel={t("kpi.edit.addSignatory")}
          render={(s, set) => (
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
              <input value={s.title} onChange={(e) => set({ ...s, title: e.target.value })} placeholder={t("kpi.edit.signatoryTitle")} dir="auto" className={small} />
              <input value={s.name} onChange={(e) => set({ ...s, name: e.target.value })} placeholder={t("kpi.edit.signatoryName")} dir="auto" className={small} />
            </div>
          )}
        />
      </Card>

      <SaveBar dirty={dirty} onSaved={() => setDirty(false)} />
    </ActionForm>
  );
}

/* ---- building blocks --------------------------------------------------- */

function RowButtons({ onUp, onDown, onRemove }: { onUp?: () => void; onDown?: () => void; onRemove: () => void }) {
  const t = useT();
  return (
    <div className="flex shrink-0 gap-1">
      {onUp && <button type="button" onClick={onUp} title={t("common.moveUp")} className={buttonClass.icon}><Icon name="up" className="h-4 w-4" /></button>}
      {onDown && <button type="button" onClick={onDown} title={t("common.moveDown")} className={buttonClass.icon}><Icon name="down" className="h-4 w-4" /></button>}
      <button type="button" onClick={onRemove} title={t("common.remove")} className={cx(buttonClass.icon, "hover:border-rose-400 hover:text-rose-300")}><Icon name="close" className="h-4 w-4" /></button>
    </div>
  );
}

function ListEditor<T>({
  items, onChange, create, addLabel, render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  addLabel: string;
  render: (item: T, set: (item: T) => void) => ReactNode;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const k = i + dir;
    if (k < 0 || k >= items.length) return;
    const list = [...items];
    [list[i], list[k]] = [list[k], list[i]];
    onChange(list);
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2 w-5 shrink-0 text-center font-exo text-[12px] text-white/40">{i + 1}</span>
          {render(item, (next) => onChange(items.map((x, j) => (j === i ? next : x))))}
          <RowButtons onUp={() => move(i, -1)} onDown={() => move(i, 1)} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, create()])} className={buttonClass.small}>
        <Icon name="plus" className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}

function IndicatorsEditor({ value, onChange }: { value: ReportContent["indicators"]; onChange: (v: ReportContent["indicators"]) => void }) {
  const t = useT();
  const { columns, rows } = value;
  const setColumn = (i: number, text: string) => onChange({ columns: columns.map((c, j) => (j === i ? text : c)), rows });
  const setCell = (r: number, c: number, text: string) =>
    onChange({ columns, rows: rows.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? text : cell)) : row)) });
  const addColumn = () => columns.length < 8 && onChange({ columns: [...columns, ""], rows: rows.map((r) => [...r, ""]) });
  const removeColumn = () => columns.length > 2 && onChange({ columns: columns.slice(0, -1), rows: rows.map((r) => r.slice(0, -1)) });
  const move = (i: number, dir: -1 | 1) => {
    const k = i + dir;
    if (k < 0 || k >= rows.length) return;
    const list = [...rows];
    [list[i], list[k]] = [list[k], list[i]];
    onChange({ columns, rows: list });
  };
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-6" />
              {columns.map((col, i) => (
                <th key={i}>
                  <input value={col} onChange={(e) => setColumn(i, e.target.value)} dir="auto" className={cx(small, "font-bold text-teal-cyan")} />
                </th>
              ))}
              <th className="w-[108px]" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                <td className="text-center font-exo text-[12px] text-white/40">{r + 1}</td>
                {row.map((cell, c) => (
                  <td key={c} className="align-top">
                    <textarea value={cell} onChange={(e) => setCell(r, c, e.target.value)} rows={2} dir="auto" className={cx(small, "resize-y")} />
                  </td>
                ))}
                <td className="align-top">
                  <RowButtons onUp={() => move(r, -1)} onDown={() => move(r, 1)} onRemove={() => onChange({ columns, rows: rows.filter((_, i) => i !== r) })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onChange({ columns, rows: [...rows, columns.map(() => "")] })} className={buttonClass.small}>
          <Icon name="plus" className="h-4 w-4" />
          {t("kpi.edit.addRow")}
        </button>
        <button type="button" onClick={addColumn} disabled={columns.length >= 8} className={buttonClass.small}>{t("kpi.edit.addColumn")}</button>
        <button type="button" onClick={removeColumn} disabled={columns.length <= 2} className={buttonClass.small}>{t("kpi.edit.removeColumn")}</button>
      </div>
    </div>
  );
}

function KpiRowsEditor({ kpis, suggestions, onChange }: { kpis: KpiRow[]; suggestions: string[]; onChange: (kpis: KpiRow[]) => void }) {
  const t = useT();
  const lang = useAdminLang();
  const unused = suggestions.filter((s) => !kpis.some((k) => k.indicator === s));
  const score = weightedScore(kpis);
  const weight = totalWeight(kpis);
  const r = rating(score);
  const set = (i: number, patch: Partial<KpiRow>) => onChange(kpis.map((k, j) => (j === i ? { ...k, ...patch } : k)));
  return (
    <div className="space-y-3">
      {kpis.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-1">
            <thead className="text-[12px] text-white/55">
              <tr>
                <th className="text-start font-bold">{t("kpi.edit.indicator")}</th>
                <th className="w-[92px] text-start font-bold">{t("kpi.edit.weight")}</th>
                <th className="w-[100px] text-start font-bold">{t("kpi.edit.scoreOf10")}</th>
                <th className="text-start font-bold">{t("kpi.edit.note")}</th>
                <th className="w-[108px]" />
              </tr>
            </thead>
            <tbody>
              {kpis.map((k, i) => (
                <tr key={i}>
                  <td className="align-top"><textarea value={k.indicator} onChange={(e) => set(i, { indicator: e.target.value })} rows={2} dir="auto" className={cx(small, "resize-y")} /></td>
                  <td className="align-top">
                    <input type="number" min={0} max={100} step={1} value={k.weight} onChange={(e) => set(i, { weight: Number(e.target.value) })} dir="ltr" className={cx(small, "text-left font-exo")} />
                  </td>
                  <td className="align-top">
                    <input
                      type="number" min={0} max={10} step={0.1} value={k.score ?? ""}
                      onChange={(e) => set(i, { score: e.target.value === "" ? null : Math.min(10, Math.max(0, Number(e.target.value))) })}
                      dir="ltr" className={cx(small, "text-left font-exo font-bold")}
                    />
                  </td>
                  <td className="align-top"><textarea value={k.note} onChange={(e) => set(i, { note: e.target.value })} rows={2} dir="auto" className={cx(small, "resize-y")} /></td>
                  <td className="align-top">
                    <RowButtons
                      onUp={() => { if (i > 0) { const l = [...kpis]; [l[i - 1], l[i]] = [l[i], l[i - 1]]; onChange(l); } }}
                      onDown={() => { if (i < kpis.length - 1) { const l = [...kpis]; [l[i + 1], l[i]] = [l[i], l[i + 1]]; onChange(l); } }}
                      onRemove={() => onChange(kpis.filter((_, j) => j !== i))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => onChange([...kpis, emptyKpi()])} className={buttonClass.small}>
          <Icon name="plus" className="h-4 w-4" />
          {t("kpi.edit.addKpi")}
        </button>
        {unused.length > 0 && (
          <select
            value=""
            onChange={(e) => e.target.value && onChange([...kpis, { ...emptyKpi(), indicator: e.target.value }])}
            className={cx(small, "w-auto max-w-[360px]")}
          >
            <option value="">{t("kpi.edit.addFromPrevious")}…</option>
            {unused.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {kpis.length > 0 && (
          <>
            <span className={cx("text-[13px] font-bold", weight === 100 ? "text-teal" : "text-amber-300")}>
              {t("kpi.edit.totalWeight")}: <span className="font-exo">{weight}%</span>
            </span>
            <span className="text-[13px] font-bold text-white">
              {t("kpi.edit.weighted")}: <span className="font-exo text-teal-cyan" dir="ltr">{formatScore(score)}</span>
            </span>
            {r && <Badge tone={RATING_TONE[r]}>{RATING_LABELS[r][lang]}</Badge>}
          </>
        )}
      </div>
    </div>
  );
}

function EvaluationEditor({
  index, evaluation, suggestions, onChange, onRemove, onMove,
}: {
  index: number;
  evaluation: Evaluation;
  suggestions: string[];
  onChange: (e: Evaluation) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const t = useT();
  const lang = useAdminLang();
  const score = weightedScore(evaluation.kpis);
  const r = rating(score);
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal font-exo text-[13px] font-bold text-navy">{index + 1}</span>
          <div>
            <p className="text-[15px] font-bold text-white">{evaluation.name}</p>
            <input
              value={evaluation.title}
              onChange={(e) => onChange({ ...evaluation, title: e.target.value })}
              placeholder={t("kpi.team.employeeTitle")}
              dir="auto"
              className="mt-0.5 w-full min-w-[260px] rounded-md border border-transparent bg-transparent px-1 text-[13px] text-steel outline-none hover:border-white/15 focus:border-teal"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-exo text-[15px] font-bold text-teal-cyan" dir="ltr">{formatScore(score)}</span>
          {r && <Badge tone={RATING_TONE[r]}>{RATING_LABELS[r][lang]}</Badge>}
          <RowButtons onUp={() => onMove(-1)} onDown={() => onMove(1)} onRemove={onRemove} />
        </div>
      </div>

      <p className="mb-2 text-[13px] font-bold text-iceblue">{t("kpi.edit.highlights")}</p>
      <ListEditor<string>
        items={evaluation.highlights}
        onChange={(highlights) => onChange({ ...evaluation, highlights })}
        create={() => ""}
        addLabel={t("kpi.edit.addHighlight")}
        render={(h, set) => <textarea value={h} onChange={(e) => set(e.target.value)} rows={2} dir="auto" className={cx(small, "flex-1 resize-y")} />}
      />

      <p className="mb-2 mt-5 text-[13px] font-bold text-iceblue">{t("kpi.edit.kpis")}</p>
      <KpiRowsEditor kpis={evaluation.kpis} suggestions={suggestions} onChange={(kpis) => onChange({ ...evaluation, kpis, score: weightedScore(kpis) })} />
    </section>
  );
}
