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

export const REPORT_TONE: Record<string, Tone> = { draft: "amber", approved: "green" };
export const reportStatusKey = (status: string) => `kpi.status.${status}` as AdminKey;

export const RATING_TONE: Record<string, Tone> = { excellent: "green", veryGood: "teal", good: "blue", fair: "amber", weak: "rose" };

export const quotationStatusKey = (status: string) => `quotes.status.${status}` as AdminKey;
