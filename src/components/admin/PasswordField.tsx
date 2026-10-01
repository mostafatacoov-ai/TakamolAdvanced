"use client";

import { useState } from "react";
import { useT } from "./I18n";
import { Icon } from "./icons";
import { buttonClass, cx, inputClass } from "./ui";

/* Temporary password input with a "Generate" button. */
export function PasswordField({ name }: { name: string }) {
  const t = useT();
  const [value, setValue] = useState("");
  const generate = () => {
    const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
    setValue(chars.match(/.{4}/g)!.join("-"));
  };
  return (
    <div className="flex gap-2">
      <input
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        dir="ltr"
        autoComplete="new-password"
        className={cx(inputClass, "text-left font-mono")}
      />
      <button type="button" onClick={generate} className={buttonClass.secondary}>
        <Icon name="restore" className="h-4 w-4" />
        {t("users.generate")}
      </button>
    </div>
  );
}
