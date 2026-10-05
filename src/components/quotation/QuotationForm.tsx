"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { submitQuotation } from "@/actions/quotation";
import {
  ATTACHMENT_EXTENSIONS, ATTACHMENT_MAX_BYTES, ATTACHMENT_MAX_COUNT, CLIENT_TYPES, computeTotals, DEFAULT_DEPARTMENT,
  DEFAULT_PAYMENTS, DOCUMENTS, FORMATS, formatBytes, formatMoney, SALES_PEOPLE, SERVICES, todayIso,
} from "@/lib/quotation";
import { Link } from "@/navigation";

const inputBase =
  "w-full rounded-[14px] border bg-navy-deep/70 px-4 py-3 text-[15px] text-white placeholder:text-white/35 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/25";
const labelClass = "mb-1.5 block text-[14px] font-bold text-iceblue";
const checkClass = "mt-0.5 h-[18px] w-[18px] shrink-0 accent-teal";
const optionClass =
  "flex cursor-pointer items-start gap-3 rounded-[14px] border border-white/10 bg-white/[0.03] px-4 py-3 text-[14.5px] leading-snug text-white/90 transition hover:border-teal/50 has-[:checked]:border-teal has-[:checked]:bg-teal/10";

/** The intake brief: six numbered sections, VAT worked out as you type. */
export default function QuotationForm() {
  const t = useTranslations("Quotation");
  const locale = useLocale();
  const [state, dispatch, pending] = useActionState(submitQuotation, null);
  const formRef = useRef<HTMLFormElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [payments, setPayments] = useState<string[]>(DEFAULT_PAYMENTS.map(String));
  const [otherService, setOtherService] = useState(false);
  const [copied, setCopied] = useState(false);

  // the page is built ahead of time, so today's date is filled in here
  useEffect(() => {
    if (dateRef.current && !dateRef.current.value) dateRef.current.value = todayIso();
  }, [token]);

  useEffect(() => {
    if (state?.ok && state.token) {
      setToken(state.token);
      formRef.current?.reset();
      setAmount("");
      setAmountMax("");
      setFiles([]);
      setPayments(DEFAULT_PAYMENTS.map(String));
      setOtherService(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (state && !state.ok) {
      document.querySelector<HTMLElement>("[data-form-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state]);

  // submit without React's automatic form reset, so a rejected form keeps its input
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };

  const bad = (name: string) => !!state && !state.ok && state.fields.includes(name);
  const input = (name: string, extra = "") => `${inputBase} ${bad(name) ? "border-rose-400/70" : "border-white/15"} ${extra}`;

  const parse = (raw: string) => {
    const n = Number(raw.replace(/[,\s]/g, ""));
    return raw.trim() && Number.isFinite(n) && n >= 0 ? n : null;
  };
  const low = parse(amount);
  const high = parse(amountMax);
  const totals = low === null ? null : computeTotals(low);
  const totalsMax = high === null || low === null || high <= low ? null : computeTotals(high);
  // "12,750.00" or "12,750.00 – 15,000.00"
  const figure = (a: number | undefined, b: number | undefined) =>
    a === undefined ? "—" : b === undefined ? formatMoney(a, locale) : `${formatMoney(a, locale)} – ${formatMoney(b, locale)}`;
  const tooMany = files.length > ATTACHMENT_MAX_COUNT || files.some((f) => f.size > ATTACHMENT_MAX_BYTES);
  const paymentsSum = payments.reduce((sum, p) => sum + (Number(p) || 0), 0);

  if (token) {
    const href = `/quotation-request/${token}`;
    return (
      <div role="status" className="rounded-[24px] border border-teal/40 bg-teal/10 p-7 text-center md:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal text-navy">
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
        </div>
        <h2 className="mt-5 text-[22px] font-bold text-white md:text-[26px]">{t("successTitle")}</h2>
        <p className="mx-auto mt-3 max-w-[620px] text-[15px] leading-[1.9] text-white/85">{t("success")}</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={href}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-[16px] bg-teal px-8 py-3.5 text-[16px] font-bold text-navy transition-all hover:bg-teal-cyan hover:shadow-[0_0_30px_rgba(0,180,172,.4)]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" /></svg>
            {t("downloadPdf")}
          </Link>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(new URL(`${locale === "en" ? "/en" : ""}${href}`, window.location.origin).toString());
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className="inline-flex items-center gap-2 rounded-[16px] border border-white/25 px-6 py-3.5 text-[15px] font-bold text-white transition hover:border-teal hover:text-teal"
          >
            {copied ? t("copied") : t("copyLink")}
          </button>
        </div>
        <button
          type="button"
          onClick={() => { setToken(""); setCopied(false); }}
          className="mt-6 text-[14px] font-bold text-teal underline-offset-4 hover:underline"
        >
          {t("another")}
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-8 text-start" noValidate>
      <input type="hidden" name="locale" value={locale} />
      {/* bots fill every field; people never see this one */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="text-[13.5px] text-steel">{t("requiredNote")}</p>

      {/* 1 ---------------------------------------------------------------- */}
      <Section n={1} title={t("sections.sales")} subtitle={t("sectionsEn.sales")}>
        <Field label={t("salesPerson")} required htmlFor="q-sales">
          <select id="q-sales" name="salesPerson" required defaultValue="" className={input("salesPerson")}>
            <option value="" disabled>{t("salesPersonChoose")}</option>
            {SALES_PEOPLE.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </Field>
        <Field label={t("requestDate")} required htmlFor="q-date">
          <input ref={dateRef} id="q-date" name="requestDate" type="date" required dir="ltr" className={input("requestDate", "text-start font-exo")} />
        </Field>
        <Field label={t("reference")} hint={t("referenceHint")} htmlFor="q-ref">
          <input id="q-ref" name="reference" placeholder="S00___" dir="ltr" maxLength={40} className={input("reference", "text-start font-exo")} />
        </Field>
        <Field label={t("department")} htmlFor="q-dept">
          <input id="q-dept" name="department" defaultValue={locale === "en" ? DEFAULT_DEPARTMENT.en : DEFAULT_DEPARTMENT.ar} maxLength={150} className={input("department")} />
        </Field>
      </Section>

      {/* 2 ---------------------------------------------------------------- */}
      <Section n={2} title={t("sections.client")} subtitle={t("sectionsEn.client")}>
        <Field label={t("clientName")} required htmlFor="q-client">
          <input id="q-client" name="clientName" required autoComplete="organization" maxLength={200} className={input("clientName")} />
        </Field>
        <Field label={t("clientContact")} htmlFor="q-contact">
          <input id="q-contact" name="clientContact" maxLength={150} className={input("clientContact")} />
        </Field>
        <Field label={t("clientType")} required wide>
          <div className={`grid grid-cols-1 gap-2 sm:grid-cols-3 ${bad("clientType") ? "rounded-[16px] ring-2 ring-rose-400/60" : ""}`}>
            {CLIENT_TYPES.map((k) => (
              <label key={k} className={optionClass}>
                <input type="radio" name="clientType" value={k} className={checkClass} />
                <span>{t(`clientTypes.${k}`)}</span>
              </label>
            ))}
          </div>
        </Field>
        <Field label={t("clientPhone")} required htmlFor="q-phone">
          <input id="q-phone" name="clientPhone" type="tel" required autoComplete="tel" dir="ltr" maxLength={40} className={input("clientPhone", "text-start font-exo")} />
        </Field>
        <Field label={t("clientEmail")} htmlFor="q-email">
          <input id="q-email" name="clientEmail" type="email" autoComplete="email" dir="ltr" maxLength={200} className={input("clientEmail", "text-start font-exo")} />
        </Field>
        <Field label={t("clientAddress")} htmlFor="q-address" wide>
          <input id="q-address" name="clientAddress" maxLength={300} className={input("clientAddress")} />
        </Field>
      </Section>

      {/* 3 ---------------------------------------------------------------- */}
      <Section n={3} title={t("sections.project")} subtitle={t("sectionsEn.project")}>
        <Field label={t("serviceType")} required hint={t("serviceHint")} wide>
          <div className={`grid grid-cols-1 gap-2 md:grid-cols-2 ${bad("services") ? "rounded-[16px] ring-2 ring-rose-400/60" : ""}`}>
            {SERVICES.map((k) => (
              <label key={k} className={optionClass}>
                <input
                  type="checkbox"
                  name="services"
                  value={k}
                  className={checkClass}
                  onChange={k === "other" ? (e) => setOtherService(e.target.checked) : undefined}
                />
                <span>{t(`services.${k}`)}</span>
              </label>
            ))}
          </div>
          {otherService && (
            <input
              name="serviceOther"
              aria-label={t("serviceOtherDetail")}
              placeholder={t("serviceOtherDetail")}
              maxLength={300}
              className={`${input("services")} mt-3`}
            />
          )}
        </Field>

        <h4 className="text-[15px] font-bold text-white md:col-span-2">{t("projectDetails")}</h4>
        <Field label={t("projectName")} htmlFor="q-project">
          <input id="q-project" name="projectName" maxLength={300} className={input("projectName")} />
        </Field>
        <Field label={t("projectLocation")} htmlFor="q-location">
          <input id="q-location" name="projectLocation" maxLength={300} className={input("projectLocation")} />
        </Field>
        <Field label={`${t("landArea")} (${t("landAreaUnit")})`} htmlFor="q-area">
          <input id="q-area" name="landArea" inputMode="decimal" dir="ltr" maxLength={40} className={input("landArea", "text-start font-exo")} />
        </Field>
        <Field label={t("boundaries")} htmlFor="q-bounds">
          <input id="q-bounds" name="boundaries" maxLength={1500} className={input("boundaries")} />
        </Field>
        <Field label={t("studyGoal")} htmlFor="q-goal" wide>
          <textarea id="q-goal" name="studyGoal" rows={3} maxLength={2000} className={input("studyGoal")} />
        </Field>
      </Section>

      {/* 4 ---------------------------------------------------------------- */}
      <Section n={4} title={t("sections.documents")} subtitle={t("sectionsEn.documents")}>
        <Field label={t("documentsReceived")} hint={t("documentsHint")} wide>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {DOCUMENTS.map((k) => (
              <label key={k} className={optionClass}>
                <input type="checkbox" name="documents" value={k} className={checkClass} />
                <span>{t(`documents.${k}`)}</span>
              </label>
            ))}
          </div>
        </Field>
        <Field label={t("clientRequirements")} htmlFor="q-reqs" wide>
          <textarea id="q-reqs" name="clientRequirements" rows={3} maxLength={3000} className={input("clientRequirements")} />
        </Field>
        <Field label={t("attachments")} hint={t("attachmentsHint")} wide>
          <label
            htmlFor="q-files"
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed px-4 py-6 text-center transition-colors hover:border-teal hover:bg-teal/10 ${
              bad("attachments") || tooMany ? "border-rose-400/70 bg-rose-500/5" : "border-teal/40 bg-teal/[0.05]"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-teal"><path d="M5 20h14v-2H5v2zm7-18-5.5 5.5 1.41 1.41L11 5.83V16h2V5.83l3.09 3.08 1.41-1.41L12 2z" /></svg>
            <span className="text-[15px] font-bold text-white">
              {files.length ? t("attachmentsCount", { count: files.length }) : t("attachmentsChoose")}
            </span>
          </label>
          <input
            ref={fileRef}
            id="q-files"
            name="attachments"
            type="file"
            multiple
            accept={ATTACHMENT_EXTENSIONS.map((e) => `.${e}`).join(",")}
            className="sr-only"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
          {files.length > 0 && (
            <ul className="mt-3 divide-y divide-white/10 rounded-[14px] border border-white/10 text-[13.5px]">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 px-4 py-2">
                  <bdi className={`min-w-0 truncate ${f.size > ATTACHMENT_MAX_BYTES ? "text-rose-300" : "text-white/90"}`}>{f.name}</bdi>
                  <span className="shrink-0 font-exo text-[12.5px] text-steel">{formatBytes(f.size)}</span>
                </li>
              ))}
              <li className="px-4 py-2 text-end">
                <button
                  type="button"
                  onClick={() => { setFiles([]); if (fileRef.current) fileRef.current.value = ""; }}
                  className="text-[13px] font-bold text-rose-300 hover:underline"
                >
                  {t("attachmentsClear")}
                </button>
              </li>
            </ul>
          )}
        </Field>
      </Section>

      {/* 5 ---------------------------------------------------------------- */}
      <Section n={5} title={t("sections.financial")} subtitle={t("sectionsEn.financial")}>
        <Field label={t("amount")} hint={t("amountRangeHint")} wide>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {([["amount", amount, setAmount, "amountFrom"], ["amountMax", amountMax, setAmountMax, "amountTo"]] as const).map(([name, value, set, label]) => (
              <div key={name} className="relative">
                <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-[13px] font-bold text-iceblue">{t(label)}</span>
                <input
                  name={name}
                  aria-label={`${t("amount")} – ${t(label)}`}
                  inputMode="decimal"
                  dir="ltr"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className={input(name, "text-start font-exo ps-16 pe-24")}
                />
                <span className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-[13px] text-steel">{t("currency")}</span>
              </div>
            ))}
          </div>
        </Field>
        <Field label={t("vat")} hint={t("autoCalculated")}>
          <Computed value={figure(totals?.vat, totalsMax?.vat)} />
        </Field>
        <Field label={t("total")} hint={t("autoCalculated")}>
          <Computed value={figure(totals?.total, totalsMax?.total)} strong />
        </Field>
        <Field label={t("duration")} hint={t("durationHint")} htmlFor="q-days">
          <div className="relative">
            <input id="q-days" name="durationDays" inputMode="numeric" dir="ltr" maxLength={5} className={input("durationDays", "text-start font-exo pe-24")} />
            <span className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-[13px] text-steel">{t("durationUnit")}</span>
          </div>
        </Field>
        <Field label={t("validity")} hint={t("validityHint")} htmlFor="q-validity">
          <input id="q-validity" name="validity" maxLength={120} className={input("validity")} />
        </Field>

        <Field label={t("paymentsTitle")} hint={t("paymentsHint")} wide>
          <div className={`grid grid-cols-1 gap-3 md:grid-cols-3 ${bad("payments") ? "rounded-[16px] ring-2 ring-rose-400/60" : ""}`}>
            {(["payment1", "payment2", "payment3"] as const).map((key, i) => (
              <label key={key} className="rounded-[14px] border border-white/10 bg-white/[0.03] p-3">
                <span className="mb-2 block text-[13px] leading-snug text-white/85">{t(key)}</span>
                <div className="relative">
                  <input
                    name={key}
                    inputMode="numeric"
                    dir="ltr"
                    maxLength={3}
                    value={payments[i]}
                    onChange={(e) => setPayments(payments.map((p, j) => (j === i ? e.target.value : p)))}
                    className={`${inputBase} border-white/15 text-start font-exo pe-10`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 end-4 flex items-center font-exo text-[14px] text-steel">%</span>
                </div>
              </label>
            ))}
          </div>
          <p className={`mt-2 text-[13px] font-bold ${paymentsSum === 100 ? "text-teal" : "text-amber-300"}`}>
            {t("paymentsSum")}: <span className="font-exo">{paymentsSum}%</span>
          </p>
        </Field>
      </Section>

      {/* 6 ---------------------------------------------------------------- */}
      <Section n={6} title={t("sections.deliverables")} subtitle={t("sectionsEn.deliverables")}>
        <Field label={t("reportFormat")} wide>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {FORMATS.map((k) => (
              <label key={k} className={optionClass}>
                <input type="checkbox" name="formats" value={k} className={checkClass} />
                <span>{t(`formats.${k}`)}</span>
              </label>
            ))}
          </div>
        </Field>
        <Field label={t("meeting")} wide>
          <div className="grid grid-cols-2 gap-2 sm:max-w-[360px]">
            {(["yes", "no"] as const).map((k) => (
              <label key={k} className={optionClass}>
                <input type="radio" name="meeting" value={k} className={checkClass} />
                <span>{t(k)}</span>
              </label>
            ))}
          </div>
        </Field>
        <Field label={t("notes")} htmlFor="q-notes" wide>
          <textarea id="q-notes" name="notes" rows={4} maxLength={3000} className={input("notes")} />
        </Field>
      </Section>

      {state && !state.ok && (
        <p data-form-error role="alert" className="rounded-[12px] border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-[14px] text-rose-200">
          {t(state.error)}
        </p>
      )}

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-[16px] bg-teal px-10 py-4 text-[16px] font-bold text-navy transition-all hover:bg-teal-cyan hover:shadow-[0_0_30px_rgba(0,180,172,.4)] disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? t("sending") : t("submit")}
        </button>
      </div>
    </form>
  );
}

function Section({ n, title, subtitle, children }: { n: number; title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:p-7">
      <div className="mb-6 flex items-center gap-4 border-b border-white/10 pb-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal font-exo text-[17px] font-bold text-navy">{n}</span>
        <div>
          <h3 className="text-[17px] font-bold text-white md:text-[19px]">{title}</h3>
          <p className="font-exo text-[12.5px] text-steel">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label, required, hint, htmlFor, wide, children,
}: { label: string; required?: boolean; hint?: string; htmlFor?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <label htmlFor={htmlFor} className={labelClass}>
        {label} {required && <span className="text-teal">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[12.5px] text-white/45">{hint}</p>}
    </div>
  );
}

function Computed({ value, strong }: { value: string; strong?: boolean }) {
  return (
    <div dir="ltr" className={`${inputBase} border-white/10 bg-white/[0.04] text-start font-exo ${strong ? "font-bold text-teal-cyan" : "text-white/80"}`}>
      {value}
    </div>
  );
}
