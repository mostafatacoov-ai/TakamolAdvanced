import DetailPage, { detailMetadata } from "@/components/DetailPage";

export const generateMetadata = detailMetadata("megaProjects");

export default function Page() {
  return (
    <DetailPage
      page="megaProjects"
      image="/assets/interactive-1.jpg"
    />
  );
}
