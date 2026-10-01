import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { ProductBubbles } from "@/components/products/ProductBubbles";

/* Home "منتجاتنا": header + the two product bubbles. */
export default function Products() {
  const t = useTranslations("OurProducts");

  return (
    <section id="products" className="relative overflow-hidden py-14 md:py-16">
      <div className="absolute inset-x-0 top-1/2 h-full -translate-y-1/2 bg-gradient-to-b from-navy via-navy-deep to-navy" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] binary-bg" />

      <div className="container-tk relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <h2 className="glow-title text-[32px] font-bold leading-tight text-white md:text-[42px]">{t("title")}</h2>
              <span aria-hidden className="hidden h-8 w-px bg-white/40 md:block" />
              <p className="hidden text-[18px] font-medium text-white/80 md:block md:text-[22px]">{t("subtitle")}</p>
            </div>
            <div className="glow-bar mt-3 h-[3px] w-[90px] rounded-full bg-teal" />
          </div>
          <Link href="/platforms" className="teal-link md:pb-3">
            {t("viewAll")}
            <span aria-hidden className="inline-block text-[30px] leading-none ltr:rotate-180">‹</span>
          </Link>
        </div>
      </div>

      <ProductBubbles embed />
    </section>
  );
}
