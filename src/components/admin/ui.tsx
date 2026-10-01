import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

/* Layout primitives for the admin area (usable from server and client). */

export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

export const inputClass =
  "w-full rounded-xl border border-white/15 bg-[#031524] px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/30 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/25 disabled:opacity-50";

export const buttonClass = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-[14px] font-bold text-navy transition hover:bg-teal-cyan disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-[14px] font-bold text-white transition hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-60",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/40 px-4 py-2.5 text-[14px] font-bold text-rose-300 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60",
  small:
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[12.5px] font-bold text-white/85 transition hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-40",
  smallDanger:
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-400/30 px-2.5 py-1.5 text-[12.5px] font-bold text-rose-300 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-40",
  icon:
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-white/80 transition hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-30",
};

export function PageHeader({
  title,
  subtitle,
  actions,
  back,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-[13px] font-bold text-teal hover:text-teal-cyan">
          <Icon name="up" className="h-4 w-4 -rotate-90 rtl:rotate-90" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-white md:text-[28px]">{title}</h1>
          {subtitle && <p className="mt-2 max-w-[760px] text-[14px] leading-relaxed text-steel">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6", className)}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-[16px] font-bold text-white">{title}</h2>}
            {description && <p className="mt-1 text-[13px] leading-relaxed text-steel">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-bold text-iceblue">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">{hint}</p>}
    </div>
  );
}

const TONES = {
  teal: "border-teal/30 bg-teal/15 text-teal-cyan",
  gray: "border-white/15 bg-white/5 text-white/70",
  amber: "border-amber-300/30 bg-amber-400/10 text-amber-200",
  rose: "border-rose-400/30 bg-rose-500/10 text-rose-200",
  green: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  blue: "border-sky-400/30 bg-sky-500/10 text-sky-200",
} as const;

export type Tone = keyof typeof TONES;

export function Badge({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[12px] font-bold", TONES[tone])}>
      {children}
    </span>
  );
}

export function Banner({ tone = "teal", icon, children }: { tone?: Tone; icon?: IconName; children: ReactNode }) {
  return (
    <div className={cx("mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-[14px] leading-relaxed", TONES[tone])}>
      {icon && <Icon name={icon} className="mt-0.5 h-5 w-5" />}
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center text-[14px] text-steel">{children}</div>
  );
}

export function StatCard({ label, value, href, icon, tone = "teal" }: { label: string; value: number | string; href?: string; icon: IconName; tone?: Tone }) {
  const body = (
    <div className="flex items-center gap-4">
      <span className={cx("flex h-11 w-11 items-center justify-center rounded-xl border", TONES[tone])}>
        <Icon name={icon} />
      </span>
      <div>
        <div className="font-exo text-[26px] font-bold leading-none text-white">{value}</div>
        <div className="mt-1 text-[13px] text-steel">{label}</div>
      </div>
    </div>
  );
  const cls = "rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition";
  return href ? (
    <Link href={href} className={cx(cls, "hover:border-teal/40 hover:bg-white/[0.06]")}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Pager for list pages: keeps the other query parameters. */
export function Pager({
  page,
  pages,
  base,
  params,
  labels,
}: {
  page: number;
  pages: number;
  base: string;
  params: Record<string, string | undefined>;
  labels: { previous: string; next: string; of: string };
}) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    q.set("page", String(p));
    return `${base}?${q.toString()}`;
  };
  return (
    <div className="mt-5 flex items-center justify-between gap-3 text-[13px] text-steel">
      <span className="font-exo">
        {page} {labels.of} {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 && <Link href={href(page - 1)} className={buttonClass.small}>{labels.previous}</Link>}
        {page < pages && <Link href={href(page + 1)} className={buttonClass.small}>{labels.next}</Link>}
      </div>
    </div>
  );
}
