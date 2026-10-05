import { formatDay, quotationSections, type QuotationRecord } from "@/lib/quotation";

/* The brief laid out as an A4 document: what "Download PDF" prints. */
export default function QuotationSheet({
  q,
  t,
  locale,
}: {
  q: QuotationRecord;
  t: (key: string) => string;
  locale: string;
}) {
  const sections = quotationSections(q, t, locale);
  const submitted = q.createdAt.slice(0, 10);

  return (
    <article className="print-sheet mx-auto w-full max-w-[210mm] bg-white text-[#0b2a3f] shadow-[0_20px_60px_rgba(0,0,0,.35)] print:max-w-none print:shadow-none">
      <header className="flex items-center justify-between gap-6 bg-navy px-8 py-6 text-white print:px-6">
        <div>
          <h1 className="text-[22px] font-bold leading-tight">{t("title")}</h1>
          <p className="mt-1 font-exo text-[12.5px] text-iceblue">{t("subtitle")}</p>
          <p className="mt-3 text-[12px] text-white/75">{t("print.company")}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo.png" alt="Takamol Advanced" className="h-12 w-auto shrink-0" />
      </header>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 border-b border-[#d7e3ea] bg-[#eef5f8] px-8 py-3 text-[12.5px] sm:grid-cols-4 print:px-6">
        <Meta label={t("reference")} value={q.reference || "—"} ltr />
        <Meta label={t("requestDate")} value={q.requestDate ? formatDay(q.requestDate, locale) : "—"} />
        <Meta label={t("salesPerson")} value={q.salesPerson} />
        <Meta label={t("print.submittedAt")} value={formatDay(submitted, locale)} />
      </div>

      <div className="space-y-6 px-8 py-6 print:px-6">
        {sections.map((section, i) => (
          <section key={section.title} className="break-inside-avoid">
            <h2 className="mb-2 flex items-center gap-2.5 text-[14.5px] font-bold text-navy">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal font-exo text-[12px] text-white">{i + 1}</span>
              {section.title}
            </h2>
            <table className="w-full border-collapse text-[13px]">
              <tbody>
                {section.rows.map((row) => (
                  <tr key={row.label} className="border border-[#d7e3ea]">
                    <th scope="row" className="w-[36%] bg-[#f5f9fb] px-3 py-2 text-start align-top font-bold text-[#345468]">{row.label}</th>
                    <td
                      dir={row.ltr && row.value !== "—" ? "ltr" : undefined}
                      className={`px-3 py-2 align-top text-start ${row.multiline ? "whitespace-pre-line leading-relaxed" : ""} ${row.ltr ? "font-exo" : ""}`}
                    >
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}

        {q.attachments.length > 0 && (
          <section className="print:hidden">
            <h2 className="mb-2 text-[14.5px] font-bold text-navy">{t("attachments")}</h2>
            <ul className="divide-y divide-[#d7e3ea] rounded-lg border border-[#d7e3ea] text-[13px]">
              {q.attachments.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <bdi className="min-w-0 truncate">{f.name}</bdi>
                  <a href={`/quotation-files/${q.token}/${f.id}`} target="_blank" rel="noopener noreferrer" className="shrink-0 font-bold text-teal hover:underline">
                    {t("print.download")}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-[11px] text-[#5c7a8c]">{t("print.attachmentsNote")}</p>
          </section>
        )}

        <div className="grid grid-cols-2 gap-6 break-inside-avoid pt-4">
          {[t("print.signature"), t("print.approval")].map((label) => (
            <div key={label} className="rounded-lg border border-dashed border-[#b9ccd8] px-4 pb-10 pt-3 text-[12.5px] font-bold text-[#345468]">
              {label}
            </div>
          ))}
        </div>
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-[#d7e3ea] px-8 py-3 text-[11px] text-[#5c7a8c] print:px-6">
        <span>{t("print.confidential")}</span>
        <span className="font-exo">takamoladvanced.sa</span>
      </footer>
    </article>
  );
}

function Meta({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div>
      <span className="block text-[11px] text-[#5c7a8c]">{label}</span>
      <span dir={ltr && value !== "—" ? "ltr" : undefined} className={`block text-start font-bold ${ltr ? "font-exo" : ""}`}>{value}</span>
    </div>
  );
}
