import { notFound } from "next/navigation";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { Icon } from "@/components/admin/icons";
import { MediaLibraryProvider } from "@/components/admin/MediaPicker";
import { PageEditor } from "@/components/admin/PageEditor";
import { Banner, buttonClass, PageHeader } from "@/components/admin/ui";
import { BUILTIN_LINKS } from "@/lib/site-defaults";
import { pick } from "@/lib/site-types";
import { getAdminLang, getAdminT } from "@/server/admin-lang";
import { can, requirePermission } from "@/server/auth";
import { listMedia, listSiteImages } from "@/server/images";
import { getPage, listPages } from "@/server/pages";
import { deletePageAction, savePageAction } from "../../../_actions/pages";

export const metadata = { title: "Edit page" };

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await requirePermission("pages.manage");
  const id = Number((await params).id);
  const page = Number.isInteger(id) ? getPage(id) : null;
  if (!page) notFound();
  const { created } = await searchParams;
  const t = await getAdminT();
  const lang = await getAdminLang();

  const links = [
    ...BUILTIN_LINKS.map((l) => l.href),
    ...listPages().filter((p) => p.status === "published").map((p) => `/${p.slug}`),
  ];

  return (
    <>
      <PageHeader
        title={pick(page.title, lang) || page.slug}
        back={{ href: "/admin/pages", label: t("nav.pages") }}
        actions={
          <>
            {page.status === "published" && (
              <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className={buttonClass.secondary}>
                <Icon name="external" className="h-4 w-4" />
                {t("pages.view")}
              </a>
            )}
            <ActionForm action={deletePageAction} notice="none">
              <input type="hidden" name="id" value={page.id} />
              <SubmitButton variant="danger" confirm="common.confirmDelete">
                <Icon name="trash" className="h-4 w-4" />
                {t("common.delete")}
              </SubmitButton>
            </ActionForm>
          </>
        }
      />
      {created && <Banner tone="green" icon="check">{t("pages.created")}</Banner>}
      <MediaLibraryProvider
        items={listMedia()}
        siteImages={listSiteImages().filter((i) => i.replaceable).map((i) => `/assets/${i.rel}`)}
        canUpload={can(user, "media.manage")}
      >
        <PageEditor
          page={{ slug: page.slug, title: page.title, description: page.description, status: page.status, blocks: page.blocks }}
          action={savePageAction.bind(null, page.id)}
          links={links}
        />
      </MediaLibraryProvider>
    </>
  );
}
