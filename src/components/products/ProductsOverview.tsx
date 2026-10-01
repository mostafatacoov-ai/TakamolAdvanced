import Image from "next/image";
import { useTranslations } from "next-intl";
import { ProductBubbles } from "./ProductBubbles";

/* "منتجاتنا" intro + the two product bubbles, mirroring the services
   overview. On a product page, `active` highlights that product's bubble. */
export default function ProductsOverview({ active }: { active?: number }) {
  const t = useTranslations("ProductsOverview");

  return (
    <>
      <section className="relative overflow-hidden py-12 md:py-16">
        <div className="pointer-events-none absolute start-0 top-10 h-[420px] w-[420px] rounded-full bg-teal/[0.07] blur-[150px]" />
        <div className="container-tk relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_440px] lg:gap-16">
          <div>
            <div className="flex items-center gap-5">
              {/* teal badge with a partial ring */}
              <div className="relative flex h-[118px] w-[118px] shrink-0 items-center justify-center">
                <span className="absolute inset-0 rounded-full border-[6px] border-teal/70 [clip-path:polygon(0_0,55%_0,55%_100%,0_100%)] rtl:[clip-path:polygon(45%_0,100%_0,100%_100%,45%_100%)]" />
                <span className="glow-pulse flex h-[92px] w-[92px] items-center justify-center rounded-full bg-gradient-to-br from-teal-cyan to-teal px-2 text-center text-[14px] font-bold leading-tight text-navy shadow-[0_0_40px_rgba(0,180,172,.45)] rtl:text-[18px]">
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
                src="/assets/products/forsa-main.jpg"
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

      <ProductBubbles active={active} />
    </>
  );
}
