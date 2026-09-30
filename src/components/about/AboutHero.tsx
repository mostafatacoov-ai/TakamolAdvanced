import Image from "next/image";
import { useTranslations } from "next-intl";

/* About hero from the design: the Riyadh skyline with two overlapping teal
   circles carrying the headline, floating at the reading-start side. */
export default function AboutHero() {
  const t = useTranslations("AboutHero");
  return (
    <section className="relative h-[560px] overflow-hidden md:h-[640px]">
      <div className="absolute inset-0">
        <Image
          src="/assets/about/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_65%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-navy to-transparent" />
      </div>

      <div className="container-tk relative flex h-full items-start pt-[120px] md:pt-[150px]">
        <div className="flex items-center">
          {/* front circle */}
          <h1
            className="pin-float glow-pulse relative z-10 flex h-[180px] w-[180px] items-center justify-center rounded-full bg-gradient-to-b from-[#1fb3aa] to-[#0b8d88] p-5 text-center text-[17px] font-bold leading-[1.5] text-white shadow-[0_20px_50px_rgba(0,20,30,.45)] sm:h-[220px] sm:w-[220px] sm:text-[21px] md:h-[250px] md:w-[250px] md:text-[23px] rtl:text-[20px] rtl:sm:text-[25px] rtl:md:text-[28px]"
          >
            <span>
              {t("titleLine1")}
              <br />
              {t("titleLine2")}
            </span>
          </h1>
          {/* back circle, tucked behind the first */}
          <p
            className="pin-float relative -ms-8 flex h-[180px] w-[180px] items-center justify-center rounded-full bg-[#0f8f8a]/75 p-5 text-center text-[15px] font-bold leading-[1.55] text-white backdrop-blur-[2px] sm:h-[220px] sm:w-[220px] sm:text-[19px] md:-ms-10 md:h-[250px] md:w-[250px] md:text-[21px] rtl:text-[19px] rtl:sm:text-[23px] rtl:md:text-[26px]"
            style={{ animationDelay: "-3.2s" }}
          >
            <span>
              {t("subtitleLine1")}
              <br />
              {t("subtitleLine2")}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
