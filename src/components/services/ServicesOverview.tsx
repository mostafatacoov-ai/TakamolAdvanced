import type { CSSProperties } from "react";
import Image from "@/components/SiteImage";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

// Order matches ServicesOverview.items in messages/*.json
export const SERVICE_LINKS = [
  "/services/investment-portfolio",
  "/services/engineering-design",
  "/services/consulting",
  "/services/digital-marketing",
  "/services/real-estate-brokerage",
];

/* ── Geometry of the bubble chain, in design units ─────────────────────
   Measured from the design: bubbles of radius 100 whose centres sit 194
   apart on both axes, so the ribbon runs at 45°. The ribbon is a pair of
   parallel lines tangent to each neighbouring pair of bubbles, wrapping
   around each bubble as an arc of radius 112: half a turn on the two end
   bubbles, three quarters on the middle ones. Neighbouring lines cross in
   an X between the bubbles. */
type Pt = { x: number; y: number };
type Layout = { w: number; h: number; centers: Pt[] };

const R = 100;
const D = 112;
const STEP = 194;
const IDX = [0, 1, 2, 3, 4];

/* Desktop: three bubbles over two. Reading-direction start first, so the
   chain starts on the right in Arabic (the SVG is mirrored for RTL). */
const WIDE: Layout = {
  w: 130 * 2 + STEP * 4,
  h: 130 * 2 + STEP,
  centers: IDX.map((i) => ({ x: 130 + i * STEP, y: i % 2 ? 130 + STEP : 130 })),
};

/* Phones and tablets: three rows (two, two, one centred) so the chain stays
   short. The ribbon snakes through the first four with right-angle turns;
   the row gap equals the ribbon's width (2 × D) so the inner lines of one
   turn continue straight into the next. The columns are a little wider so
   the last, diagonal segment down to the centred bubble passes tangent to
   the arc of the bubble beside it instead of behind it. */
const TALL_COL = 250;
const TALL_ROW = D * 2;
const TALL_X = [118, 118 + TALL_COL];
const TALL: Layout = {
  w: 118 * 2 + TALL_COL,
  h: 118 * 2 + TALL_ROW + TALL_COL,
  centers: [
    { x: TALL_X[0], y: 118 },
    { x: TALL_X[1], y: 118 },
    { x: TALL_X[1], y: 118 + TALL_ROW },
    { x: TALL_X[0], y: 118 + TALL_ROW },
    { x: 118 + TALL_COL / 2, y: 118 + TALL_ROW + TALL_COL },
  ],
};

const TAU = Math.PI * 2;
const f = (n: number) => (Math.round(n * 10) / 10).toString();
const unit = (v: Pt): Pt => {
  const l = Math.hypot(v.x, v.y);
  return { x: v.x / l, y: v.y / l };
};
const move = (p: Pt, v: Pt, k: number): Pt => ({ x: p.x + v.x * k, y: p.y + v.y * k });
const diff = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
const angleOf = (c: Pt, p: Pt) => Math.atan2(p.y - c.y, p.x - c.x);
const mod = (a: number) => ((a % TAU) + TAU) % TAU;

/* Arc of radius r around c from s to e, going round the side that `via`
   (a unit vector from c) points to. */
function arc(c: Pt, r: number, s: Pt, e: Pt, via: Pt) {
  const start = angleOf(c, s);
  const cw = mod(angleOf(c, e) - start);
  const viaAt = mod(Math.atan2(via.y, via.x) - start);
  const sweep = viaAt < cw ? 1 : 0;
  const span = sweep ? cw : TAU - cw;
  return `M${f(s.x)} ${f(s.y)}A${f(r)} ${f(r)} 0 ${span > Math.PI ? 1 : 0} ${sweep} ${f(e.x)} ${f(e.y)}`;
}

