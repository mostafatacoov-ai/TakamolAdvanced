import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export { routing };

// Locale-aware replacements for next/link and next/navigation: hrefs are
// written without a locale ("/about") and get the current one added, and
// usePathname returns the path without the locale prefix.
export const { Link, usePathname, useRouter, redirect, getPathname } =
  createNavigation(routing);
