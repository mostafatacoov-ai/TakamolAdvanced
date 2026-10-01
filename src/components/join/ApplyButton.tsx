"use client";

import type { ReactNode } from "react";

/* Scrolls to the application form and selects this job in it. */
export default function ApplyButton({ jobId, className, children }: { jobId: number; className: string; children: ReactNode }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.dispatchEvent(new CustomEvent("takamol:apply", { detail: jobId }));
        document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </button>
  );
}
