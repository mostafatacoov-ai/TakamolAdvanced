import Link from "next/link";
import NextImage from "next/image";
import { ActionForm, CopyButton, SubmitButton } from "@/components/admin/forms";
import { Icon } from "@/components/admin/icons";
import { ImageTile } from "@/components/admin/ImageTile";
import { Banner, Card, cx, EmptyState, inputClass, PageHeader } from "@/components/admin/ui";
import { formatBytes, formatDate } from "@/lib/admin/format";
import { overrideUrl } from "@/lib/assets";
import { pick, type Localized } from "@/lib/site-types";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { listMedia, listSiteImages } from "@/server/images";
import { deleteImage, uploadImages } from "../../_actions/content";

export const metadata = { title: "Images" };

const FOLDERS: Record<string, Localized> = {
  about: { ar: "صفحة عن تكامل", en: "About page" },
  services: { ar: "صفحات الخدمات", en: "Service pages" },
  products: { ar: "صفحات المنتجات", en: "Product pages" },
  partners: { ar: "شعارات الشركاء", en: "Partner logos" },
  "real-invest": { ar: "لقطات المنصات", en: "Platform screenshots" },
};

export default async function ImagesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requirePermission("media.manage");
  const t = await getAdminT();
  const lang = await getAdminLang();
  const tab = (await searchParams).tab === "library" ? "library" : "site";

  const tabLink = (key: "site" | "library") => (
    <Link
      href={key === "site" ? "/admin/images" : "/admin/images?tab=library"}
      className={cx(
        "rounded-xl px-4 py-2 text-[14px] font-bold transition",
        tab === key ? "bg-teal text-navy" : "border border-white/15 text-white/75 hover:border-teal hover:text-teal",
      )}
    >
      {t(key === "site" ? "images.tab.site" : "images.tab.library")}
    </Link>
  );

  return (
    <>
      <PageHeader title={t("nav.images")} subtitle={t("images.subtitle")} actions={<>{tabLink("site")}{tabLink("library")}</>} />

      {tab === "site" ? <SiteImages /> : <Library />}
    </>
  );

  function SiteImages() {
    const images = listSiteImages();
    const folders = new Map<string, typeof images>();
    for (const img of images) folders.set(img.folder, [...(folders.get(img.folder) ?? []), img]);
    const order = ["", ...[...folders.keys()].filter((f) => f).sort()];
    return (
      <>
        <Banner tone="blue" icon="images">{t("images.replaceHint")}</Banner>
        <div className="space-y-6">
          {order.filter((f) => folders.has(f)).map((folder) => (
            <Card key={folder || "root"} title={folder ? pick(FOLDERS[folder] ?? { ar: folder, en: folder }, lang) : t("images.general")}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {folders.get(folder)!.map((img) => (
                  <ImageTile
                    key={img.rel}
                    rel={img.rel}
                    src={img.version ? overrideUrl(img.rel, img.version) : `/assets/${img.rel}`}
                    size={img.size}
                    replaced={!!img.version}
                    replaceable={img.replaceable}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </>
    );
  }

  function Library() {
    const media = listMedia();
    return (
      <div className="space-y-6">
        <Card title={t("images.uploadNew")} description={t("images.libraryHint")}>
          <ActionForm action={uploadImages} resetOnSuccess className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="file"
              name="files"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className={cx(inputClass, "file:me-3 file:rounded-lg file:border-0 file:bg-teal file:px-3 file:py-1.5 file:font-bold file:text-navy")}
            />
            <SubmitButton pendingLabel="common.uploading">
              <Icon name="upload" className="h-4 w-4" />
              {t("common.upload")}
            </SubmitButton>
          </ActionForm>
        </Card>

        {media.length === 0 ? (
          <EmptyState>{t("common.empty")}</EmptyState>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {media.map((m) => (
              <div key={m.id} className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                <div className="relative aspect-[4/3] bg-[repeating-conic-gradient(#0b2a3d_0_25%,#08202f_0_50%)] bg-[length:16px_16px]">
                  <NextImage src={m.url} alt={m.name} fill sizes="240px" className="object-contain" />
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <p dir="ltr" className="truncate text-[12px] text-white/75" title={m.name}>{m.name}</p>
                  <p className="font-exo text-[11px] text-white/35">
                    {m.width}×{m.height} · {formatBytes(m.size)} · {formatDate(m.createdAt, lang, false)}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    <CopyButton text={m.url} />
                    <ActionForm action={deleteImage} notice="none" className="contents">
                      <input type="hidden" name="id" value={m.id} />
                      <SubmitButton variant="smallDanger" confirm="common.confirmDelete">
                        <Icon name="trash" className="h-3.5 w-3.5" />
                        {t("common.delete")}
                      </SubmitButton>
                    </ActionForm>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
