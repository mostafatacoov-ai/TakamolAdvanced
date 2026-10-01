"use client";

import { createContext, useContext, type ReactNode } from "react";
import { translate, type AdminKey, type AdminLang, type Translate } from "@/lib/admin/i18n";

type Ctx = { lang: AdminLang; dict: Record<AdminKey, string> };
const I18nContext = createContext<Ctx | null>(null);

export function AdminI18nProvider({ lang, dict, children }: Ctx & { children: ReactNode }) {
  return <I18nContext.Provider value={{ lang, dict }}>{children}</I18nContext.Provider>;
}

export const useAdminLang = (): AdminLang => useContext(I18nContext)?.lang ?? "ar";

export function useT(): Translate {
  const ctx = useContext(I18nContext);
  return (key, vars) => (ctx ? translate(ctx.dict, key, vars) : key);
}
