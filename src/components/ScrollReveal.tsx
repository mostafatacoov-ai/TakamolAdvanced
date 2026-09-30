"use client";

import { useEffect } from "react";
import { usePathname } from "@/navigation";

/* Site-wide scroll animations: fades each <section> (and staggered children
   of any `.stagger` container inside it) up into view the first time it
   enters the viewport. Renders nothing; the CSS lives in globals.css and
   only applies once <html> gets the `reveal-on` class here, so nothing is
   hidden without JavaScript or under prefers-reduced-motion. */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("reveal-on");

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
