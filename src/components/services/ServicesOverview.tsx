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

/* Where each bubble sits in the 3-over-2 arrangement on desktop, as % of the
   stage (reading-direction start first, so RTL starts on the right). */
const PIN_POS = [
  { x: 16, y: 26 },
  { x: 34, y: 72 },
  { x: 50, y: 26 },
  { x: 66, y: 72 },
  { x: 84, y: 26 },
];

/* Rotation of each bubble's crescent + outer arc, so the highlight travels
   around the chain like in the design. */
const ARC_ROT = [205, 25, 155, 335, 65];

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
  const t = useTranslations("ServicesOverview");
  const Root = embed ? "div" : "section";
  return (
    <>
      {/* ── service bubbles ──────────────────────────────── */}
      <Root className={`relative overflow-hidden ${embed ? "py-2" : "py-10 md:py-14"}`}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] binary-bg" />

        {/* desktop: 3-over-2 bubbles threaded by thin diagonal lines */}
        <div className="container-tk relative hidden lg:block">
          <div className="stagger relative h-[620px]">
            <svg
              aria-hidden
              className="absolute inset-0 h-full w-full rtl:-scale-x-100"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <g stroke="rgba(214,233,242,.28)" strokeWidth="1.2" fill="none">
                <polyline points="-4,78 16,26 34,72 50,26 66,72 84,26 104,78" vectorEffect="non-scaling-stroke" />
                <polyline points="-4,-10 16,26 34,72" vectorEffect="non-scaling-stroke" />
                <polyline points="66,72 84,26 104,-10" vectorEffect="non-scaling-stroke" />
                <polyline points="34,72 26,110" vectorEffect="non-scaling-stroke" />
                <polyline points="66,72 74,110" vectorEffect="non-scaling-stroke" />
              </g>
              {/* light pulses travelling along the lines */}
              <g stroke="rgba(68,197,207,.9)" strokeWidth="1.6" fill="none" strokeLinecap="round">
                <polyline className="line-flow" pathLength={100} points="-4,78 16,26 34,72 50,26 66,72 84,26 104,78" vectorEffect="non-scaling-stroke" />
                <polyline className="line-flow" pathLength={100} points="-4,-10 16,26 34,72" vectorEffect="non-scaling-stroke" style={{ animationDelay: "-2.4s" }} />
                <polyline className="line-flow" pathLength={100} points="66,72 84,26 104,-10" vectorEffect="non-scaling-stroke" style={{ animationDelay: "-4.8s" }} />
              </g>
            </svg>
            {SERVICE_LINKS.map((href, i) => (
              <div
                key={href}
                className="absolute -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
                style={{ insetInlineStart: `${PIN_POS[i].x}%`, top: `${PIN_POS[i].y}%` }}
              >
                <Pin href={href} index={i} active={i === active} title={t(`items.${i}.title`)} tagline={t(`items.${i}.tagline`)} />
              </div>
            ))}
          </div>
        </div>

        {/* phones & tablets: simple grid */}
        <div className="stagger container-tk relative grid grid-cols-1 justify-items-center gap-10 py-4 sm:grid-cols-2 lg:hidden">
          {SERVICE_LINKS.map((href, i) => (
            <Pin key={href} href={href} index={i} active={i === active} title={t(`items.${i}.title`)} tagline={t(`items.${i}.tagline`)} />
          ))}
        </div>
      </Root>
    </>
  );
}

/* One service bubble, as in the design: a dark circle with a thin ring,
   a brighter teal crescent, and an outer arc suggesting the path that
   threads the chain. Floats gently; the active page's bubble glows. */
function Pin({
  href,
  index,
  active,
  title,
  tagline,
}: {
  href: string;
  index: number;
  active: boolean;
  title: string;
  tagline: string;
}) {
  const gid = `pinGrad${index}`;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="pin-float group relative flex h-[270px] w-[270px] items-center justify-center transition-transform duration-500 hover:scale-[1.04]"
      style={{ animationDelay: `${index * -1.3}s` }}
    >
      {/* breathing teal halo behind the bubble */}
      <span
        aria-hidden
        className="glow-halo absolute inset-[2px] rounded-full"
        style={{ animationDelay: `${index * -1.9}s` }}
      />
      {/* body */}
      <span
        aria-hidden
        className={`absolute inset-[10px] rounded-full bg-[radial-gradient(circle_at_50%_18%,#0d4459_0%,#083247_55%,#041e2d_100%)] transition-shadow duration-500 ${
          active
            ? "shadow-[0_26px_55px_rgba(0,5,15,.55),0_0_60px_rgba(0,180,172,.3)]"
            : "shadow-[0_26px_55px_rgba(0,5,15,.55)] group-hover:shadow-[0_26px_55px_rgba(0,5,15,.55),0_0_45px_rgba(0,180,172,.2)]"
        }`}
      />
      {/* rings */}
      <svg aria-hidden viewBox="0 0 272 272" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#44C5CF" />
            <stop offset="1" stopColor="#00B4AC" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {/* thin full ring at the body's edge */}
        <circle cx="136" cy="136" r="126" fill="none" stroke="rgba(0,180,172,.35)" strokeWidth="1.5" />
        {/* brighter crescent on the ring, drifting slowly */}
        <g className="arc-spin-slow">
          <g transform={`rotate(${ARC_ROT[index]} 136 136)`}>
            <circle
              cx="136" cy="136" r="126" fill="none"
              stroke={`url(#${gid})`}
              strokeWidth={active ? 5 : 3.5}
              strokeLinecap="round"
              strokeDasharray="300 492"
              className={active ? undefined : "opacity-80"}
            />
          </g>
        </g>
        {/* outer thin arc: the path looping around the bubble, orbiting */}
        <g className="arc-spin">
          <g transform={`rotate(${ARC_ROT[index] + 140} 136 136)`}>
            <circle
              cx="136" cy="136" r="134" fill="none"
              stroke="rgba(120,200,205,.4)" strokeWidth="1.2"
              strokeDasharray="340 502" strokeLinecap="round"
            />
          </g>
        </g>
      </svg>

      {/* content */}
      <span className="relative flex max-w-[190px] flex-col items-center text-center transition-transform duration-500 group-hover:-translate-y-0.5">
        <span className={`text-[17px] font-bold leading-[1.55] ${active ? "text-teal-cyan" : "text-white"}`}>{title}</span>
        <span className="mt-2.5 text-[13px] font-light leading-[1.8] text-iceblue/90">{tagline}</span>
        <span aria-hidden className="mt-3.5 h-0 w-0 border-x-[9px] border-t-[10px] border-x-transparent border-t-teal-cyan" />
      </span>
    </Link>
  );
}
