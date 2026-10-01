import { use } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBlocks from "@/components/blocks/PageBlocks";
import { pick } from "@/lib/site-types";
import { getPublishedPage, publishedSlugs } from "@/server/pages";

/* Pages created in the admin area, at /{slug} and /en/{slug}. */

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return publishedSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getPublishedPage(slug);
  if (!page) return {};
  return {
    title: pick(page.title, locale),
    description: pick(page.description, locale) || undefined,
  };
}

export default function CustomPage({ params }: Props) {
  const { locale, slug } = use(params);
  setRequestLocale(locale);
  const page = getPublishedPage(slug);
  if (!page) notFound();

  const heroFirst = page.blocks[0]?.type === "hero";
  return (
    <>
      <Header />
      <main className={heroFirst ? "min-h-screen" : "min-h-screen pt-[100px]"}>
        {!heroFirst && (
          <section className="relative pt-10 md:pt-14">
            <div className="container-tk">
              <h1 className="sec-title glow-title">{pick(page.title, locale)}</h1>
              <div className="glow-bar mt-4 h-[4px] w-24 rounded-full bg-teal" />
            </div>
          </section>
        )}
        <PageBlocks blocks={page.blocks} locale={locale} />
      </main>
      <Footer />
    </>
  );
}
