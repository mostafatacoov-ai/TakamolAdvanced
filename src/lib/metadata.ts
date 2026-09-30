import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// generateMetadata for a page whose title/description live in the "Meta" namespace.
export function pageMetadata(titleKey: string, descriptionKey?: string) {
  return async function generateMetadata({
    params: { locale },
  }: {
    params: { locale: string };
  }): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: "Meta" });
    return {
      title: t(titleKey),
      ...(descriptionKey && { description: t(descriptionKey) }),
    };
  };
}
