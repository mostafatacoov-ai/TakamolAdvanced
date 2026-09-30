import DetailPage, { detailMetadata } from "@/components/DetailPage";

export const generateMetadata = detailMetadata("promisingCities");

export default function Page() {
  return (
    <DetailPage
      page="promisingCities"
      image="/assets/hero-bg-2.jpg"
    />
  );
}
