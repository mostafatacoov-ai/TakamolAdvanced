import type { AdminKey } from "./i18n";

/** What an admin form's server action reports back to the form. */
export type ActionState = {
  ok: boolean;
  message?: AdminKey;
  /** extra text shown with the message, e.g. a generated password */
  detail?: string;
  /** field name → error message */
  errors?: Record<string, AdminKey>;
  /** distinguishes two identical results so the notice re-appears */
  at: number;
} | null;

export type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;