function ribbon(centers: Pt[], d: number) {
  const last = centers.length - 1;
  // unit normal of each segment between neighbouring centres
  const normals = centers.slice(1).map((c, i) => {
    const u = unit(diff(c, centers[i]));
    return { x: -u.y, y: u.x };
  });

  const lines = normals.flatMap((n, i) =>
    [d, -d].map((k) => {
      const p = move(centers[i], n, k);
      const q = move(centers[i + 1], n, k);
      return `M${f(p.x)} ${f(p.y)}L${f(q.x)} ${f(q.y)}`;
    })
  );

  const arcs = centers.map((c, i) => {
    if (i === 0 || i === last) {
      const n = normals[i === 0 ? 0 : last - 1];
      const neighbour = centers[i === 0 ? 1 : last - 1];
      return arc(c, d, move(c, n, d), move(c, n, -d), unit(diff(c, neighbour)));
    }
    // middle bubble: the arc skips the wedge facing both neighbours
    const toPrev = unit(diff(centers[i - 1], c));
    const toNext = unit(diff(centers[i + 1], c));
    const inward = unit({ x: toPrev.x + toNext.x, y: toPrev.y + toNext.y });
    const inner = [normals[i - 1], normals[i]].map((n) => {
      const p = move(c, n, d);
      return (p.x - c.x) * inward.x + (p.y - c.y) * inward.y > 0 ? p : move(c, n, -d);
    });
    return arc(c, d, inner[0], inner[1], { x: -inward.x, y: -inward.y });
  });

  return { lines: lines.join(""), arcs: arcs.join("") };
}

/* "خدمتنا" intro + the five service bubbles. On a service page, `active`
   highlights that service's bubble. */
export default function ServicesOverview({ active }: { active?: number }) {
  const t = useTranslations("ServicesOverview");

  return (
    <>
      {/* ── intro ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-12 md:py-16">
        <div className="pointer-events-none absolute start-0 top-10 h-[420px] w-[420px] rounded-full bg-teal/[0.07] blur-[150px]" />
        <div className="container-tk relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_440px] lg:gap-16">
          <div>
            <div className="flex items-center gap-5">
              {/* teal badge with a partial ring */}
              <div className="relative flex h-[118px] w-[118px] shrink-0 items-center justify-center">
                <span className="absolute inset-0 rounded-full border-[6px] border-teal/70 [clip-path:polygon(0_0,55%_0,55%_100%,0_100%)] rtl:[clip-path:polygon(45%_0,100%_0,100%_100%,45%_100%)]" />
                <span className="glow-pulse flex h-[92px] w-[92px] items-center justify-center rounded-full bg-gradient-to-br from-teal-cyan to-teal px-2 text-center text-[15px] font-bold leading-tight text-navy shadow-[0_0_40px_rgba(0,180,172,.45)] rtl:text-[19px]">
                  {t("badge")}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="glow-title text-[22px] font-bold text-white md:text-[26px]">{t("heading")}</h1>
                <div className="mt-3 flex items-center">
                  <span className="h-2 w-2 rounded-full bg-teal" />
                  <span className="h-px flex-1 bg-gradient-to-l from-teal/80 to-transparent rtl:bg-gradient-to-r" />
                </div>
              </div>
            </div>

            <p className="mt-8 text-justify text-[15px] leading-[2.1] text-white/90 md:text-[17px]">{t("p1")}</p>
            <p className="mt-3 text-justify text-[15px] leading-[2.1] text-iceblue md:text-[17px]">{t("p2")}</p>
            <div className="mt-8 h-px w-2/3 bg-gradient-to-l from-transparent via-white/30 to-transparent" />
          </div>

          {/* ringed circular photo */}
          <div className="relative mx-auto aspect-square w-full max-w-[440px]">
            <div className="absolute -inset-5 rounded-full border border-teal/25" />
            <div className="photo-ring-spin absolute -inset-2.5 rounded-full border-2 border-transparent border-s-teal/70 border-t-teal/70" />
            <div className="relative h-full w-full overflow-hidden rounded-full border-[5px] border-[#0b4a5e] shadow-[0_0_70px_rgba(0,180,172,.3)]">
              <Image
                src="/assets/services/overview.jpg"
                alt={t("imgAlt")}
                fill
                priority
                sizes="440px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <ServiceBubbles active={active} />
    </>
  );
}

