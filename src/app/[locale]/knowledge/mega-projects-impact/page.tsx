import DetailPage, { detailMetadata } from "@/components/DetailPage";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = detailMetadata("megaProjects");

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  return (
    <DetailPage
      page="megaProjects"
      image="/assets/interactive-1.jpg"
    />
  );
}
