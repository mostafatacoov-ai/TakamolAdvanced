import DetailPage, { detailMetadata } from "@/components/DetailPage";

export const generateMetadata = detailMetadata("realEstateIndex");

export default function Page() {
  return (
    <DetailPage
      page="realEstateIndex"
      image="/assets/report-2.png"
    />
  );
}
