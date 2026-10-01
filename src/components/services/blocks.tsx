import Image from "@/components/SiteImage";
import { useTranslations } from "next-intl";

type Item = { title: string; desc: string };

/* Service heading: teal title pill with the tagline beside it, intro
   paragraph on the other side. */
export function ServiceIntro({
  title,
  tagline,
  intro,
}: {
  title: string;
  tagline: string;
  intro: string;
}) {
  return (
    <section className="relative py-12 md:py-16">
      <div className="container-tk grid grid-cols-1 items-center gap-8 lg:grid-cols-[auto_1fr] lg:gap-14">
        <div className="flex flex-wrap items-center gap-5">
          <h2 className="glow-pulse rounded-[16px] border border-white/25 bg-gradient-to-br from-teal-cyan via-teal to-[#008f89] px-7 py-4 text-center text-[20px] font-bold leading-snug text-white shadow-[0_14px_36px_rgba(0,180,172,.35),inset_0_1px_0_rgba(255,255,255,.35)] md:text-[24px]">
            {title}
          </h2>
          <p className="max-w-[220px] text-[16px] font-bold leading-relaxed text-iceblue md:text-[18px]">{tagline}</p>
        </div>
        <div>
          <span className="mb-4 block h-px w-full bg-gradient-to-l from-teal/70 via-teal/20 to-transparent rtl:bg-gradient-to-r" />
          <p className="text-justify text-[15px] leading-[2.05] text-white/85 md:text-[17px]">{intro}</p>
        </div>
      </div>
    </section>
  );
}

/* Card with its title in a tab sitting on the top border. */
function ItemCard({ item, index }: { item: Item; index?: number }) {
  return (
    <article className="group relative h-full pt-6">
      <h3 className="absolute start-6 top-0 z-10 flex max-w-[85%] items-center gap-2 rounded-[10px] border border-teal/60 bg-[#073044] px-4 py-2 text-[14px] font-bold leading-snug text-white shadow-[0_8px_20px_rgba(0,10,20,.35)] md:text-[15px]">
        {index !== undefined && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal font-exo text-[12px] text-navy">
            {index + 1}
          </span>
        )}
        {item.title}
      </h3>
      <div className="h-full rounded-[18px] border border-teal/35 bg-[#062a3d]/80 px-6 pb-5 pt-9 transition-colors duration-300 group-hover:border-teal/70">
        <p className="text-[13.5px] leading-[1.95] text-steel md:text-[14.5px]">{item.desc}</p>
      </div>
    </article>
  );
}

/* Round label with double ring, the centre of every hub layout. */
function Hub({ label, size = "md" }: { label: string; size?: "md" | "lg" }) {
  const dims = size === "lg" ? "h-[230px] w-[230px] md:h-[250px] md:w-[250px]" : "h-[190px] w-[190px] md:h-[210px] md:w-[210px]";
  return (
    <div className={`relative mx-auto flex shrink-0 items-center justify-center ${dims}`}>
      <span className="absolute -inset-4 rounded-full border border-teal/20" />
      <span className="absolute -inset-2 rounded-full border-2 border-transparent border-b-teal/60 border-t-teal/60" />
      <div className="glow-pulse relative flex h-full w-full items-center justify-center rounded-full border-2 border-teal/60 bg-gradient-to-br from-[#0b4155] to-[#052536] p-7 text-center shadow-[0_0_60px_rgba(0,180,172,.28)]">
        <span className="text-[17px] font-bold leading-snug text-white md:text-[19px]">{label}</span>
      </div>
    </div>
  );
}

/* Hub with the cards around it:
   - "sides":  cards split to both sides, lines from the hub to each card
   - "below":  hub on top, a bracket of lines down to a row of cards
   - "column": hub at the start, cards stacked beside it */
