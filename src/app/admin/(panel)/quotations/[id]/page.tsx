import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, CopyButton, FieldError, SubmitButton } from "@/components/admin/forms";
import { Icon } from "@/components/admin/icons";
import { OfferLinks } from "@/components/admin/OfferLinks";
import { QUOTATION_TONE, quotationStatusKey } from "@/components/admin/status";
import { Badge, buttonClass, Card, cx, Field, inputClass, PageHeader } from "@/components/admin/ui";
import { formatDate } from "@/lib/admin/format";
import { formatBytes, lookup, quotationSections } from "@/lib/quotation";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { can, requirePermission } from "@/server/auth";
import { getMessagesFor } from "@/server/content";
import { getQuotation, listQuotationReplies, QUOTATION_STATUSES, quotationOffer } from "@/server/quotations";
import { deleteQuotationAction, replyQuotationAction, updateQuotationAction } from "../../../_actions/sales";

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
  const { offer, savedAt } = quotationOffer(q);
  const replies = listQuotationReplies(q.id);
  // the email's opening wording (editable under Texts › Sales), in the brief's language
  const mail = lookup(getMessagesFor(q.locale === "en" ? "en" : "ar").Quotation);
  const fill = (text: string) =>
    text.replaceAll("{title}", offer.title).replaceAll("{recipient}", offer.recipient).replaceAll("{client}", q.clientName);

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
            {canManage && (
              <a href="#reply" className={buttonClass.secondary}>
                <Icon name="send" className="h-4 w-4 rtl:-scale-x-100" />
                {t("quotes.replyNew")}
              </a>
            )}
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
          <Card title={t("quotes.attachments")}>
            {q.attachments.length === 0 ? (
              <p className="text-[13.5px] text-steel">{t("quotes.noAttachments")}</p>
            ) : (
              <ul className="divide-y divide-white/10">
                {q.attachments.map((f) => (
                  <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="inline-flex min-w-0 items-center gap-2 text-[14px] text-white">
                      <Icon name="file" className="h-5 w-5 shrink-0 text-teal" />
                      <bdi className="truncate">{f.name}</bdi>
                      <span className="shrink-0 font-exo text-[12.5px] text-steel">{formatBytes(f.size)}</span>
                    </span>
                    <a href={`/quotation-files/${q.token}/${f.id}`} target="_blank" rel="noopener noreferrer" className={buttonClass.small}>
                      <Icon name="download" className="h-4 w-4" />
                      {t("common.download")}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <div id="reply" className="scroll-mt-6">
            <Card title={t("quotes.replies")} description={t("quotes.repliesHint")}>
              {replies.length === 0 ? (
                <p className="text-[13.5px] text-steel">{t("quotes.noReplies")}</p>
              ) : (
                <ul className="space-y-3">
                  {replies.map((r) => (
                    <li key={r.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <p className="text-[14.5px] font-bold text-white"><bdi>{r.subject}</bdi></p>
                        <p className="text-[12.5px] text-steel">
                          {formatDate(r.sentAt, lang)} · {t("quotes.sentBy", { name: r.sentBy })}
                        </p>
                      </div>
                      <p className="mt-1 text-[13px] text-white/70">
                        {t("quotes.replyTo")}: <bdi dir="ltr" className="font-exo">{r.to}</bdi>
                        {r.cc && <> · {t("quotes.replyCc")}: <bdi dir="ltr" className="font-exo">{r.cc}</bdi></>}
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {r.files.map((f) => (
                          <li key={f.id}>
                            <a href={`/admin/quotation-replies/${f.id}`} target="_blank" rel="noopener noreferrer" className={buttonClass.small}>
                              <Icon name="file" className="h-4 w-4" />
                              <bdi className="max-w-[260px] truncate">{f.name}</bdi>
                              <span dir="ltr" className="font-exo text-steel">{formatBytes(f.size)}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                      {r.message && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-[12.5px] font-bold text-teal">{t("quotes.replyShowMessage")}</summary>
                          <p dir="auto" className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-white/85">{r.message}</p>
                        </details>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {canManage && (
                <ActionForm
                  action={replyQuotationAction.bind(null, q.id)}
                  resetOnSuccess
                  className="mt-6 space-y-4 border-t border-white/10 pt-6"
                >
                  <div>
                    <h3 className="text-[15px] font-bold text-white">{t("quotes.replyNew")}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-steel">{t("quotes.replyHint")}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field
                      label={t("quotes.replyTo")}
                      hint={q.clientEmail ? t("quotes.replyAddressesHint") : t("quotes.replyNoEmail")}
                      htmlFor="reply-to"
                    >
                      <input id="reply-to" name="to" dir="ltr" inputMode="email" autoComplete="off" defaultValue={q.clientEmail} className={inputClass} />
                      <FieldError name="to" />
                    </Field>
                    <Field
                      label={<>{t("quotes.replyCc")} <span className="font-normal text-white/40">({t("common.optional")})</span></>}
                      hint={t("quotes.replyAddressesHint")}
                      htmlFor="reply-cc"
                    >
                      <input id="reply-cc" name="cc" dir="ltr" inputMode="email" autoComplete="off" className={inputClass} />
                      <FieldError name="cc" />
                    </Field>
                  </div>
                  <Field label={t("quotes.replySubject")} htmlFor="reply-subject">
                    <input id="reply-subject" name="subject" dir="auto" defaultValue={fill(mail("replySubject"))} className={inputClass} />
                    <FieldError name="subject" />
                  </Field>
                  <Field label={t("quotes.replyMessage")} htmlFor="reply-message">
                    <textarea
                      id="reply-message"
                      name="message"
                      dir="auto"
                      rows={12}
                      defaultValue={fill(mail("replyMessage"))}
                      className={cx(inputClass, "resize-y leading-relaxed")}
                    />
                    <FieldError name="message" />
                  </Field>
                  <Field label={t("quotes.replyFiles")} hint={t("quotes.replyFilesHint")} htmlFor="reply-files">
                    <input
                      id="reply-files"
                      name="files"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.zip"
                      className={cx(inputClass, "file:me-3 file:rounded-lg file:border-0 file:bg-teal file:px-3 file:py-1.5 file:font-bold file:text-navy")}
                    />
                    <FieldError name="files" />
                  </Field>
                  <SubmitButton pendingLabel="quotes.replySending" confirm="quotes.replyConfirm">
                    <Icon name="send" className="h-4 w-4 rtl:-scale-x-100" />
                    {t("quotes.replySend")}
                  </SubmitButton>
                </ActionForm>
              )}
            </Card>
          </div>

          <p className="text-[12.5px] text-steel">
            {t("quotes.submitted")}: {formatDate(q.createdAt, lang)} · {t("quotes.language")}: {q.locale === "en" ? "English" : "العربية"}
          </p>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card title={t("offer.title")} description={t("offer.cardHint")}>
            <p className="mb-4 text-[12.5px] text-white/55">
              {savedAt ? t("offer.savedAt", { date: formatDate(savedAt, lang) }) : t("offer.notSaved")}
            </p>
            <div className="flex flex-wrap gap-2">
              {canManage && (
                <Link href={`/admin/quotations/${q.id}/offer`} className={buttonClass.primary}>
                  <Icon name={savedAt ? "edit" : "plus"} className="h-4 w-4" />
                  {t(savedAt ? "offer.edit" : "offer.create")}
                </Link>
              )}
              <OfferLinks id={q.id} t={t} />
            </div>
          </Card>

          {canManage && (
            <>
            <Card title={t("quotes.update")}>
              {/* sending a quotation moves the status on: start the form from it */}
              <ActionForm key={replies[0]?.id ?? 0} action={updateQuotationAction.bind(null, q.id)} className="space-y-4">
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
