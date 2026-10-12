import "server-only";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { boldParts, offerDate, offerMoney, offerTotals, type QuotationOffer } from "@/lib/quotation-offer";
import { DIRS, PUBLIC_ASSETS, within } from "./paths";

/* The quotation as a Word document in the company's template, for editing
   further in Word: US Letter, the letterhead behind every page, Arabic in
   Arial and Latin letters and digits in Calibri, laid out to the template's
   measurements like the printable sheet (QuotationOfferSheet). */

const LETTERHEAD = "quotation/letterhead.jpg";
const NAVY = "1F3864";

const NS =
  'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
  'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ' +
  'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" ' +
  'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ' +
  'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
/** points → twentieths of a point */
const tw = (pt: number) => Math.round(pt * 20);

/* ---- runs ----------------------------------------------------------------
   Split the way the template is: Latin words ("PDF", "BSH", an IBAN) are
   left-to-right runs in Calibri; everything else is a right-to-left run,
   with Arabic letters in Arial (as the template renders) and digits, spaces
   and punctuation in Calibri. Keeping digits and punctuation in the
   right-to-left runs is what keeps "10–12" and "(BSH)" in order. */

type RunStyle = { size: number; bold?: boolean; color?: string; font?: string };

const ARABIC = /\p{Script=Arabic}/u;
const LATIN_LETTER = /\p{Script=Latin}/u;
const DIGIT = /[0-9]/;

function run(text: string, style: RunStyle, rtl: boolean, arabic = false) {
  const font = style.font ?? (arabic ? "Arial" : "Calibri");
  const props =
    `<w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:eastAsia="${font}" w:cs="${font}"/>` +
    (style.bold ? "<w:b/><w:bCs/>" : "") +
    (style.color ? `<w:color w:val="${style.color}"/>` : "") +
    `<w:sz w:val="${Math.round(style.size * 2)}"/><w:szCs w:val="${Math.round(style.size * 2)}"/>` +
    (rtl ? "<w:rtl/>" : "");
  return `<w:r><w:rPr>${props}</w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
}

/** Text with **bold** parts for a right-to-left paragraph, split into runs as above. */
function runs(text: string, style: RunStyle) {
  let out = "";
  boldParts(text).forEach((part, i) => {
    const s = { ...style, bold: style.bold || i % 2 === 1 };
    const chars = [...part];
    let k = 0;
    while (k < chars.length) {
      // "50%" stays as written: in a right-to-left run Word would print "%50"
      const percent = /^[0-9][0-9.,]*%/.exec(chars.slice(k).join(""));
      if (percent) {
        out += run(percent[0], s, false);
        k += percent[0].length;
        continue;
      }
      if (LATIN_LETTER.test(chars[k])) {
        // a Latin word or phrase: up to its last letter or digit before any Arabic
        let end = k;
        for (let j = k; j < chars.length && !ARABIC.test(chars[j]); j++) {
          if (LATIN_LETTER.test(chars[j]) || DIGIT.test(chars[j])) end = j;
        }
        out += run(chars.slice(k, end + 1).join(""), s, false);
        k = end + 1;
        continue;
      }
      // right to left, in Arial for Arabic letters and Calibri for the rest
      const arabic = ARABIC.test(chars[k]);
      let end = k;
      while (end + 1 < chars.length && !LATIN_LETTER.test(chars[end + 1]) && ARABIC.test(chars[end + 1]) === arabic) end++;
      out += run(chars.slice(k, end + 1).join(""), s, true, arabic);
      k = end + 1;
    }
  });
  return out;
}

/* ---- paragraphs ---------------------------------------------------------- */

type Para = {
  /** space above, in points */
  before?: number;
  /** line height, in points (exact) */
  line: number;
  align?: "right" | "center" | "left" | "both";
  /** right-to-left paragraph (default) */
  rtl?: boolean;
  /** indent from the right margin, and how far the first line (a number or bullet) hangs out of it */
  indent?: number;
  hanging?: number;
  /** a list: numbering instance */
  num?: number;
  /** size of the paragraph mark, which also sizes a list's bullet */
  markSize?: number;
  pageBreak?: boolean;
  keepNext?: boolean;
};

function para(p: Para, content: string) {
  const rtl = p.rtl !== false;
  // in a right-to-left paragraph Word measures w:left from the right margin
  const ind = p.indent || p.hanging ? `<w:ind w:left="${tw(p.indent ?? 0)}"${p.hanging ? ` w:hanging="${tw(p.hanging)}"` : ""}/>` : "";
  const align = p.align ?? "right";
  const pPr =
    (p.keepNext ? "<w:keepNext/>" : "") +
    (p.pageBreak ? "<w:pageBreakBefore/>" : "") +
    (p.num ? `<w:numPr><w:ilvl w:val="0"/><w:numId w:val="${p.num}"/></w:numPr>` : "") +
    `<w:spacing w:before="${tw(p.before ?? 0)}" w:after="0" w:line="${tw(p.line)}" w:lineRule="exact"/>` +
    ind +
    (rtl ? "<w:bidi/>" : "") +
    // in a right-to-left paragraph "left" is the start: the right-hand side
    `<w:jc w:val="${align === "right" ? (rtl ? "left" : "right") : align}"/>` +
    (p.markSize ? `<w:rPr><w:sz w:val="${p.markSize * 2}"/><w:szCs w:val="${p.markSize * 2}"/></w:rPr>` : "");
  return `<w:p><w:pPr>${pPr}</w:pPr>${content}</w:p>`;
}

/* ---- tables -------------------------------------------------------------- */

const border = (sides: string[]) =>
  `<w:tblBorders>${sides.map((s) => `<w:${s} w:val="single" w:sz="8" w:space="0" w:color="000000"/>`).join("")}</w:tblBorders>`;
const ALL_BORDERS = border(["top", "left", "bottom", "right", "insideH", "insideV"]);

type Cell = { width: number; content: string; fill?: string; span?: number; valign?: "top" | "center" | "bottom" };

function cell(c: Cell) {
  return (
    `<w:tc><w:tcPr><w:tcW w:w="${tw(c.width)}" w:type="dxa"/>` +
    (c.span ? `<w:gridSpan w:val="${c.span}"/>` : "") +
    (c.fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${c.fill}"/>` : "") +
    `<w:vAlign w:val="${c.valign ?? "center"}"/></w:tcPr>${c.content}</w:tc>`
  );
}

