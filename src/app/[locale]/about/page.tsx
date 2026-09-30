import { pageMetadata } from "@/lib/metadata";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutHero from "@/components/about/AboutHero";
import Story from "@/components/about/Story";
import VisionMission from "@/components/about/VisionMission";
import WhyUs from "@/components/about/WhyUs";

export const generateMetadata = pageMetadata("about");

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <AboutHero />
        <Story />
        <VisionMission />
        <WhyUs />
      </main>
      <Footer />
    </>
  );
}
