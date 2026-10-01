import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { ServiceBubbles } from "@/components/services/ServicesOverview";

/* Home "خدماتنا": header + the five service bubbles. */
export default function Services() {
  const t = useTranslations("Services");

  return (
    <section id="services" className="relative overflow-hidden bg-navy py-14 md:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-5 binary-bg" />

      <div className="container-tk relative z-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <h2 className="glow-title text-[32px] font-bold leading-tight text-white md:text-[42px]">{t("headerTitle1")}</h2>
              <span aria-hidden className="hidden h-8 w-px bg-white/40 md:block" />
              <p className="hidden text-[18px] font-medium text-white/80 md:block md:text-[22px]">{t("headerSub1")}</p>
            </div>
            <div className="glow-bar mt-3 h-[3px] w-[90px] rounded-full bg-teal" />
          </div>
          <Link href="/services" className="teal-link md:pb-3">
            {t("viewAll")}
            <span aria-hidden className="inline-block text-[30px] leading-none ltr:rotate-180">‹</span>
          </Link>
        </div>

        <div className="mt-2">
          <ServiceBubbles embed />
        </div>
      </div>
    </section>
  );
}