function table(o: { widths: number[]; rtl: boolean; indent: number; borders: boolean; rows: { height: number; exact?: boolean; cells: Cell[] }[] }) {
  return (
    "<w:tbl><w:tblPr>" +
    (o.rtl ? "<w:bidiVisual/>" : "") +
    `<w:tblW w:w="${tw(o.widths.reduce((a, b) => a + b, 0))}" w:type="dxa"/>` +
    `<w:tblInd w:w="${tw(o.indent)}" w:type="dxa"/>` +
    (o.borders ? ALL_BORDERS : "") +
    '<w:tblLayout w:type="fixed"/>' +
    '<w:tblCellMar><w:left w:w="108" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar>' +
    `</w:tblPr><w:tblGrid>${o.widths.map((w) => `<w:gridCol w:w="${tw(w)}"/>`).join("")}</w:tblGrid>` +
    o.rows
      .map(
        (r) =>
          `<w:tr><w:trPr><w:cantSplit/><w:trHeight w:val="${tw(r.height)}" w:hRule="${r.exact ? "exact" : "atLeast"}"/></w:trPr>` +
          r.cells.map(cell).join("") +
          "</w:tr>",
      )
      .join("") +
    "</w:tbl>"
  );
}

/* ---- the document -------------------------------------------------------- */

// numbering instances (numbering.xml)
const NUM_BULLET = 1;
const NUM_PARTIES = 2;
const NUM_COMPANY_DUTIES = 3;
const NUM_CLIENT_DUTIES = 4;

const heading = (text: string, o: { before: number; size?: number; indent?: number; align?: Para["align"]; color?: string }) =>
  para(
    { before: o.before, line: o.size === 16 ? 19.5 : 17.25, indent: o.indent, align: o.align, keepNext: true },
    runs(text, { size: o.size ?? 14, bold: true, color: o.color ?? NAVY }),
  );

