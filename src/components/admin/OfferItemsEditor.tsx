"use client";

import { useState } from "react";
import { offerMoney, offerTotals, OFFER_LIMITS, type OfferItem } from "@/lib/quotation-offer";
import { FieldError } from "./forms";
import { useT } from "./I18n";
import { Icon } from "./icons";
import { buttonClass, cx, inputClass } from "./ui";

/* The rows of the quotation's financial table, with the totals worked out
   as they are typed. Posted as parallel itemArea / itemDetails /
   itemQuantity / itemPrice fields. */

type Row = { key: number; area: string; details: string; quantity: string; price: string };

const toNumber = (v: string) => {
  const n = Number(v.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[,\s]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export function OfferItemsEditor({ items }: { items: OfferItem[] }) {
  const t = useT();
  const [rows, setRows] = useState<Row[]>(() =>
    (items.length ? items : [{ area: "", details: "", quantity: 1, price: 0 }]).map((item, key) => ({
      key,
      area: item.area,
      details: item.details,
      quantity: String(item.quantity),
      price: item.price ? String(item.price) : "",
    })),
  );
  const totals = offerTotals(rows.map((r) => ({ area: r.area, details: r.details, quantity: toNumber(r.quantity || "1"), price: toNumber(r.price) })));
  const change = (key: number, field: keyof Omit<Row, "key">, value: string) =>
    setRows((list) => list.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={row.key} className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-[110px_1fr_70px_130px_auto]">
          <label className="block">
            <span className="mb-1 block text-[12px] font-bold text-white/55">{t("offer.area")}</span>
            <input name="itemArea" value={row.area} onChange={(e) => change(row.key, "area", e.target.value)} className={inputClass} />
          </label>
          <label className="col-span-2 block sm:col-span-1">
            <span className="mb-1 block text-[12px] font-bold text-white/55">{t("offer.details")}</span>
            <textarea
              name="itemDetails"
              rows={2}
              value={row.details}
              onChange={(e) => change(row.key, "details", e.target.value)}
              className={cx(inputClass, "resize-y leading-relaxed")}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-bold text-white/55">{t("offer.quantity")}</span>
            <input
              name="itemQuantity"
              inputMode="numeric"
              dir="ltr"
              value={row.quantity}
              onChange={(e) => change(row.key, "quantity", e.target.value)}
              className={cx(inputClass, "font-exo")}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-bold text-white/55">{t("offer.price")}</span>
            <input
              name="itemPrice"
              inputMode="decimal"
              dir="ltr"
              value={row.price}
              onChange={(e) => change(row.key, "price", e.target.value)}
              className={cx(inputClass, "font-exo")}
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              title={t("offer.removeItem")}
              aria-label={`${t("offer.removeItem")} ${i + 1}`}
              disabled={rows.length === 1}
              onClick={() => setRows((list) => list.filter((r) => r.key !== row.key))}
              className={buttonClass.icon}
            >
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <FieldError name="items" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <button
          type="button"
          disabled={rows.length >= OFFER_LIMITS.items}
          onClick={() =>
            setRows((list) => [...list, { key: Math.max(...list.map((r) => r.key)) + 1, area: "", details: "", quantity: "1", price: "" }])
          }
          className={buttonClass.small}
        >
          <Icon name="plus" className="h-4 w-4" />
          {t("offer.addItem")}
        </button>
        <dl className="grid grid-cols-[auto_auto] gap-x-6 gap-y-1 text-[13.5px]">
          <dt className="text-white/55">{t("offer.subtotal")}</dt>
          <dd dir="ltr" className="text-end font-exo text-white">{offerMoney(totals.subtotal)}</dd>
          <dt className="text-white/55">{t("offer.vat")}</dt>
          <dd dir="ltr" className="text-end font-exo text-white">{offerMoney(totals.vat)}</dd>
          <dt className="font-bold text-white/80">{t("offer.total")}</dt>
          <dd dir="ltr" className="text-end font-exo font-bold text-teal">{offerMoney(totals.total)}</dd>
        </dl>
      </div>
    </div>
  );
}
