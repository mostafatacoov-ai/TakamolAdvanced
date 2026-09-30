import DetailPage, { detailMetadata } from "@/components/DetailPage";

export const generateMetadata = detailMetadata("valuation");

export default function Page() {
  return (
    <DetailPage
      page="valuation"
      image="/assets/forsa-step5.jpg"
    />
  );
}
