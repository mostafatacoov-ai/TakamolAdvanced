"use client";

import { useEffect } from "react";

/** Opens the print window once the page (letterhead and fonts) has loaded: "Download PDF". */
export function AutoPrint() {
  useEffect(() => {
    let cancelled = false;
    const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => window.addEventListener("load", r, { once: true }));
    void Promise.all([loaded, document.fonts?.ready]).then(() => {
      if (!cancelled) setTimeout(() => window.print(), 200);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
