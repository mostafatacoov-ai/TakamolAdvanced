import { MediaLibraryProvider } from "@/components/admin/MediaPicker";
import { PartnersEditor } from "@/components/admin/PartnersEditor";
import { PageHeader } from "@/components/admin/ui";
import { getAdminT } from "@/server/admin-lang";
import { can, requirePermission } from "@/server/auth";
import { listMedia, listSiteImages } from "@/server/images";
import { getPartners } from "@/server/site";
import { savePartnersAction } from "../../_actions/content";

export const metadata = { title: "Partners" };

export default async function PartnersPage() {
  const user = await requirePermission("content.edit");
  const t = await getAdminT();
  return (
    <>
      <PageHeader title={t("nav.partners")} subtitle={t("partners.subtitle")} />
      <MediaLibraryProvider
        items={listMedia()}
        siteImages={listSiteImages().filter((i) => i.replaceable).map((i) => `/assets/${i.rel}`)}
        canUpload={can(user, "media.manage")}
      >
        <PartnersEditor items={getPartners()} action={savePartnersAction} />
      </MediaLibraryProvider>
    </>
  );
}
