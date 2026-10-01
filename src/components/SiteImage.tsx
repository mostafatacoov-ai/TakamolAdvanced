"use client";

import NextImage, { type ImageProps } from "next/image";
import { createContext, useContext, type ImgHTMLAttributes, type ReactNode } from "react";
import { resolveAssetSrc, type AssetOverrides } from "@/lib/assets";

/* Images under /assets can be replaced from the admin area; these wrappers
   point them at the replacement when there is one. */

const OverridesContext = createContext<AssetOverrides>({});

export function AssetProvider({ overrides, children }: { overrides: AssetOverrides; children: ReactNode }) {
  return <OverridesContext.Provider value={overrides}>{children}</OverridesContext.Provider>;
}

export function useAssetSrc() {
  const overrides = useContext(OverridesContext);
  return (src: string) => resolveAssetSrc(src, overrides);
}

/** next/image, aware of replaced site images. */
export default function SiteImage({ src, alt, ...props }: ImageProps) {
  const resolve = useAssetSrc();
  return <NextImage {...props} alt={alt} src={typeof src === "string" ? resolve(src) : src} />;
}

/** A plain <img>, aware of replaced site images. */
export function SiteImg({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) {
  const resolve = useAssetSrc();
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={alt} src={resolve(src)} />;
}
