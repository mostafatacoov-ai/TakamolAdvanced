import { pageMetadata } from "@/lib/metadata";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlatformsSection from "@/components/home/Platforms";

export const generateMetadata = pageMetadata("platforms", "platformsDesc");

export default function PlatformsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-[110px]">
        <PlatformsSection />
      </main>
      <Footer />
    </>
  );
}
