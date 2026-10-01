import { pageMetadata } from "@/lib/metadata";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KnowledgeSection from "@/components/home/Knowledge";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = pageMetadata("knowledge", "knowledgeDesc");

export default function KnowledgePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

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
