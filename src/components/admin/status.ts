import type { AdminKey } from "@/lib/admin/i18n";
import type { Tone } from "./ui";

export const APPLICATION_TONE: Record<string, Tone> = {
  new: "teal",
  reviewing: "blue",
  shortlisted: "amber",
  interview: "amber",
  hired: "green",
  rejected: "gray",
};

export const applicationStatusKey = (status: string) => `apps.status.${status}` as AdminKey;

export const QUOTATION_TONE: Record<string, Tone> = {
  new: "teal",
  preparing: "blue",
  sent: "amber",
  accepted: "green",
  declined: "gray",
};

export const quotationStatusKey = (status: string) => `quotes.status.${status}` as AdminKey;
