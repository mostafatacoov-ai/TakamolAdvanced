import DetailPage, { detailMetadata } from "@/components/DetailPage";

export const generateMetadata = detailMetadata("highestBestUse");

export default function Page() {
  return (
    <DetailPage
      page="highestBestUse"
      image="/assets/interactive-1.jpg"
    />
  );
}