function body(offer: QuotationOffer) {
  const { labels, company } = offer;
  const totals = offerTotals(offer.items);
  const parts: string[] = [];
  const add = (xml: string) => parts.push(xml);
  // pages 2 and 3 start on a new page, as in the template. Word drops the space
  // above a paragraph at the top of a page, so an empty line of that height leads.
  const newPage = (space: number) => add(para({ line: space, pageBreak: true }, ""));

  /* page 1 */
  const meta = (label: string, value: string, before: number, color?: string) => ({
    height: 0,
    cells: [
      { width: 106, valign: "top" as const, content: para({ before, line: 9.2, rtl: false }, run(label, { size: 8, bold: true, font: "Arial" }, false)) },
      { width: 122, valign: "top" as const, content: para({ before, line: 9.2, rtl: false }, run(value, { size: 8, font: "Arial", color }, false)) },
    ],
  });
  add(
    table({
      widths: [106, 122],
      rtl: false,
      indent: 5.3,
      borders: false,
      rows: [
        meta(labels.number, offer.number, 15.2, "2F5496"),
        meta(labels.date, offerDate(offer.date), 14.2),
        meta(labels.valid, offerDate(offer.validUntil), 4.2),
      ],
    }),
  );
  add(para({ before: 56.5, line: 22.5, align: "center" }, runs(offer.title, { size: 18, bold: true, color: NAVY })));
  if (labels.from) add(heading(labels.from, { before: 7.5, indent: 22.5 }));
  add(para({ before: 7.6, line: 17.25, indent: 31.5, hanging: 18, num: NUM_PARTIES, markSize: 9 }, runs(company.name, { size: 14, bold: true })));
  if (company.registry || company.license) {
    const dash = company.registry && company.license;
    add(
      para(
        { before: 7, line: 13.5, indent: 34 },
        runs(company.registry + (dash ? "     " : ""), { size: 11 }) +
          (dash ? run("- ", { size: 18 }, false) + runs("    ", { size: 11 }) : "") +
          runs(company.license, { size: 11 }),
      ),
    );
  }
  company.address.forEach((line, i) => add(para({ before: i ? 0 : 9.2, line: 13.5, indent: 22.5 }, runs(line, { size: 11 }))));
  if (labels.to) add(heading(labels.to, { before: 8, indent: 31.5 }));
  add(para({ before: labels.to ? 0 : 8, line: 17.25, indent: 31.5, hanging: 18, num: NUM_PARTIES, markSize: 9 }, runs(offer.recipient, { size: 14, bold: true })));
  if (offer.intro) add(para({ before: 15, line: 14.25, indent: 31.5 }, runs(offer.intro, { size: 12 })));
  if (offer.documents.length) {
    if (labels.documents) add(heading(labels.documents, { before: 21, color: "000000" }));
    offer.documents.forEach((line) =>
      add(para({ before: 9.4, line: 17.25, indent: 36, hanging: 18, num: NUM_BULLET, markSize: 10 }, runs(line, { size: 14 }))),
    );
  }
  if (offer.timeline.length) {
    if (labels.timeline) add(heading(labels.timeline, { before: 31.4, indent: 18.1 }));
    offer.timeline.forEach((line, i) =>
      add(para({ before: i ? 0 : 7.7, line: 13.5, indent: 58.5, hanging: 18, num: NUM_BULLET, markSize: 11 }, runs(line, { size: 11 }))),
    );
  }

  /* page 2 */
  newPage(28);
  if (labels.financial) add(heading(labels.financial, { before: 0, align: "center" }));
  const centered = (text: string, style: RunStyle, ltr = false) => para({ line: 13.5, align: "center", rtl: !ltr }, ltr ? run(text, style, false) : runs(text, style));
  const header = (text: string, width: number) => ({ width, fill: "215C98", content: centered(text, { size: 11, bold: true, color: "FFFFFF" }) });
  const priceRows = [
    {
      height: 15,
      cells: [header(labels.area, 63.7), header(labels.details, 290.3), header(labels.quantity, 35.3), header(labels.price, 92.2)],
    },
    ...offer.items.map((item) => ({
      height: 66,
      cells: [
        {
          width: 63.7,
          content: para(
            { line: 14.25, align: "center" },
            item.area ? runs(item.area, { size: 12, bold: true }) + runs(" م²", { size: 11 }) : "",
          ),
        },
        {
          width: 290.3,
          // the bullet 12pt and the text 36.6pt in from the cell's padding, as in the template
          content: para({ line: 13.5, indent: 36.6, hanging: 24.6, num: NUM_BULLET, markSize: 11 }, runs(item.details, { size: 11 })),
        },
        { width: 35.3, content: centered(String(item.quantity), { size: 11 }, true) },
        { width: 92.2, content: centered(offerMoney(item.price), { size: 11 }, true) },
      ],
    })),
    ...([
      [labels.subtotal, totals.subtotal],
      [labels.vat, totals.vat],
      [labels.total, totals.total],
    ] as const).map(([label, amount]) => ({
      height: 15,
      cells: [
        { width: 354, span: 2, fill: "D0CECE", content: centered(label, { size: 11, bold: true }) },
        { width: 127.5, span: 2, fill: "F2F2F2", content: centered(offerMoney(amount), { size: 11, bold: true }, true) },
      ],
    })),
  ];
  // the gap above the table
  add(para({ line: 29.5 }, ""));
  add(table({ widths: [63.7, 290.3, 35.3, 92.2], rtl: true, indent: -4.5, borders: true, rows: priceRows }));
  if (offer.payments.length) {
    if (labels.payments) add(heading(labels.payments, { before: 36.4, indent: 19 }));
    offer.payments.forEach((line, i) =>
      add(para({ before: i ? 0 : 8, line: 13.5, indent: 49.5, hanging: 18, num: NUM_BULLET, markSize: 11 }, runs(line, { size: 11 }))),
    );
  }
  const duties = (title: string, list: string[], num: number, before: number) => {
    if (!list.length) return;
    if (title) add(heading(title, { before, indent: 22.5 }));
    list.forEach((line) => add(para({ before: 7.75, line: 13.5, indent: 58.5, hanging: 36, num, markSize: 11 }, runs(line, { size: 11 }))));
  };
  duties(labels.companyDuties, offer.companyDuties, NUM_COMPANY_DUTIES, 21.5);
  duties(labels.clientDuties, offer.clientDuties, NUM_CLIENT_DUTIES, 22);
  if (offer.confidentiality.length) {
    if (labels.confidentiality) add(heading(labels.confidentiality, { before: 8.4, size: 16, indent: 22.5 }));
    offer.confidentiality.forEach((line) => add(para({ before: 7.9, line: 13.5, indent: 22.5 }, runs(line, { size: 11 }))));
  }

  /* page 3 */
  const { lead, lines } = offer.signature;
  if (offer.termination.length || offer.bank.length || lead || lines.length) newPage(19);
  if (offer.termination.length) {
    if (labels.termination) add(heading(labels.termination, { before: 0, size: 16, indent: 22.5 }));
    offer.termination.forEach((line, i) => add(para({ before: i ? 8 : 7.9, line: 13.5, indent: 22.5 }, runs(line, { size: 11 }))));
  }
  if (offer.bank.length) {
    if (labels.bank) add(heading(labels.bank, { before: 72.4, size: 16, align: "center", color: "1F3863" }));
    const bankCell = (text: string, width: number, o: { fill?: string; bold?: boolean; color?: string; ltr?: boolean } = {}) => ({
      width,
      fill: o.fill,
      valign: "top" as const,
      content: para(
        { before: 1.5, line: 16, align: "center", rtl: !o.ltr },
        o.ltr ? run(text, { size: 14, bold: o.bold }, false) : runs(text, { size: 14, bold: o.bold, color: o.color }),
      ),
    });
    add(
      table({
        widths: [22.3, 170.2, 255],
        rtl: true,
        indent: 20.5,
        borders: true,
        rows: offer.bank.map((row, i) => ({
          height: 18,
          exact: true,
          cells: [
            bankCell(String(i + 1), 22.3, { fill: "EAEDF1", bold: true, ltr: true }),
            bankCell(row.label, 170.2, { fill: "EAEDF1", bold: true }),
            bankCell(row.value, 255, { color: row.accent ? NAVY : undefined }),
          ],
        })),
      }),
    );
  }
  if (lead || lines.length) {
    const sig = (text: string, color: string | undefined, before = 0) =>
      para({ before, line: 19.5, indent: 13.5 }, runs(text, { size: 16, bold: true, color }));
    if (lead) add(sig(lead, undefined, 27.4));
    if (lines.length) {
      add(sig("", NAVY, lead ? 0 : 27.4));
      lines.forEach((line) => add(sig(line, NAVY)));
    }
  }
  return parts.join("");
}

