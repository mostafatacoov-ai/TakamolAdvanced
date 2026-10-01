import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/*
   Shared layout for the service, product and knowledge-article pages.
   Text lives in messages/{ar,en}.json under Pages.<key>:
     metaTitle, metaDescription?, metaKeywords?, badge, title, subtitle,
     intro, sections?: [{ heading, body }], note?, comingSoon?
   intro, section bodies and note may use <b>…</b>.
*/

type Props = {
  page: string;
  image: string;
  /** image fit, e.g. "object-contain md:object-cover" for artwork */
  imageClass?: string;
  /** strength of the navy tint over the hero image */
  overlay?: "light" | "normal";
};

const bold = { b: (chunks: ReactNode) => <strong>{chunks}</strong> };

export function detailMetadata(page: string) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: `Pages.${page}` });
    return {
      title: t("metaTitle"),
      description: t.has("metaDescription") ? t("metaDescription") : undefined,
      keywords: t.has("metaKeywords") ? t("metaKeywords") : undefined,
    };
  };
}

export default async function DetailPage({
  page,
  image,
  imageClass = "object-cover",
  overlay = "normal",
}: Props) {
  const t = await getTranslations(`Pages.${page}`);
  const sectionCount = t.has("sections")
    ? (t.raw("sections") as unknown[]).length
    : 0;

  return (
    <>
      <Header />
      <main className="relative min-h-screen pt-[120px] pb-10">
        <div className="pointer-events-none absolute left-1/2 top-40 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-teal/[0.08] blur-[150px]" />

        {/* hero image */}
        <section className="relative">
          <div className="container-tk max-w-4xl">
            <div className="relative h-[300px] w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_20px_50px_rgba(0,10,20,.45)] md:h-[400px]">
              <Image
                src={image}
                alt={t("title")}
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                className={imageClass}
              />
              <div className={`absolute inset-0 ${overlay === "light" ? "bg-navy/20" : "bg-navy/40"}`} />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy/70 to-transparent" />
            </div>
          </div>
        </section>

        {/* article card */}
        <section className="relative mt-12">
          <div className="pointer-events-none absolute inset-0 opacity-[0.04] binary-bg" />
          <div className="container-tk relative max-w-4xl">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md md:p-14">
              <header className="mb-12 border-b border-white/10 pb-10">
                <span className="glow-pulse mb-4 inline-block rounded-full border border-teal/40 bg-teal/15 px-4 py-1.5 text-sm font-bold text-teal-cyan">
                  {t("badge")}
                </span>
                <h1 className="glow-title mb-6 text-3xl font-bold leading-snug text-white md:text-5xl">
                  {t("title")}
                </h1>
                <p className="text-xl font-bold leading-relaxed text-teal md:text-2xl">
                  {t("subtitle")}
                </p>
              </header>

              <article className="stagger space-y-8 text-lg leading-relaxed text-iceblue">
                <p className="text-xl font-medium text-white/90">
                  {t.rich("intro", bold)}
                </p>

                {Array.from({ length: sectionCount }, (_, i) => (
                  <div key={i}>
                    <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-white">
                      <span aria-hidden className="glow-bar h-6 w-1 shrink-0 rounded-full bg-teal" />
                      {t(`sections.${i}.heading`)}
                    </h2>
                    <p className="text-steel">{t.rich(`sections.${i}.body`, bold)}</p>
                  </div>
                ))}

                {t.has("note") && (
                  <div className="mt-12 rounded-[18px] border border-teal/25 bg-navy-deep/60 p-6">
                    <p className="m-0 text-sm font-light leading-relaxed text-white/70">
                      {t.rich("note", bold)}
                    </p>
                  </div>
                )}

                {t.has("comingSoon") && (
                  <div className="mt-12 flex min-h-[150px] items-center justify-center rounded-[18px] border border-teal/25 bg-navy-deep/60 p-6">
                    <p className="m-0 text-center text-lg font-light leading-relaxed text-white/70">
                      {t("comingSoon")}
                    </p>
                  </div>
                )}
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
