import { useTranslations } from "next-intl";

const BENEFITS = [
  {
    icon: (
      <path d="M12 3a9 9 0 0 0-9 9 8.96 8.96 0 0 0 1.61 5.15L3 21l3.9-1.61A9 9 0 1 0 12 3zm-4 8h8v2H8v-2zm0-3.5h8v2H8v-2z" />
    ),
  },
  {
    icon: (
      <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 0a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3 0-6 1.6-6 4.8V21h12v-3.2C14 14.6 11 13 8 13zm8 0c-.7 0-1.5.1-2.2.3A5.8 5.8 0 0 1 15 17.8V21h7v-3.2c0-3.2-3-4.8-6-4.8z" />
    ),
  },
  {
    icon: (
      <path d="M12 2 4 5v6c0 5.25 3.4 10.74 8 12 4.6-1.26 8-6.75 8-12V5l-8-3zm1.5 13.5-2.5-2.5-3.5 3.5L6 15l5-5 2.5 2.5L17 9l1.5 1.5-5 5z" />
    ),
  },
  {
    icon: (
      <path d="M5 21V9l7-6 7 6v12h-5v-7h-4v7H5z" />
    ),
  },
];

export default function Benefits() {
  const t = useTranslations("Benefits");
  return (
    <section className="relative py-14 md:py-20">
      <div className="pointer-events-none absolute right-0 top-10 h-[420px] w-[420px] rounded-full bg-teal/[0.07] blur-[150px]" />

      <div className="container-tk relative">
        <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-2">
          <div>
            <h2 className="sec-title glow-title">{t("title")}</h2>
            <div className="glow-bar mt-4 h-[4px] w-24 rounded-full bg-teal" />
          </div>
          <p className="sec-sub md:pb-3">
            {t("subtitle")}
          </p>
        </div>

        <div className="stagger mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <article
              key={i}
              className="group relative rounded-[24px] border border-white/10 bg-white/[0.04] p-8 transition-all duration-300 hover:-translate-y-2 hover:border-teal/50 hover:shadow-[0_20px_50px_rgba(0,180,172,.15)]"
            >
              {/* icon */}
              <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full border-2 border-teal/40 text-teal transition-all duration-300 group-hover:border-teal group-hover:bg-teal group-hover:text-navy">
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
                  {b.icon}
                </svg>
              </div>

              <h3 className="mt-4 text-[18px] font-bold md:text-[20px] leading-snug text-white">
                <span className="block">{t(`items.${i}.line1`)}</span>
                <span className="block">{t(`items.${i}.line2`)}</span>
              </h3>
              <p className="mt-3 text-[13.5px] font-light leading-[1.8] text-steel md:text-[14.5px]">
                {t(`items.${i}.desc`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
