import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { NewPageFields } from "@/components/admin/NewPageFields";
import { Card, PageHeader } from "@/components/admin/ui";
import { getAdminT } from "@/server/admin-lang";
import { requirePermission } from "@/server/auth";
import { createPageAction } from "../../../_actions/pages";

export const metadata = { title: "New page" };

export default async function NewPage() {
  await requirePermission("pages.manage");
  const t = await getAdminT();
  return (
    <>
      <PageHeader title={t("pages.new")} subtitle={t("pages.subtitle")} back={{ href: "/admin/pages", label: t("nav.pages") }} />
      <Card>
        <ActionForm action={createPageAction} className="space-y-5">
          <NewPageFields />
          <SubmitButton pendingLabel="common.saving">{t("common.create")}</SubmitButton>
        </ActionForm>
      </Card>
    </>
  );
}
