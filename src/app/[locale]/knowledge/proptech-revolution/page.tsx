import { use } from "react";
import DetailPage, { detailMetadata } from "@/components/DetailPage";
import { setRequestLocale } from "next-intl/server";

export const generateMetadata = detailMetadata("proptech");

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <DetailPage
      page="proptech"
      image="/assets/forsa-step6.jpg"
    />
  );
}
