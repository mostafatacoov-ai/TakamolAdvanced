import Image from "@/components/SiteImage";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

const IMG = "/assets/products";

/* The two platforms, in the same bubble language as the services chain:
   a photo-filled circle with thin rings, three satellite screenshots and a
   short description. Photos are square, pre-sized crops of the platform
   screenshots. */
export const PRODUCTS = [
  {
    key: "realForsa",
    href: "/platforms/real-fursa",
    photo: `${IMG}/forsa-main.jpg`,
    shots: [`${IMG}/forsa-1.jpg`, `${IMG}/forsa-2.jpg`, `${IMG}/forsa-3.jpg`],
    pos: { x: 28, y: 46 },
    arc: 205,
    side: "start",
  },
  {
    key: "realInvest",
    href: "/platforms/real-invest",
    photo: `${IMG}/invest-main.jpg`,
    shots: [`${IMG}/invest-1.jpg`, `${IMG}/invest-2.jpg`, `${IMG}/invest-3.jpg`],
    pos: { x: 72, y: 46 },
    arc: 25,
    side: "end",
  },
] as const;

export type Product = (typeof PRODUCTS)[number];

/* satellite screenshot offsets around the bubble, per side */
const SHOT_POS = {
  start: ["-top-[0.5em] start-[1.5em]", "top-[44%] -start-[2.5em] hidden sm:block", "-bottom-[0.25em] start-[2.5em]"],
  end: ["-top-[0.5em] end-[1.5em]", "top-[44%] -end-[2.5em] hidden sm:block", "-bottom-[0.25em] end-[2.5em]"],
} as const;

/* The bubble pair. `active` highlights the current product's bubble on
   product pages; `embed` renders a div for use inside another section. */
export function ProductBubbles({ active, embed = false }: { active?: number; embed?: boolean }) {
  const Root = embed ? "div" : "section";
  return (
    <Root className={`relative overflow-hidden ${embed ? "py-2" : "py-8 md:py-12"}`}>
      {!embed && <div className="pointer-events-none absolute inset-0 opacity-[0.06] binary-bg" />}

      {/* desktop: two bubbles threaded by thin diagonal lines */}
      <div className="container-tk relative hidden lg:block">
        <div className="stagger relative h-[560px]">
          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full rtl:-scale-x-100"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <g stroke="rgba(214,233,242,.28)" strokeWidth="1.2" fill="none">
              <polyline points="-6,92 28,46 72,46 106,2" vectorEffect="non-scaling-stroke" />
              <polyline points="-6,2 28,46" vectorEffect="non-scaling-stroke" />
              <polyline points="72,46 106,92" vectorEffect="non-scaling-stroke" />
            </g>
            <g stroke="rgba(68,197,207,.9)" strokeWidth="1.6" fill="none" strokeLinecap="round">
              <polyline className="line-flow" pathLength={100} points="-6,92 28,46 72,46 106,2" vectorEffect="non-scaling-stroke" />
              <polyline className="line-flow" pathLength={100} points="-6,2 28,46" vectorEffect="non-scaling-stroke" style={{ animationDelay: "-3s" }} />
              <polyline className="line-flow" pathLength={100} points="72,46 106,92" vectorEffect="non-scaling-stroke" style={{ animationDelay: "-5s" }} />
            </g>
          </svg>
          {PRODUCTS.map((p, i) => (
            <div
              key={p.key}
              className="absolute -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
              style={{ insetInlineStart: `${p.pos.x}%`, top: `${p.pos.y}%` }}
            >
              <ProductBubble product={p} index={i} active={i === active} />
            </div>
          ))}
        </div>
      </div>

      {/* phones & tablets: the two bubbles side by side in one row, sized
          from the row's width (see .prod-row / .prod-bubble in globals.css) */}
      <div className="prod-row stagger container-tk relative mt-4 flex items-start justify-between gap-3 sm:justify-evenly lg:hidden">
        {PRODUCTS.map((p, i) => (
          <ProductBubble key={p.key} product={p} index={i} active={i === active} />
        ))}
      </div>
    </Root>
  );
}

