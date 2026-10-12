import { createHash } from "node:crypto";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ActionForm, FieldError, SubmitButton } from "@/components/admin/forms";
import { Icon } from "@/components/admin/icons";
import { OfferItemsEditor } from "@/components/admin/OfferItemsEditor";
import { OfferLinks } from "@/components/admin/OfferLinks";
import { buttonClass, Card, cx, Field, inputClass, PageHeader } from "@/components/admin/ui";
import { formatDate } from "@/lib/admin/format";
import type { AdminKey } from "@/lib/admin/i18n";
import { OFFER_LIMITS, type OfferLabels } from "@/lib/quotation-offer";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { getQuotation, quotationOffer } from "@/server/quotations";
import { saveOfferAction } from "../../../../_actions/sales";

export const metadata = { title: "Quotation" };

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("quotations.manage");
  const id = Number((await params).id);
  const q = Number.isInteger(id) ? getQuotation(id) : null;
  if (!q) notFound();
  const t = await getAdminT();
  const lang = await getAdminLang();
  const { offer, savedAt } = quotationOffer(q);
  // the price rows hold their own state: start them afresh when the stored rows change
  const itemsVersion = createHash("sha1").update(JSON.stringify(offer.items)).digest("hex").slice(0, 10);
  const textarea = cx(inputClass, "resize-y leading-relaxed");
  const linesHint = `${t("offer.linesHint")} ${t("offer.boldHint")}`;
  const paragraphsHint = `${t("offer.paragraphsHint")} ${t("offer.boldHint")}`;
  // the bank table: its rows, then a couple of empty ones to add more
  const bankRows = [...offer.bank, ...Array.from({ length: Math.max(2, 7 - offer.bank.length) }, () => ({ label: "", value: "", accent: false }))]
    .slice(0, OFFER_LIMITS.bank);

  const text = (name: string, label: ReactNode, value: string, opts: { ltr?: boolean; hint?: string } = {}) => (
    <Field label={label} hint={opts.hint} htmlFor={name}>
      <input id={name} name={name} dir={opts.ltr ? "ltr" : "rtl"} defaultValue={value} className={cx(inputClass, opts.ltr && "font-exo")} />
      <FieldError name={name} />
    </Field>
  );
  const list = (name: string, label: ReactNode, value: string[], rows: number, hint = linesHint) => (
    <Field label={label} hint={hint} htmlFor={name}>
      <textarea id={name} name={name} dir="rtl" rows={rows} defaultValue={value.join("\n")} className={textarea} />
    </Field>
  );
  const heading = (key: keyof OfferLabels, label: AdminKey = "offer.heading") => text(`labels.${key}`, t(label), offer.labels[key]);

  return (
    <>
      <PageHeader
        title={t("offer.title")}
        subtitle={t("offer.subtitle")}
        back={{ href: `/admin/quotations/${q.id}`, label: q.clientName }}
        actions={<OfferLinks id={q.id} t={t} />}
      />

      {/* after saving (or drafting again) the fields reset to what is now stored */}
      <ActionForm id="offer-form" action={saveOfferAction.bind(null, q.id)} resetOnSuccess notice="bottom" className="space-y-6">
        <Card title={t("offer.sectionHeader")} description={savedAt ? t("offer.savedAt", { date: formatDate(savedAt, lang) }) : t("offer.notSaved")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {text("number", t("offer.number"), offer.number, { ltr: true })}
            <Field label={t("offer.date")} htmlFor="date">
              <input id="date" name="date" type="date" defaultValue={offer.date} className={inputClass} />
              <FieldError name="date" />
            </Field>
            <Field label={t("offer.validUntil")} htmlFor="validUntil">
              <input id="validUntil" name="validUntil" type="date" defaultValue={offer.validUntil} className={inputClass} />
              <FieldError name="validUntil" />
            </Field>
          </div>
          <div className="mt-4">{text("title", t("offer.docTitle"), offer.title)}</div>
          <details className="mt-4">
            <summary className="cursor-pointer text-[13px] font-bold text-teal">{t("offer.labels")}</summary>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {text("labels.number", t("offer.labelNumber"), offer.labels.number, { ltr: true })}
              {text("labels.date", t("offer.labelDate"), offer.labels.date, { ltr: true })}
              {text("labels.valid", t("offer.labelValid"), offer.labels.valid, { ltr: true })}
            </div>
          </details>
        </Card>

        <Card title={t("offer.sectionCompany")}>
          <div className="space-y-4">
            {heading("from")}
            {text("companyName", t("offer.companyName"), offer.company.name)}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {text("companyRegistry", t("offer.registry"), offer.company.registry)}
              {text("companyLicense", t("offer.license"), offer.company.license)}
            </div>
            {list("companyAddress", t("offer.address"), offer.company.address, 2, t("offer.linesHint"))}
          </div>
        </Card>

        <Card title={t("offer.sectionClient")}>
          <div className="space-y-4">
            {heading("to")}
            {text("recipient", t("offer.recipient"), offer.recipient)}
            <Field label={t("offer.intro")} hint={t("offer.boldHint")} htmlFor="intro">
              <textarea id="intro" name="intro" dir="rtl" rows={3} defaultValue={offer.intro} className={textarea} />
            </Field>
          </div>
        </Card>

        <Card title={t("offer.sectionScope")}>
          <div className="space-y-4">
            {heading("documents")}
            {list("documents", t("offer.documents"), offer.documents, 3)}
            {heading("timeline")}
            {list("timeline", t("offer.timeline"), offer.timeline, 4)}
          </div>
        </Card>

        <Card title={t("offer.sectionPrice")}>
          <div className="mb-5">{heading("financial")}</div>
          <OfferItemsEditor key={itemsVersion} items={offer.items} />
          <details className="mt-5">
            <summary className="cursor-pointer text-[13px] font-bold text-teal">{t("offer.tableLabels")}</summary>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-4">
              {heading("area", "offer.area")}
              {heading("details", "offer.details")}
              {heading("quantity", "offer.quantity")}
              {heading("price", "offer.price")}
              {heading("subtotal", "offer.subtotal")}
              {heading("vat", "offer.vat")}
              {heading("total", "offer.total")}
            </div>
          </details>
        </Card>

        <Card title={t("offer.sectionPayments")}>
          <div className="space-y-4">
            {heading("payments")}
            {list("payments", t("offer.payments"), offer.payments, 3)}
          </div>
        </Card>

        <Card title={t("offer.sectionTerms")}>
          <div className="space-y-4">
            {heading("companyDuties")}
            {list("companyDuties", t("offer.companyDuties"), offer.companyDuties, 3)}
            {heading("clientDuties")}
            {list("clientDuties", t("offer.clientDuties"), offer.clientDuties, 2)}
            {heading("confidentiality")}
            {list("confidentiality", t("offer.confidentiality"), offer.confidentiality, 2, paragraphsHint)}
            {heading("termination")}
            {list("termination", t("offer.termination"), offer.termination, 4, paragraphsHint)}
          </div>
        </Card>

        <Card title={t("offer.sectionBank")} description={t("offer.bankHint")}>
          <div className="mb-4">{heading("bank")}</div>
          <div className="space-y-2">
            {bankRows.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] items-center gap-2">
                <input name="bankLabel" aria-label={`${t("offer.bankLabel")} ${i + 1}`} placeholder={t("offer.bankLabel")} dir="rtl" defaultValue={row.label} className={inputClass} />
                <input name="bankValue" aria-label={`${t("offer.bankValue")} ${i + 1}`} placeholder={t("offer.bankValue")} dir="auto" defaultValue={row.value} className={inputClass} />
                <label className="flex items-center gap-1.5 whitespace-nowrap text-[12.5px] text-white/70">
                  <input type="checkbox" name="bankAccent" value={i} defaultChecked={row.accent} className="h-4 w-4 accent-teal" />
                  {t("offer.bankAccent")}
                </label>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t("offer.sectionSignature")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {text("signatureLead", t("offer.signatureLead"), offer.signature.lead)}
            {list("signatureLines", t("offer.signatureLines"), offer.signature.lines, 2, t("offer.linesHint"))}
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton pendingLabel="common.saving">{t("common.save")}</SubmitButton>
          <OfferLinks id={q.id} t={t} />
          <SubmitButton name="intent" value="reset" variant="secondary" confirm="offer.resetConfirm" disabled={!savedAt} className={cx(buttonClass.secondary, "ms-auto")}>
            <Icon name="restore" className="h-4 w-4" />
            {t("offer.reset")}
          </SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
