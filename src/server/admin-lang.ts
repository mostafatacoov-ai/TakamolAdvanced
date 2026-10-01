import "server-only";
import { cookies } from "next/headers";
import { ADMIN_DICT, translate, type AdminLang, type Translate } from "@/lib/admin/i18n";

export const ADMIN_LANG_COOKIE = "tak_admin_lang";

/** The admin area's interface language (Arabic unless the user switched). */
export async function getAdminLang(): Promise<AdminLang> {
  return (await cookies()).get(ADMIN_LANG_COOKIE)?.value === "en" ? "en" : "ar";
}

export async function getAdminT(): Promise<Translate> {
  const dict = ADMIN_DICT[await getAdminLang()];
  return (key, vars) => translate(dict, key, vars);
}