/* Everything inside the bubble is measured in em, so one font-size on the
   root (.prod-bubble) scales the whole bubble: 1em = 16px at 340px. */
export function ProductBubble({ product, index, active = false }: { product: Product; index: number; active?: boolean }) {
  const t = useTranslations("OurProducts");
  const gid = `prodGrad${index}`;

  return (
    <div className="prod-bubble flex w-[21.25em] max-w-full flex-col items-center">
      <div className="relative">
        <Link
          href={product.href}
          aria-current={active ? "page" : undefined}
          className="pin-float group relative flex h-[21.25em] w-[21.25em] items-end justify-center pb-[2.5em] transition-transform duration-500 hover:scale-[1.03]"
          style={{ animationDelay: `${index * -2.6}s` }}
        >
          <span aria-hidden className="glow-halo absolute inset-[2px] rounded-full" style={{ animationDelay: `${index * -2}s` }} />

          {/* photo body */}
          <span
            aria-hidden
            className={`absolute inset-[0.75em] overflow-hidden rounded-full transition-shadow duration-500 ${
              active
                ? "shadow-[0_1.6em_3.4em_rgba(0,5,15,.55),0_0_3.75em_rgba(0,180,172,.35)]"
                : "shadow-[0_1.6em_3.4em_rgba(0,5,15,.55)] group-hover:shadow-[0_1.6em_3.4em_rgba(0,5,15,.55),0_0_2.8em_rgba(0,180,172,.2)]"
            }`}
          >
            <Image
              src={product.photo}
              alt=""
              fill
              sizes="340px"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-[#041e2d] via-[#041e2d]/75 via-45% to-[#041e2d]/5" />
          </span>

          {/* rings */}
          <svg aria-hidden viewBox="0 0 342 342" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#44C5CF" />
                <stop offset="1" stopColor="#00B4AC" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <circle cx="171" cy="171" r="158" fill="none" stroke="rgba(0,180,172,.4)" strokeWidth="1.5" />
            <g className="arc-spin-slow">
              <g transform={`rotate(${product.arc} 171 171)`}>
                <circle
                  cx="171" cy="171" r="158" fill="none"
                  stroke={`url(#${gid})`} strokeWidth={active ? 5.5 : 4}
                  strokeLinecap="round" strokeDasharray="380 613"
                />
              </g>
            </g>
            <g className="arc-spin">
              <g transform={`rotate(${product.arc + 140} 171 171)`}>
                <circle cx="171" cy="171" r="167" fill="none" stroke="rgba(120,200,205,.4)" strokeWidth="1.2" strokeDasharray="420 629" strokeLinecap="round" />
              </g>
            </g>
          </svg>

          {/* content */}
          <span className="relative flex max-w-[15.6em] flex-col items-center text-center transition-transform duration-500 group-hover:-translate-y-0.5">
            <span className={`prod-title font-bold leading-[1.45] ${active ? "text-teal-cyan" : "text-white"}`}>{t(`${product.key}Title`)}</span>
            <span className="prod-tag mt-[0.4em] font-light leading-[1.8] text-iceblue/90">{t(`${product.key}Tag`)}</span>
            <span aria-hidden className="mt-[0.75em] h-0 w-0 border-x-[0.5625em] border-t-[0.625em] border-x-transparent border-t-teal-cyan" />
          </span>
        </Link>

        {/* satellite screenshots */}
        {product.shots.map((src, s) => (
          <span
            key={src}
            aria-hidden
            className={`pin-float absolute z-10 h-[5.25em] w-[5.25em] overflow-hidden rounded-full border-2 border-teal/50 bg-navy shadow-[0_10px_30px_rgba(0,10,20,.5),0_0_20px_rgba(0,180,172,.25)] ${SHOT_POS[product.side][s]}`}
            style={{ animationDelay: `${(index * 3 + s) * -1.7}s` }}
          >
            <Image src={src} alt="" fill sizes="84px" className="object-cover" />
          </span>
        ))}
      </div>

      <p className="prod-desc mt-4 max-w-[20em] text-center leading-[1.8] text-steel md:mt-5">{t(`${product.key}Desc`)}</p>
    </div>
  );
}
