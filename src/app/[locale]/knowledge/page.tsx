import { pageMetadata } from "@/lib/metadata";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KnowledgeSection from "@/components/home/Knowledge";

export const generateMetadata = pageMetadata("knowledge", "knowledgeDesc");

export default function KnowledgePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-[110px]">
        <KnowledgeSection />
      </main>
      <Footer />
    </>
  );
}
