import { getLocale } from "next-intl/server";
import { pick } from "@/lib/site-types";
import { getNavigation } from "@/server/site";
import HeaderClient from "./HeaderClient";

/* The menu tabs come from the admin area (Menu tabs). */
export default async function Header() {
  const locale = await getLocale();
  const items = getNavigation()
    .filter((item) => item.visible)
    .map((item) => ({ href: item.href, label: pick(item.label, locale), external: item.external }));
  return <HeaderClient items={items} />;
}
