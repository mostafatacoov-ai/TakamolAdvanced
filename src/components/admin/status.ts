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
