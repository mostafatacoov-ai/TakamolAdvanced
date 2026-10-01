import DetailPage, { detailMetadata } from "@/components/DetailPage";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = detailMetadata("promisingCities");

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  return (
    <DetailPage
      page="promisingCities"
      image="/assets/hero-bg-2.jpg"
    />
  );
}