/* ---- package parts ------------------------------------------------------- */

function documentXml(offer: QuotationOffer) {
  return (
    XML +
    `<w:document ${NS}><w:body>${body(offer)}` +
    '<w:sectPr><w:headerReference w:type="default" r:id="rIdHeader"/><w:footerReference w:type="default" r:id="rIdFooter"/>' +
    '<w:pgSz w:w="12240" w:h="15840"/>' +
    '<w:pgMar w:top="2160" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="980" w:gutter="0"/>' +
    '<w:pgNumType w:start="1"/></w:sectPr></w:body></w:document>'
  );
}

const HEADER =
  XML +
  `<w:hdr ${NS}><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:drawing>` +
  '<wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="0" behindDoc="1" locked="1" layoutInCell="1" allowOverlap="1">' +
  '<wp:simplePos x="0" y="0"/>' +
  '<wp:positionH relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionH>' +
  '<wp:positionV relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionV>' +
  '<wp:extent cx="7762875" cy="10124067"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapNone/>' +
  '<wp:docPr id="1" name="Letterhead"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
  '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>' +
  '<pic:nvPicPr><pic:cNvPr id="0" name="letterhead.jpg"/><pic:cNvPicPr/></pic:nvPicPr>' +
  '<pic:blipFill><a:blip r:embed="rIdLetterhead"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
  '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="7762875" cy="10124067"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>' +
  "</pic:pic></a:graphicData></a:graphic></wp:anchor></w:drawing></w:r></w:p></w:hdr>";

