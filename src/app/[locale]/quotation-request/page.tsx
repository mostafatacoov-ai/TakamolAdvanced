import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import QuotationForm from "@/components/quotation/QuotationForm";

/* The quotation intake brief for sales people. The page isn't linked from
   the menu or listed for search engines: the team shares its address. */

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return { title: t("quotation"), description: t("quotationDesc"), robots: { index: false, follow: false } };
}

export default async function QuotationRequestPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Quotation");
  const tc = await getTranslations("Common");

  return (
    <>
      <Header />
      <main className="relative min-h-screen pt-[100px]">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-teal/[0.08] blur-[150px]" />
        <section className="container-tk relative pb-16 pt-8 md:pb-24 md:pt-12">
          <p className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-5 py-1.5 text-[14px] font-light text-iceblue backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-teal" />
            {tc("home")} <span className="text-teal">{locale === "ar" ? "‹" : "›"}</span> {t("breadcrumb")}
          </p>
          <h1 className="glow-title text-[28px] font-bold leading-[1.25] text-white md:text-[40px]">{t("title")}</h1>
          <p className="mt-1 font-exo text-[14px] text-steel md:text-[16px]">{t("subtitle")}</p>
          <p className="mt-4 max-w-[760px] text-[15px] font-light leading-[1.9] text-white/85 md:text-[17px]">{t("intro")}</p>

          <div className="mt-10 rounded-[28px] border border-teal/25 bg-white/[0.04] p-4 sm:p-6 md:p-10">
            <QuotationForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
