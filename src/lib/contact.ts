// Inbox that receives job applications and CVs.
export const CAREERS_EMAIL = "info@takamoladvanced.sa";

export function mailto(subject: string, body = "") {
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${CAREERS_EMAIL}?${params.join("&")}`;
}

// Sales/consulting WhatsApp line (same number as the footer).
export const CONSULTANT_WHATSAPP = "https://wa.me/966508944460";
