import DetailPage, { detailMetadata } from "@/components/DetailPage";

export const generateMetadata = detailMetadata("proptech");

export default function Page() {
  return (
    <DetailPage
      page="proptech"
      image="/assets/forsa-step6.jpg"
    />
  );
}