// the page number, centred in the letterhead's footer strip
const FOOTER =
  XML +
  `<w:ftr ${NS}><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>` +
  '<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/></w:rPr>' +
  '<w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/></w:rPr>' +
  '<w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>' +
  '<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/></w:rPr><w:t>1</w:t></w:r>' +
  '<w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>';

const STYLES =
  XML +
  `<w:styles ${NS}><w:docDefaults><w:rPrDefault><w:rPr>` +
  '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/>' +
  '<w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="ar-SA"/></w:rPr></w:rPrDefault>' +
  '<w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
  '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
  '<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:uiPriority w:val="99"/>' +
  '<w:semiHidden/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/>' +
  '<w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>' +
  "</w:styles>";

/** One level of a list: "●" bullets, or "1." numbers (bold and small for the two parties, as in the template). */
const level = (format: "bullet" | "decimal", o: { size?: number; bold?: boolean } = {}) =>
  `<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="${format}"/><w:lvlText w:val="${format === "bullet" ? "●" : "%1."}"/>` +
  '<w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>' +
  `<w:rPr><w:rFonts w:ascii="${format === "bullet" ? "Arial" : "Calibri"}" w:hAnsi="${format === "bullet" ? "Arial" : "Calibri"}" w:cs="${format === "bullet" ? "Arial" : "Calibri"}"/>` +
  (o.bold ? "<w:b/><w:bCs/>" : "") +
  (o.size ? `<w:sz w:val="${o.size * 2}"/><w:szCs w:val="${o.size * 2}"/>` : "") +
  "</w:rPr></w:lvl>";

