import { notFound } from "next/navigation";
import { ActionForm, CopyButton, SubmitButton } from "@/components/admin/forms";
import { Icon } from "@/components/admin/icons";
import { QUOTATION_TONE, quotationStatusKey } from "@/components/admin/status";
import { Badge, buttonClass, Card, cx, Field, inputClass, PageHeader } from "@/components/admin/ui";
import { formatDate } from "@/lib/admin/format";
import { lookup, quotationSections } from "@/lib/quotation";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { can, requirePermission } from "@/server/auth";
import { getMessagesFor } from "@/server/content";
import { getQuotation, QUOTATION_STATUSES } from "@/server/quotations";
import { deleteQuotationAction, updateQuotationAction } from "../../../_actions/sales";

export const metadata = { title: "Quotation brief" };

export default async function QuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("quotations.view");
  const id = Number((await params).id);
  const q = Number.isInteger(id) ? getQuotation(id) : null;
  if (!q) notFound();
  const t = await getAdminT();
  const lang = await getAdminLang();
  const canManage = can(user, "quotations.manage");
  // the form's own wording (editable under Texts › Sales), so labels match the PDF
  const site = lookup(getMessagesFor(lang).Quotation);
  const sections = quotationSections(q, site, lang);
  const pdfHref = `${lang === "en" ? "/en" : ""}/quotation-request/${q.token}`;

  return (
    <>
      <PageHeader
        title={q.clientName}
        subtitle={[q.reference, q.salesPerson].filter(Boolean).join(" · ")}
        back={{ href: "/admin/quotations", label: t("nav.quotations") }}
        actions={
          <>
            <Badge tone={QUOTATION_TONE[q.status]}>{t(quotationStatusKey(q.status))}</Badge>
            <a href={pdfHref} target="_blank" rel="noopener noreferrer" className={buttonClass.primary}>
              <Icon name="download" className="h-4 w-4" />
              {t("quotes.openPdf")}
            </a>
            <CopyButton text={pdfHref} className={buttonClass.secondary} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {sections.map((section, i) => (
            <Card
              key={section.title}
              title={
                <span className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal font-exo text-[12px] font-bold text-navy">{i + 1}</span>
                  {section.title}
                </span>
              }
            >
              <dl className="divide-y divide-white/10">
                {section.rows.map((row) => (
                  <div key={row.label} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[220px_1fr]">
                    <dt className="text-[13px] font-bold text-white/55">{row.label}</dt>
                    <dd
                      dir={row.ltr && row.value !== "—" ? "ltr" : undefined}
                      className={cx("text-[14.5px] text-white", row.ltr && "text-start font-exo", row.multiline && "whitespace-pre-line leading-relaxed")}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          ))}
          <p className="text-[12.5px] text-steel">
            {t("quotes.submitted")}: {formatDate(q.createdAt, lang)} · {t("quotes.language")}: {q.locale === "en" ? "English" : "العربية"}
          </p>
        </div>

        {canManage && (
          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <Card title={t("quotes.update")}>
              <ActionForm action={updateQuotationAction.bind(null, q.id)} className="space-y-4">
                <Field label={t("common.status")} htmlFor="status">
                  <select id="status" name="status" defaultValue={q.status} className={inputClass}>
                    {QUOTATION_STATUSES.map((s) => (
                      <option key={s} value={s}>{t(quotationStatusKey(s))}</option>
                    ))}
                  </select>
                </Field>
                <Field label={t("quotes.notes")} hint={t("quotes.notesHint")} htmlFor="notes">
                  <textarea id="notes" name="notes" rows={6} defaultValue={q.adminNotes} className={cx(inputClass, "resize-y leading-relaxed")} />
                </Field>
                <SubmitButton pendingLabel="common.saving">{t("common.save")}</SubmitButton>
              </ActionForm>
            </Card>
            <ActionForm action={deleteQuotationAction} notice="top">
              <input type="hidden" name="id" value={q.id} />
              <SubmitButton variant="danger" confirm="common.confirmDelete">
                <Icon name="trash" className="h-4 w-4" />
                {t("common.delete")}
              </SubmitButton>
            </ActionForm>
          </div>
        )}
      </div>
    </>
  );
}
