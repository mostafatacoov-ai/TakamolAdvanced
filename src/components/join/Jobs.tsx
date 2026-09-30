import Image from "next/image";
import { useTranslations } from "next-intl";
import { mailto } from "@/lib/contact";

const JOBS = [
  {
    img: "/assets/job-card-1.png",
    title: "Feasibility Study Manager",
  },
  {
    img: "/assets/job-card-2.png",
    title: "Feasibility Study Manager",
  },
  {
    img: "/assets/job-card-3.png",
    title: "Feasibility Study Manager",
  },
  {
    img: "/assets/job-card-4.png",
    title: "Feasibility Study Manager",
  },
];

export default function Jobs() {
  const t = useTranslations("Jobs");
  return (
    <section id="jobs" className="relative overflow-hidden py-14 md:py-20">
      <div className="absolute inset-x-0 top-1/2 h-[135%] -translate-y-1/2 bg-gradient-to-b from-navy via-navy-deep to-navy" />

      <div className="container-tk relative">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="sec-title glow-title">{t("title")}</h2>
            <div className="glow-bar mt-4 h-[4px] w-24 rounded-full bg-teal" />
          </div>
          <p className="sec-sub max-w-[640px] md:pb-3">
            {t("subtitle")}
          </p>
        </div>

        {/* LinkedIn-style post cards — exact art from the design */}
        <div className="stagger mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {JOBS.map((j, i) => (
            <article
              key={i}
              className="group overflow-hidden rounded-[20px] bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(0,0,0,.45)]"
            >
              <div className="relative aspect-[800/640] w-full">
                <Image
                  src={j.img}
                  alt={j.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-black/5 px-6 py-4">
                <span className="font-exo text-[16px] font-semibold text-navy">
                  #NowHiring
                </span>
                <a
                  href={mailto(
                    `Job application: ${j.title}`,
                    `Position: ${j.title}\n\nPlease attach your CV to this email.\n\n`
                  )}
                  className="rounded-full bg-[#0A66C2] px-6 py-2 font-exo text-[15px] font-semibold text-white transition-all hover:brightness-110"
                >
                  Apply
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
