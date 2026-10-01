import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminI18nProvider } from "@/components/admin/I18n";
import { ADMIN_DICT } from "@/lib/admin/i18n";
import { getAdminLang } from "@/server/admin-lang";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Takamol Admin", template: "%s | Takamol Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const lang = await getAdminLang();
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Latin letters and digits from Exo 2 (GE SS Two draws digits as Arabic-Indic) */}
      <body className="min-h-screen bg-[#03111d] antialiased" style={{ fontFamily: '"Exo2", "GESSTwo", system-ui, sans-serif' }}>
        <AdminI18nProvider lang={lang} dict={ADMIN_DICT[lang]}>
          {children}
        </AdminI18nProvider>
      </body>
    </html>
  );
}
