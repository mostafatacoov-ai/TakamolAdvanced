import Image from "@/components/SiteImage";
import { BlockTitle } from "@/components/services/blocks";

type Stage = { title: string; desc: string };

/* Three photos on a line: the land → development → project journey. */
export default function StageStrip({ title, items, images }: { title: string; items: Stage[]; images: string[] }) {
  return (
    <section className="relative py-10 md:py-14">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />
      <div className="container-tk relative">
        <BlockTitle>{title}</BlockTitle>

        <div className="relative">
          {/* thread behind the photos */}
          <svg aria-hidden className="absolute inset-x-0 top-[26%] hidden h-2 w-full md:block" viewBox="0 0 100 4" preserveAspectRatio="none">
            <line x1="0" y1="2" x2="100" y2="2" stroke="rgba(214,233,242,.3)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line className="line-flow" pathLength={100} x1="0" y1="2" x2="100" y2="2" stroke="rgba(68,197,207,.9)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          </svg>

          <ol className="stagger relative grid grid-cols-1 gap-8 md:grid-cols-3">
            {items.map((it, i) => (
              <li key={i} className="group relative">
                <div className="relative aspect-[16/9] overflow-hidden rounded-[22px] border border-teal/30 shadow-[0_20px_50px_rgba(0,10,20,.45)]">
                  <Image
                    src={images[i]}
                    alt={it.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
                  <span className="glow-pulse absolute start-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-teal font-exo text-[15px] font-bold text-navy">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-[18px] font-bold text-white md:text-[20px]">{it.title}</h3>
                <p className="mt-1.5 text-[14px] leading-[1.9] text-steel md:text-[15px]">{it.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
