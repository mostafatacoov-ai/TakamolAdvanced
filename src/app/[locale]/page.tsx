import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/home/Hero";
import InteractiveVision from "@/components/home/InteractiveVision";
import Services from "@/components/home/Services";
import Products from "@/components/home/Products";
import Knowledge from "@/components/home/Knowledge";
import Partners from "@/components/home/Partners";
import Participations from "@/components/home/Participations";
import Social from "@/components/home/Social";
import { setRequestLocale } from "next-intl/server";

export default function Home({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <InteractiveVision />
        <Services />
        <Products />
        <Knowledge />
        <Partners />
        <Participations />
        <Social />
      </main>
      <Footer />
    </>
  );
}
