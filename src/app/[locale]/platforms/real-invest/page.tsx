import DetailPage, { detailMetadata } from "@/components/DetailPage";

export const generateMetadata = detailMetadata("realInvest");

export default function Page() {
  return (
    <DetailPage
      page="realInvest"
      image="/assets/forsa-step1.jpg"
    />
  );
}
