import { use } from "react";
import DetailPage, { detailMetadata } from "@/components/DetailPage";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = detailMetadata("highestBestUse");

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <DetailPage
      page="highestBestUse"
      image="/assets/interactive-1.jpg"
    />
  );
}
