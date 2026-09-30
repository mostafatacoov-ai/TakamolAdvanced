import DetailPage, { detailMetadata } from "@/components/DetailPage";

export const generateMetadata = detailMetadata("realFursa");

export default function Page() {
  return (
    <DetailPage
      page="realFursa"
      image="/assets/forsa-step2.jpg"
    />
  );
}
