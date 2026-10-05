import type { ReactNode } from "react";
import { formatPeriod, formatScore, rating, RATING_LABELS, totalWeight, weightedScore, type KpiReport, type KpiRow } from "@/lib/kpi";

/* The monthly report laid out as an A4 document, in the style of the
   department reports it was modelled on. Report content is written in
   Arabic, so the sheet is Arabic too. */

const ORDINALS = ["أولًا", "ثانيًا", "ثالثًا", "رابعًا", "خامسًا", "سادسًا", "سابعًا", "ثامنًا"];

const th = "border border-[#cfdde8] bg-[#e8f1fa] px-3 py-2 text-start text-[12px] font-bold text-[#1f5fa8]";
const td = "border border-[#cfdde8] px-3 py-2 align-top text-[12.5px] leading-relaxed text-[#0b2a3f]";

export default function KpiReportSheet({ report }: { report: KpiReport }) {
  const c = report.content;
  const period = formatPeriod(report.period, "ar");
  let n = 0;
  const section = (title: string, children: ReactNode) => (
    <section key={title} className="mt-7 break-inside-avoid-page">
      <h2 className="mb-3 border-b border-[#cfdde8] pb-1.5 text-[15px] font-bold text-[#1f5fa8]">
        {ORDINALS[n++] ?? ""}: {title}
      </h2>
      {children}
    </section>
  );
  const teamScore = weightedScore(c.teamKpis);

  return (
    <article dir="rtl" className="print-sheet mx-auto w-full max-w-[210mm] bg-white px-10 py-9 text-[#0b2a3f] shadow-[0_20px_60px_rgba(0,0,0,.35)] print:max-w-none print:px-0 print:py-0 print:shadow-none">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[20px] font-bold leading-snug text-[#0b2a3f]">{report.title} — {period}</h1>
          <p className="mt-1 text-[12.5px] text-[#5c7a8c]">{report.department}</p>
        </div>
        <div className="shrink-0 rounded-lg bg-navy px-3 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="Takamol Advanced" className="h-9 w-auto" />
        </div>
      </header>

      <div className="mt-5 rounded-lg border border-[#cfdde8] bg-[#f6f9fc] px-4 py-3 text-[12.5px] leading-relaxed">
        <p className="mb-1 font-bold">بيانات التقرير:</p>
        <ul className="space-y-0.5">
          {c.meta.addressedTo && <li>• <b>الجهة الموجه إليها:</b> {c.meta.addressedTo}</li>}
          {c.meta.supervisedBy && <li>• <b>إشراف ومتابعة:</b> {c.meta.supervisedBy}</li>}
          {c.meta.preparedBy && <li>• <b>إعداد:</b> {c.meta.preparedBy}</li>}
          <li>• <b>القسم المعني:</b> {report.department}</li>
          <li>• <b>الفترة المغطاة:</b> {period}</li>
          {c.meta.generalStatus && <li>• <b>الحالة العامة:</b> {c.meta.generalStatus}</li>}
        </ul>
      </div>

      {(c.summary || c.achievements.length > 0) &&
        section("الملخص التنفيذي وأبرز الإنجازات", (
          <>
            {c.summary && <p className="whitespace-pre-line text-[13px] leading-[1.9]">{c.summary}</p>}
            {c.achievements.length > 0 && (
              <ul className="mt-3 space-y-2 ps-5 text-[13px] leading-[1.85]">
                {c.achievements.map((a, i) => (
                  <li key={i} className="list-disc">
                    {a.title && <b>{a.title}: </b>}
                    {a.text}
                  </li>
                ))}
              </ul>
            )}
          </>
        ))}

      {c.indicators.rows.length > 0 &&
        section("لوحة المؤشرات والإنجازات التشغيلية", (
          <table className="w-full border-collapse">
            <thead>
              <tr>{c.indicators.columns.map((col, i) => <th key={i} className={th}>{col}</th>)}</tr>
            </thead>
            <tbody>
              {c.indicators.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => <td key={j} className={`${td} ${j === 0 ? "font-bold" : ""}`}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        ))}

      {c.teamKpis.length > 0 &&
        section("بطاقة تقييم مؤشرات الأداء (KPIs) للقسم", (
          <>
            <KpiTable kpis={c.teamKpis} />
            <ScoreLine label="التقييم الإجمالي للقسم" score={teamScore} />
          </>
        ))}

      {report.evaluations.length > 0 &&
        section("تقارير الأداء الفردية وبطاقات KPIs", (
          <div className="space-y-6">
            {report.evaluations.map((e, i) => (
              <div key={e.employeeId} className="break-inside-avoid">
                <h3 className="text-[14px] font-bold">[{i + 1}] {e.name}{e.title ? ` — ${e.title}` : ""}</h3>
                <ScoreLine label="التقييم العام للشهر" score={e.score} />
                {e.highlights.length > 0 && (
                  <>
                    <p className="mt-2 text-[13px] font-bold">أبرز المهام والإنجازات المكتملة:</p>
                    <ul className="mb-2 space-y-1 ps-5 text-[13px] leading-[1.85]">
                      {e.highlights.map((h, j) => <li key={j} className="list-disc">{h}</li>)}
                    </ul>
                  </>
                )}
                <KpiTable kpis={e.kpis} />
              </div>
            ))}
          </div>
        ))}

      {report.evaluations.length > 1 &&
        section("جدول الملخص التراكمي لتقييمات الفريق", (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={`${th} w-8`}>#</th>
                <th className={th}>الاسم</th>
                <th className={th}>الدور الوظيفي</th>
                <th className={th}>التقييم (من 10)</th>
                <th className={th}>التقدير العام</th>
              </tr>
            </thead>
            <tbody>
              {report.evaluations.map((e, i) => {
                const r = rating(e.score);
                return (
                  <tr key={e.employeeId}>
                    <td className={`${td} font-exo`}>{i + 1}</td>
                    <td className={`${td} font-bold`}>{e.name}</td>
                    <td className={td}>{e.title}</td>
                    <td className={`${td} font-exo font-bold`} dir="ltr">{e.score === null ? "—" : e.score}</td>
                    <td className={td}>{r ? <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[12px] font-bold text-emerald-800">{RATING_LABELS[r].ar}</span> : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ))}

      {c.plan.length > 0 &&
        section("خطة ومستهدفات الشهر القادم", (
          <ol className="space-y-1.5 ps-5 text-[13px] leading-[1.85]">
            {c.plan.map((p, i) => <li key={i} className="list-decimal">{p}</li>)}
          </ol>
        ))}

      {c.signatories.length > 0 && (
        <footer className="mt-12 grid break-inside-avoid grid-cols-3 gap-6 text-center text-[12.5px]">
          {c.signatories.map((s, i) => (
            <div key={i}>
              <p className="leading-snug text-[#345468]">{s.title}</p>
              <p className="mt-6 font-bold">{s.name}</p>
            </div>
          ))}
        </footer>
      )}
    </article>
  );
}

function KpiTable({ kpis }: { kpis: KpiRow[] }) {
  if (!kpis.length) return null;
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className={th}>مؤشر الأداء (KPI)</th>
          <th className={`${th} w-[90px]`}>الوزن النسبي</th>
          <th className={`${th} w-[90px]`}>التقييم الفعلي</th>
          <th className={th}>ملاحظات الأداء</th>
        </tr>
      </thead>
      <tbody>
        {kpis.map((k, i) => (
          <tr key={i}>
            <td className={`${td} font-bold`}>{k.indicator}</td>
            <td className={`${td} font-exo`} dir="ltr">{k.weight}%</td>
            <td className={`${td} font-exo font-bold`} dir="ltr">{k.score === null ? "—" : `${k.score} / 10`}</td>
            <td className={td}>{k.note}</td>
          </tr>
        ))}
        {totalWeight(kpis) !== 100 && totalWeight(kpis) > 0 && (
          <tr>
            <td className={`${td} text-[11.5px] text-[#5c7a8c]`} colSpan={4}>مجموع الأوزان: {totalWeight(kpis)}%</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function ScoreLine({ label, score }: { label: string; score: number | null }) {
  const r = rating(score);
  return (
    <p className="my-2 text-[13px]">
      <b>{label}: </b>
      <span className="font-exo font-bold" dir="ltr">{formatScore(score)}</span>
      {r && (
        <>
          {" — "}
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[12px] font-bold text-emerald-800">{RATING_LABELS[r].ar} ({RATING_LABELS[r].en})</span>
        </>
      )}
    </p>
  );
}
