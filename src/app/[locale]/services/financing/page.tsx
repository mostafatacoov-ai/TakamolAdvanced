import DetailPage, { detailMetadata } from "@/components/DetailPage";

export const generateMetadata = detailMetadata("financing");

export default function Page() {
  return (
    <DetailPage
      page="financing"
      image="/assets/forsa-step4.jpg"
    />
  );
}
