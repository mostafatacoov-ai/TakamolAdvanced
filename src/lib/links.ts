export function mailtoHref(email: string, subject?: string, body?: string) {
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}${params.length ? `?${params.join("&")}` : ""}`;
}

export function whatsappHref(number: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}`;
}

/** Links that leave the site (or open an app) rather than a page route. */
export function isExternalHref(href: string) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

/** A link an editor may store: a site path, a web address, email or phone. */
export function isSafeHref(href: string) {
  if (!href) return false;
  if (href.startsWith("/")) return !href.startsWith("//");
  if (href.startsWith("#")) return true;
  return /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+\d\s-]+)$/i.test(href);
}
