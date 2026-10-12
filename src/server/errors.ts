import type { AdminKey } from "@/lib/admin/i18n";

/** An expected problem to show the editor (wrong input, missing permission). */
export class UserError extends Error {
  constructor(
    public key: AdminKey,
    public errors?: Record<string, AdminKey>,
    /** technical detail shown under the message, e.g. what the mail service answered */
    public detail?: string,
  ) {
    super(key);
    this.name = "UserError";
  }
}
