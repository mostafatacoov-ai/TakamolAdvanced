/** Replaced site images: path under /assets → version (time of upload). */
export type AssetOverrides = Record<string, number>;

const PREFIX = "/assets/";

/* A replaced image is served from a versioned /media/a/ URL, so browsers
   and the image optimiser fetch the new file immediately. */
export function resolveAssetSrc(src: string, overrides: AssetOverrides): string {
  if (!src.startsWith(PREFIX)) return src;
  const rel = decodeURI(src.slice(PREFIX.length));
  const version = overrides[rel];
  return version ? overrideUrl(rel, version) : src;
}

export function overrideUrl(rel: string, version: number) {
  return `/media/a/${version}/${rel.split("/").map(encodeURIComponent).join("/")}`;
}
