import Image from "@/components/SiteImage";
import ProductCta from "@/components/products/ProductCta";
import { BlockTitle, FeatureHub, MethodStrip, ResultBanner, ServiceIntro } from "@/components/services/blocks";
import type { Block } from "@/lib/blocks";
import { pick, type Localized } from "@/lib/site-types";

/* Renders the sections of a page built in the admin area, using the same
   design elements as the rest of the site. */

const paragraphs = (text: string) =>
  text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

function Paragraphs({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`space-y-4 text-[15px] leading-[2] text-iceblue md:text-[17px] ${className}`}>
      {paragraphs(text).map((p, i) => (
        <p key={i} className="whitespace-pre-line">{p}</p>
      ))}
    </div>
  );
}

export default function PageBlocks({ blocks, locale }: { blocks: Block[]; locale: string }) {
  return (
    <>
      {blocks.map((block, i) => (
        <BlockView key={block.id} block={block} locale={locale} first={i === 0} />
      ))}
    </>
  );
}

function BlockView({ block, locale, first }: { block: Block; locale: string; first: boolean }) {
  const L = (value: Localized) => pick(value, locale);

  switch (block.type) {
    case "hero": {
      const Heading = first ? "h1" : "h2";
      return (
        <section className="relative min-h-[420px] overflow-hidden md:min-h-[520px]">
          <div className="absolute inset-0">
            {block.image ? (
              <>
                <Image src={block.image} alt="" fill priority={first} sizes="100vw" className="object-cover" />
                <div className="absolute inset-0 from-navy/[.94] via-navy/65 to-navy/30 ltr:bg-gradient-to-r rtl:bg-gradient-to-l" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-navy-deep to-navy">
                <div className="pointer-events-none absolute inset-0 opacity-[0.06] binary-bg" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-navy to-transparent" />
          </div>
          <div className={`container-tk relative flex min-h-[420px] flex-col justify-center pb-12 md:min-h-[520px] ${first ? "pt-[110px]" : "pt-12"}`}>
            <div className="max-w-[820px]">
              <Heading className="glow-title text-[30px] font-bold leading-[1.3] text-white md:text-[42px] lg:text-[48px]">
                {L(block.title)}
              </Heading>
              {L(block.subtitle) && (
                <p className="mt-4 max-w-[720px] whitespace-pre-line text-[16px] font-light leading-[1.9] text-white/90 md:text-[19px]">
                  {L(block.subtitle)}
                </p>
              )}
            </div>
          </div>
        </section>
      );
    }

    case "intro":
      return <ServiceIntro title={L(block.title)} tagline={L(block.tagline)} intro={L(block.text)} />;

    case "text":
      if (!L(block.title) && !L(block.text)) return null;
      return (
        <section className="relative py-10 md:py-14">
          <div className="container-tk">
            {L(block.title) && <BlockTitle>{L(block.title)}</BlockTitle>}
            <Paragraphs text={L(block.text)} className="max-w-[920px]" />
          </div>
        </section>
      );

    case "imageText": {
      const imageFirst = block.imageSide === "start";
      return (
        <section className="relative py-10 md:py-14">
          <div className="container-tk grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            {block.image && (
              <div className={`relative aspect-[4/3] overflow-hidden rounded-[24px] border border-teal/30 shadow-[0_20px_50px_rgba(0,10,20,.45)] ${imageFirst ? "lg:order-1" : "lg:order-2"}`}>
                <Image src={block.image} alt={L(block.title)} fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" />
              </div>
            )}
            <div className={imageFirst ? "lg:order-2" : "lg:order-1"}>
              {L(block.title) && <BlockTitle>{L(block.title)}</BlockTitle>}
              <Paragraphs text={L(block.text)} />
            </div>
          </div>
        </section>
      );
    }

    case "features":
      if (!block.items.length) return null;
      return (
        <section className="relative py-12 md:py-16">
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />
          <div className="container-tk relative">
            <FeatureHub
              hub={L(block.hub)}
              items={block.items.map((i) => ({ title: L(i.title), desc: L(i.desc) }))}
              layout={block.layout}
            />
          </div>
        </section>
      );

    case "steps":
      return block.items.length ? <MethodStrip items={block.items.map(L)} /> : null;

    case "cards":
      if (!block.items.length) return null;
      return (
        <section className="relative py-10 md:py-14">
          <div className="container-tk">
            {L(block.title) && <BlockTitle>{L(block.title)}</BlockTitle>}
            <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {block.items.map((card, i) => (
                <article
                  key={i}
                  className="group overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1.5 hover:border-teal/50"
                >
                  {card.image && (
                    <div className="relative aspect-[16/10]">
                      <Image src={card.image} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-[18px] font-bold text-white md:text-[19px]">{L(card.title)}</h3>
                    <div className="mt-3 h-px w-12 bg-gradient-to-l from-transparent via-teal to-transparent" />
                    <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.9] text-steel md:text-[15px]">{L(card.desc)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      );

    case "banner":
      return <ResultBanner image={block.image || undefined} title={L(block.title)} text={L(block.text)} />;

    case "cta":
      return (
        <ProductCta
          title={L(block.title)}
          text={L(block.text)}
          primary={{ label: L(block.button), href: block.href }}
        />
      );

    case "gallery":
      if (!block.images.length) return null;
      return (
        <section className="relative py-10 md:py-14">
          <div className="container-tk">
            <div className="stagger grid grid-cols-2 gap-4 md:grid-cols-3">
              {block.images.map((src, i) => (
                <div key={`${src}-${i}`} className="relative aspect-[4/3] overflow-hidden rounded-[18px] border border-white/10">
                  <Image src={src} alt="" fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-700 hover:scale-105" />
                </div>
              ))}
            </div>
          </div>
        </section>
      );
  }
}
