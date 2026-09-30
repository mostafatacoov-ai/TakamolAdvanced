import { pageMetadata } from "@/lib/metadata";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServicesOverview from "@/components/services/ServicesOverview";

export const generateMetadata = pageMetadata("services", "servicesDesc");

export default function ServicesPage() {
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