export function FeatureHub({
  hub,
  items,
  layout = "sides",
  split = "columns",
  numbered = false,
}: {
  hub: string;
  items: Item[];
  layout?: "sides" | "below" | "column";
  /* "sides" only: fill one side then the other, or alternate row by row */
  split?: "columns" | "rows";
  numbered?: boolean;
}) {
  const card = (item: Item, i: number) => (
    <ItemCard key={i} item={item} index={numbered ? i : undefined} />
  );

  if (layout === "below") {
    return (
      <div className="flex flex-col items-center">
        <Hub label={hub} />
        {/* bracket: stem, cross bar, three drops */}
        <div aria-hidden className="relative hidden h-16 w-full md:block">
          <span className="absolute start-1/2 top-4 h-6 w-px bg-teal/50" />
          <span className="absolute inset-x-[16.66%] top-10 h-px bg-teal/50" />
          {[16.66, 50, 83.33].map((x) => (
            <span key={x} className="absolute top-10 h-6 w-px bg-teal/50" style={{ insetInlineStart: `${x}%` }} />
          ))}
        </div>
        <div className="stagger mt-8 grid w-full grid-cols-1 gap-8 md:mt-0 md:grid-cols-3">{items.map(card)}</div>
      </div>
    );
  }

  if (layout === "column") {
    return (
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[auto_1fr]">
        <Hub label={hub} />
        <div className="stagger relative flex flex-col gap-8 md:ps-10">
          <span aria-hidden className="absolute inset-y-8 start-0 hidden w-px bg-teal/40 md:block" />
          {items.map((item, i) => (
            <div key={i} className="relative">
              <span aria-hidden className="absolute -start-10 top-[18px] hidden h-px w-10 bg-teal/40 md:block" />
              {card(item, i)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const half = Math.ceil(items.length / 2);
  const rows = half;
  const indexed = items.map((item, i) => ({ item, i }));
  const [startSide, endSide] =
    split === "rows"
      ? [indexed.filter(({ i }) => i % 2 === 0), indexed.filter(({ i }) => i % 2 === 1)]
      : [indexed.slice(0, half), indexed.slice(half)];
  // y position (%) of each card's title tab, for the connector lines
  const rowY = (r: number) => ((r + 0.5) / rows) * 100 - (rows > 2 ? 6 : 12);
  return (
    <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-16">
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {Array.from({ length: rows }, (_, r) => (
          <g key={r} stroke="rgba(0,180,172,.45)" strokeWidth="1.2" fill="none">
            <polyline points={`36,${rowY(r)} 42,${rowY(r)} 50,50`} vectorEffect="non-scaling-stroke" />
            <polyline points={`64,${rowY(r)} 58,${rowY(r)} 50,50`} vectorEffect="non-scaling-stroke" />
            <polyline
              className="line-flow" pathLength={100}
              points={`36,${rowY(r)} 42,${rowY(r)} 50,50`}
              stroke="rgba(68,197,207,.85)" strokeWidth="1.6" strokeLinecap="round"
              vectorEffect="non-scaling-stroke" style={{ animationDelay: `${r * -1.7}s` }}
            />
            <polyline
              className="line-flow" pathLength={100}
              points={`64,${rowY(r)} 58,${rowY(r)} 50,50`}
              stroke="rgba(68,197,207,.85)" strokeWidth="1.6" strokeLinecap="round"
              vectorEffect="non-scaling-stroke" style={{ animationDelay: `${r * -1.7 - 0.9}s` }}
            />
          </g>
        ))}
      </svg>
      <div className="relative lg:order-2">
        <Hub label={hub} size={items.length > 4 ? "lg" : "md"} />
      </div>
      <div className="relative flex flex-col gap-8 lg:order-1">{startSide.map(({ item, i }) => card(item, i))}</div>
      <div className="relative flex flex-col gap-8 lg:order-3">{endSide.map(({ item, i }) => card(item, i))}</div>
    </div>
  );
}

/* Full-width photo with the round "النتيجة" badge and the outcome text. */
export function ResultBanner({
  image,
  title,
  text,
}: {
  image?: string;
  title: string;
  text: string;
}) {
  const t = useTranslations("ServiceBlocks");
  if (!image) {
    // text-only result panel, as some sections in the designs
    return (
      <section className="relative py-8 md:py-10">
        <div className="container-tk">
          <div className="relative overflow-hidden rounded-[28px] border border-teal/30 bg-gradient-to-b from-[#0b4155] to-[#052536] p-8 md:p-12">
            <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />
            <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-10">
              <span className="glow-pulse flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-cyan to-teal text-[17px] font-bold text-white shadow-[0_0_40px_rgba(0,180,172,.5)]">
                {t("result")}
              </span>
              <div>
                <h3 className="text-[22px] font-bold leading-[1.5] text-white md:text-[27px]">{title}</h3>
                <p className="mt-2 text-[15px] leading-[1.95] text-iceblue md:text-[17px]">{text}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="relative my-8 min-h-[480px] overflow-hidden md:min-h-[560px]">
      <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 from-navy from-5% via-navy/75 via-40% to-navy/5 ltr:bg-gradient-to-r rtl:bg-gradient-to-l" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-navy to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy to-transparent" />
      <div className="container-tk relative flex min-h-[480px] flex-col justify-center py-14 md:min-h-[560px]">
        <div className="max-w-[560px]">
          <div className="relative flex h-[104px] w-[104px] items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-teal/40" />
            <span className="glow-pulse flex h-[86px] w-[86px] items-center justify-center rounded-full bg-gradient-to-br from-teal-cyan to-teal text-[18px] font-bold text-white shadow-[0_0_40px_rgba(0,180,172,.5)]">
              {t("result")}
            </span>
          </div>
          <h3 className="mt-6 text-[26px] font-bold leading-[1.45] text-white md:text-[34px]">{title}</h3>
          <p className="mt-3 text-[15px] leading-[1.95] text-iceblue md:text-[18px]">{text}</p>
        </div>
      </div>
    </section>
  );
}

/* Outlined title box used above the marketing sub-sections. */
export function BlockTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="glow-title mb-8 inline-block rounded-[14px] border border-teal/60 bg-gradient-to-b from-white/[0.08] to-white/[0.02] px-6 py-3 text-[20px] font-bold leading-snug text-white shadow-[inset_0_1px_0_rgba(255,255,255,.12)] md:text-[24px]">
      {children}
    </h2>
  );
}

/* Numbered strip of a service's sub-services, as in the designs'
   "منهجيتنا" row. */
export function MethodStrip({ items }: { items: string[] }) {
  return (
    <section className="relative py-8 md:py-10">
      <div className="container-tk">
        <ol className={`stagger grid grid-cols-2 gap-4 sm:grid-cols-3 ${items.length > 5 ? "lg:grid-cols-6" : "lg:grid-cols-5"}`}>
          {items.map((label, i) => (
            <li
              key={i}
              className="relative rounded-[16px] border border-teal/40 bg-gradient-to-b from-[#0b4155] to-[#062a3d] px-4 pb-4 pt-7 text-center shadow-[0_10px_26px_rgba(0,10,20,.35)] transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="absolute -top-4 start-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-teal font-exo text-[15px] font-bold text-navy shadow-[0_0_18px_rgba(0,180,172,.55)] rtl:translate-x-1/2">
                {i + 1}
              </span>
              <span className="text-[13px] font-bold leading-snug text-white md:text-[14.5px]">{label}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

type SubServiceProps = {
  /* messages namespace and the key of the section inside it */
  ns: string;
  section: string;
  /* photo shown beside the section description */
  photo?: string;
  /* photo shown beside the hub block */
  sidePhoto?: string;
  /* photo of the "النتيجة" banner; omitted = no banner */
  resultImage?: string;
  hubLayout?: "sides" | "below" | "column";
  split?: "columns" | "rows";
  band?: boolean;
};

/* One sub-service, following the PDFs' rhythm: title box + description
   (+ photo), the feature hub (+ photo), then the result banner. */
export function SubService({
  ns,
  section,
  photo,
  sidePhoto,
  resultImage,
  hubLayout = "sides",
  split = "columns",
  band = false,
}: SubServiceProps) {
  const t = useTranslations(ns);
  const base = section;
  const items = t.raw(`${base}.items`) as Item[];

  return (
    <>
      <section className="relative py-12 md:py-16">
        {band && (
          <>
            <div className="absolute inset-x-0 top-1/2 h-full -translate-y-1/2 bg-gradient-to-b from-navy via-navy-deep to-navy" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />
          </>
        )}
        <div className="container-tk relative">
          <div className={photo ? "mb-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]" : "mb-12"}>
            <div>
              <BlockTitle>{t(`${base}.heading`)}</BlockTitle>
              <p className="max-w-[900px] text-justify text-[15px] leading-[2.05] text-iceblue md:text-[17px]">
                {t(`${base}.desc`)}
              </p>
            </div>
            {photo && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-teal/30 shadow-[0_20px_50px_rgba(0,10,20,.45)]">
                <Image src={photo} alt={t(`${base}.heading`)} fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
              </div>
            )}
          </div>

          {sidePhoto ? (
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.35fr_1fr]">
              <FeatureHub hub={t(`${base}.hub`)} items={items} layout="column" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-teal/30 shadow-[0_20px_50px_rgba(0,10,20,.45)]">
                <Image src={sidePhoto} alt="" fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover" />
              </div>
            </div>
          ) : (
            <FeatureHub hub={t(`${base}.hub`)} items={items} layout={hubLayout} split={split} />
          )}
        </div>
      </section>

      {resultImage && (
        <ResultBanner image={resultImage} title={t(`${base}.resultTitle`)} text={t(`${base}.resultText`)} />
      )}
    </>
  );
}
