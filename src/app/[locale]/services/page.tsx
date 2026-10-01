import { use } from "react";
import { pageMetadata } from "@/lib/metadata";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServicesOverview from "@/components/services/ServicesOverview";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = pageMetadata("services", "servicesDesc");

export default function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-[100px]">
        <ServicesOverview />
      </main>
      <Footer />
    </>
  );
}
