import type { ReactNode } from "react";
import { boldParts, offerDate, offerMoney, offerTotals, type QuotationOffer } from "@/lib/quotation-offer";

/* The quotation in the company's template: three US Letter pages on the
   letterhead, laid out to the template's measurements (see .qo-* in
   globals.css). Content that outgrows a page continues on a new page that
   carries the letterhead too. Sections left empty are left out. */

const rich = (text: string) => boldParts(text).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part));

function Sheet({ page, letterhead, children }: { page: number; letterhead: string; children: ReactNode }) {
  return (
    <section className="qo-sheet" style={{ backgroundImage: `url("${letterhead}")` }}>
      <span className="qo-page-number">{page}</span>
      {/* the empty header and footer rows repeat on every printed page, keeping
          text clear of the letterhead's logo and contact strip */}
      <table className="qo-frame">
        <thead><tr><td className="qo-frame-top" /></tr></thead>
        <tfoot><tr><td className="qo-frame-bottom" /></tr></tfoot>
        <tbody><tr><td className="qo-frame-body">{children}</td></tr></tbody>
      </table>
    </section>
  );
}

export default function QuotationOfferSheet({ offer, letterhead }: { offer: QuotationOffer; letterhead: string }) {
  const totals = offerTotals(offer.items);
  const { labels, company } = offer;

  return (
    <div className="qo" dir="rtl" lang="ar">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="qo-letterhead" src={letterhead} alt="" />

      <Sheet page={1} letterhead={letterhead}>
        <div className="qo-meta" dir="ltr">
          <div className="qo-meta-row"><b>{labels.number}</b><span className="qo-meta-number">{offer.number}</span></div>
          <div className="qo-meta-row"><b>{labels.date}</b><span>{offerDate(offer.date)}</span></div>
          <div className="qo-meta-row"><b>{labels.valid}</b><span>{offerDate(offer.validUntil)}</span></div>
        </div>

        <h1 className="qo-title">{offer.title}</h1>

        {labels.from && <h2 className="qo-heading qo-from">{labels.from}</h2>}
        <div className="qo-party qo-party-company">
          <span className="qo-party-number">1.</span>
          <p className="qo-party-name">{company.name}</p>
          {(company.registry || company.license) && (
            <p className="qo-party-registry">
              {company.registry}
              {company.registry && company.license && <>{"     "}<span className="qo-party-dash">- </span>{"    "}</>}
              {company.license}
            </p>
          )}
        </div>
        {company.address.length > 0 && (
          <p className="qo-address">
            {company.address.map((line, i) => <span key={i}>{i > 0 && <br />}{rich(line)}</span>)}
          </p>
        )}

        {labels.to && <h2 className="qo-heading qo-to">{labels.to}</h2>}
        <div className="qo-party qo-party-client">
          <span className="qo-party-number">2.</span>
          <p className="qo-party-name">{offer.recipient}</p>
        </div>
        {offer.intro && <p className="qo-intro">{rich(offer.intro)}</p>}

        {offer.documents.length > 0 && (
          <>
            {labels.documents && <h2 className="qo-documents-heading">{labels.documents}</h2>}
            <ul className="qo-bullets qo-documents">
              {offer.documents.map((line, i) => <li key={i}>{rich(line)}</li>)}
            </ul>
          </>
        )}

        {offer.timeline.length > 0 && (
          <>
            {labels.timeline && <h2 className="qo-heading qo-timeline-heading">{labels.timeline}</h2>}
            <ul className="qo-bullets qo-timeline">
              {offer.timeline.map((line, i) => <li key={i}>{rich(line)}</li>)}
            </ul>
          </>
        )}
      </Sheet>

      <Sheet page={2} letterhead={letterhead}>
        {labels.financial && <h2 className="qo-heading qo-financial-heading">{labels.financial}</h2>}
        <table className="qo-price">
          <colgroup>
            <col className="qo-price-area" />
            <col className="qo-price-details" />
            <col className="qo-price-quantity" />
            <col className="qo-price-amount" />
          </colgroup>
          <thead>
            <tr>
              <th>{labels.area}</th>
              <th>{labels.details}</th>
              <th>{labels.quantity}</th>
              <th>{labels.price}</th>
            </tr>
          </thead>
          <tbody>
            {offer.items.map((item, i) => (
              <tr key={i} className="qo-price-item">
                <td>{item.area && <><b className="qo-price-area-value">{item.area}</b> م²</>}</td>
                <td className="qo-price-details-cell"><p>{rich(item.details)}</p></td>
                <td className="qo-latin">{item.quantity}</td>
                <td className="qo-latin">{offerMoney(item.price)}</td>
              </tr>
            ))}
            <tr className="qo-price-total">
              <th colSpan={2}>{labels.subtotal}</th>
              <td colSpan={2} className="qo-latin">{offerMoney(totals.subtotal)}</td>
            </tr>
            <tr className="qo-price-total">
              <th colSpan={2}>{labels.vat}</th>
              <td colSpan={2} className="qo-latin">{offerMoney(totals.vat)}</td>
            </tr>
            <tr className="qo-price-total">
              <th colSpan={2}>{labels.total}</th>
              <td colSpan={2} className="qo-latin">{offerMoney(totals.total)}</td>
            </tr>
          </tbody>
        </table>

        {offer.payments.length > 0 && (
          <>
            {labels.payments && <h2 className="qo-heading qo-payments-heading">{labels.payments}</h2>}
            <ul className="qo-bullets qo-payments">
              {offer.payments.map((line, i) => <li key={i}>{rich(line)}</li>)}
            </ul>
          </>
        )}

        {offer.companyDuties.length > 0 && (
          <>
            {labels.companyDuties && <h2 className="qo-heading qo-duties-heading">{labels.companyDuties}</h2>}
            <ol className="qo-duties">
              {offer.companyDuties.map((line, i) => <li key={i}>{rich(line)}</li>)}
            </ol>
          </>
        )}

        {offer.clientDuties.length > 0 && (
          <>
            {labels.clientDuties && <h2 className="qo-heading qo-client-duties-heading">{labels.clientDuties}</h2>}
            <ol className="qo-duties">
              {offer.clientDuties.map((line, i) => <li key={i}>{rich(line)}</li>)}
            </ol>
          </>
        )}

        {offer.confidentiality.length > 0 && (
          <>
            {labels.confidentiality && (
              <h2 className="qo-heading qo-heading-large qo-confidentiality-heading">{labels.confidentiality}</h2>
            )}
            {offer.confidentiality.map((line, i) => <p key={i} className="qo-paragraph">{rich(line)}</p>)}
          </>
        )}
      </Sheet>

      <Sheet page={3} letterhead={letterhead}>
        {offer.termination.length > 0 && (
          <>
            {labels.termination && (
              <h2 className="qo-heading qo-heading-large qo-termination-heading">{labels.termination}</h2>
            )}
            {offer.termination.map((line, i) => <p key={i} className="qo-paragraph qo-termination">{rich(line)}</p>)}
          </>
        )}

        {offer.bank.length > 0 && (
          <>
            {labels.bank && <h2 className="qo-bank-heading">{labels.bank}</h2>}
            <table className="qo-bank">
              <colgroup>
                <col className="qo-bank-number" />
                <col className="qo-bank-label" />
                <col />
              </colgroup>
              <tbody>
                {offer.bank.map((row, i) => (
                  <tr key={i}>
                    <th className="qo-latin">{i + 1}</th>
                    <th>{row.label}</th>
                    <td className={row.accent ? "qo-bank-accent" : undefined}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {(offer.signature.lead || offer.signature.lines.length > 0) && (
          <div className="qo-signature">
            {offer.signature.lead && <p>{offer.signature.lead}</p>}
            {offer.signature.lines.length > 0 && (
              <p className="qo-signature-company">
                {offer.signature.lines.map((line, i) => <span key={i}><br />{line}</span>)}
              </p>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
