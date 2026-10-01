import { pageMetadata } from "@/lib/metadata";
import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PartnersSection from "@/components/home/Partners";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = pageMetadata("partners", "partnersDesc");

export default function PartnersPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  const t = useTranslations("Partners");
  return (
    <>
      <Header />
      <main className="min-h-screen pt-[110px]">
        <section className="container-tk pt-8">
          <h1 className="sec-title glow-title">{t("title")}</h1>
          <div className="glow-bar mt-4 h-[4px] w-24 rounded-full bg-teal" />
        </section>
        <PartnersSection />
      </main>
      <Footer />
    </>
  );
}
