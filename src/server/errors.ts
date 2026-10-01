import type { AdminKey } from "@/lib/admin/i18n";

/** An expected problem to show the editor (wrong input, missing permission). */
export class UserError extends Error {
  constructor(
    public key: AdminKey,
    public errors?: Record<string, AdminKey>,
  ) {
    super(key);
    this.name = "UserError";
  }
}
