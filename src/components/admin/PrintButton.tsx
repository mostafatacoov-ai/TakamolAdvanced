"use client";

import { useT } from "./I18n";
import { Icon } from "./icons";
import { buttonClass } from "./ui";

/** Opens the browser's print dialog, where the page is saved as a PDF. */
export function PrintButton() {
  const t = useT();
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass.primary}>
      <Icon name="download" className="h-4 w-4" />
      {t("common.print")}
    </button>
  );
}