/* The five-bubble chain on its own, reused on the home page.
   `embed` renders a plain div so the scroll-reveal treats the parent
   section as one unit. */
export function ServiceBubbles({ active, embed = false }: { active?: number; embed?: boolean }) {
  const Root = embed ? "div" : "section";
  return (
    <Root className={`relative overflow-hidden ${embed ? "py-4" : "py-10 md:py-14"}`}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] binary-bg" />
      <div className="container-tk relative">
        <Stage layout={WIDE} active={active} className="hidden lg:block" />
        <Stage layout={TALL} active={active} className="mx-auto max-w-[486px] lg:hidden" />
      </div>
    </Root>
  );
}

/* The bubbles laid over the ribbon. Everything is sized from the stage
   width (see .svc-* in globals.css), so the picture scales as one piece. */
function Stage({ layout, active, className }: { layout: Layout; active?: number; className: string }) {
  const t = useTranslations("ServicesOverview");
  const { w, h, centers } = layout;
  const { lines, arcs } = ribbon(centers, D);
  const style = { aspectRatio: `${w} / ${h}`, "--r": `${(R / w) * 100}cqw` } as CSSProperties;

  return (
    <div className={`svc-stage stagger relative w-full ${className}`} style={style}>
      <svg
        aria-hidden
        viewBox={`0 0 ${w} ${h}`}
        className="absolute inset-0 h-full w-full overflow-visible rtl:-scale-x-100"
      >
        <g fill="none" strokeWidth="1.4" strokeLinecap="round">
          <path d={arcs} stroke="rgba(70,190,200,.5)" vectorEffect="non-scaling-stroke" />
          <path d={lines} stroke="rgba(70,190,200,.55)" vectorEffect="non-scaling-stroke" />
        </g>
        {/* light pulses travelling along the ribbon */}
        <g fill="none" stroke="rgba(120,225,235,.95)" strokeWidth="1.8" strokeLinecap="round">
          <path className="line-flow" pathLength={100} d={lines} vectorEffect="non-scaling-stroke" />
          <path className="line-flow" pathLength={100} d={lines} vectorEffect="non-scaling-stroke" style={{ animationDelay: "-3.5s" }} />
        </g>
      </svg>

      {centers.map((c, i) => (
        <div
          key={SERVICE_LINKS[i]}
          className="absolute -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
          style={{ insetInlineStart: `${(c.x / w) * 100}%`, top: `${(c.y / h) * 100}%` }}
        >
          <Pin href={SERVICE_LINKS[i]} active={i === active} title={t(`items.${i}.title`)} tagline={t(`items.${i}.tagline`)} />
        </div>
      ))}
    </div>
  );
}

/* One service bubble, as in the design: a navy disc with a thin teal ring
   and a shadow falling to the bottom-left; inside, the bold title over a
   short teal rule, the tagline, and a small teal triangle. */
function Pin({ href, active, title, tagline }: { href: string; active: boolean; title: string; tagline: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`svc-pin group relative flex items-center justify-center rounded-full bg-navy ${active ? "svc-pin-active" : ""}`}
    >
      {active && <span aria-hidden className="glow-halo absolute inset-[8%] rounded-full" />}
      {/* thin ring at the disc's edge */}
      <span
        aria-hidden
        className={`absolute inset-0 rounded-full border-[1.5px] transition-colors duration-500 ${
          active ? "border-teal-cyan" : "border-teal/60 group-hover:border-teal-cyan"
        }`}
      />
      <span className="svc-pin-body relative flex flex-col items-center text-center">
        <span className={`svc-title font-bold ${active ? "text-teal-cyan" : "text-white"}`}>{title}</span>
        <span aria-hidden className="svc-rule bg-teal" />
        <span className="svc-tag font-light text-white/90">{tagline}</span>
        <span aria-hidden className="svc-tri" />
      </span>
    </Link>
  );
}