const NUMBERING =
  XML +
  `<w:numbering ${NS}>` +
  `<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="singleLevel"/>${level("bullet")}</w:abstractNum>` +
  `<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="singleLevel"/>${level("decimal", { size: 9, bold: true })}</w:abstractNum>` +
  `<w:abstractNum w:abstractNumId="2"><w:multiLevelType w:val="singleLevel"/>${level("decimal", { size: 11 })}</w:abstractNum>` +
  `<w:num w:numId="${NUM_BULLET}"><w:abstractNumId w:val="0"/></w:num>` +
  `<w:num w:numId="${NUM_PARTIES}"><w:abstractNumId w:val="1"/></w:num>` +
  // each list of responsibilities counts from 1
  `<w:num w:numId="${NUM_COMPANY_DUTIES}"><w:abstractNumId w:val="2"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>` +
  `<w:num w:numId="${NUM_CLIENT_DUTIES}"><w:abstractNumId w:val="2"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>` +
  "</w:numbering>";

const SETTINGS =
  XML +
  `<w:settings ${NS}><w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/>` +
  '<w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>';

const CONTENT_TYPES =
  XML +
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
  '<Default Extension="xml" ContentType="application/xml"/><Default Extension="jpg" ContentType="image/jpeg"/>' +
  '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
  '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
  '<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>' +
  '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>' +
  '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>' +
  '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' +
  '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
  "</Types>";

const rels = (items: [id: string, type: string, target: string][]) =>
  XML +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  items.map(([id, type, target]) => `<Relationship Id="${id}" Type="${type}" Target="${target}"/>`).join("") +
  "</Relationships>";
const REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

const core = (title: string) =>
  XML +
  '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' +
  'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" ' +
  'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
  `<dc:title>${esc(title)}</dc:title><dc:creator>Takamol Advanced</dc:creator>` +
  `<dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0, 19)}Z</dcterms:created>` +
  "</cp:coreProperties>";

/** The letterhead as uploaded under Images, else the one shipped with the site. */
function letterhead() {
  const replaced = within(DIRS.assets, LETTERHEAD);
  return fs.readFileSync(replaced && fs.existsSync(replaced) ? replaced : path.join(PUBLIC_ASSETS, LETTERHEAD));
}

/* ---- zip ----------------------------------------------------------------- */

function zip(files: { name: string; data: Buffer }[]) {
  const chunks: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name, "utf8");
    const data = zlib.deflateRawSync(f.data);
    const crc = zlib.crc32(f.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(0, 10); // time
    local.writeUInt16LE(0x21, 12); // date: 1980-01-01
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(f.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(0x0800, 8);
    entry.writeUInt16LE(8, 10);
    entry.writeUInt16LE(0, 12);
    entry.writeUInt16LE(0x21, 14);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(data.length, 20);
    entry.writeUInt32LE(f.data.length, 24);
    entry.writeUInt16LE(name.length, 28);
    entry.writeUInt32LE(offset, 42);
    chunks.push(local, name, data);
    central.push(entry, name);
    offset += local.length + name.length + data.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, directory, end]);
}

/** The quotation as a .docx file. */
export function quotationDocx(offer: QuotationOffer, title: string) {
  const text = (name: string, xml: string) => ({ name, data: Buffer.from(xml, "utf8") });
  return zip([
    text("[Content_Types].xml", CONTENT_TYPES),
    text("_rels/.rels", rels([
      ["rId1", `${REL}/officeDocument`, "word/document.xml"],
      ["rId2", "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties", "docProps/core.xml"],
    ])),
    text("docProps/core.xml", core(title)),
    text("word/document.xml", documentXml(offer)),
    text("word/_rels/document.xml.rels", rels([
      ["rIdStyles", `${REL}/styles`, "styles.xml"],
      ["rIdNumbering", `${REL}/numbering`, "numbering.xml"],
      ["rIdSettings", `${REL}/settings`, "settings.xml"],
      ["rIdHeader", `${REL}/header`, "header1.xml"],
      ["rIdFooter", `${REL}/footer`, "footer1.xml"],
    ])),
    text("word/styles.xml", STYLES),
    text("word/numbering.xml", NUMBERING),
    text("word/settings.xml", SETTINGS),
    text("word/header1.xml", HEADER),
    text("word/_rels/header1.xml.rels", rels([["rIdLetterhead", `${REL}/image`, "media/letterhead.jpg"]])),
    text("word/footer1.xml", FOOTER),
    { name: "word/media/letterhead.jpg", data: letterhead() },
  ]);
}
