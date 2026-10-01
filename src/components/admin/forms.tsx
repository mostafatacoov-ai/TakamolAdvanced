"use client";

import {
  createContext, startTransition, useActionState, useContext, useEffect, useRef, useState,
  type FormEvent, type MouseEvent, type ReactNode,
} from "react";
import type { ActionState, FormAction } from "@/lib/admin/action-state";
import type { AdminKey } from "@/lib/admin/i18n";
import { useT } from "./I18n";
import { Icon } from "./icons";
import { buttonClass, cx } from "./ui";

type FormContext = { state: ActionState; pending: boolean };
const FormCtx = createContext<FormContext>({ state: null, pending: false });

export const useFormResult = () => useContext(FormCtx);

/* A form posting to a server action. It submits without React's automatic
   reset, so a rejected form keeps what the editor typed. */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  notice = "top",
  id,
}: {
  action: FormAction;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  notice?: "top" | "bottom" | "none";
  id?: string;
}) {
  const [state, dispatch, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const data = new FormData(e.currentTarget, submitter);
    startTransition(() => dispatch(data));
  };

  return (
    <FormCtx.Provider value={{ state, pending }}>
      <form ref={ref} id={id} onSubmit={onSubmit} className={className} noValidate>
        {notice === "top" && <FormNotice />}
        {children}
        {notice === "bottom" && <FormNotice />}
      </form>
    </FormCtx.Provider>
  );
}

/** The success / error message of the surrounding ActionForm. */
export function FormNotice({ className }: { className?: string }) {
  const { state } = useFormResult();
  const t = useT();
  const [copied, setCopied] = useState(false);
  if (!state?.message) return null;
  return (
    <div
      key={state.at}
      role={state.ok ? "status" : "alert"}
      className={cx(
        "mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-[14px] leading-relaxed",
        state.ok ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100" : "border-rose-400/40 bg-rose-500/10 text-rose-100",
        className,
      )}
    >
      <Icon name={state.ok ? "check" : "warning"} className="mt-0.5 h-5 w-5" />
      <div className="min-w-0 flex-1">
        <p>{t(state.message)}</p>
        {state.detail && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code dir="ltr" className="select-all rounded-lg bg-black/30 px-3 py-1.5 font-mono text-[15px] text-white">
              {state.detail}
            </code>
            <button
              type="button"
              className={buttonClass.small}
              onClick={() => {
                void navigator.clipboard?.writeText(state.detail ?? "");
                setCopied(true);
              }}
            >
              <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
              {t(copied ? "common.copied" : "common.copy")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Error under a field, from the server's field errors. */
export function FieldError({ name }: { name: string }) {
  const { state } = useFormResult();
  const t = useT();
  const key = state?.errors?.[name];
  return key ? <p data-field-error className="mt-1.5 text-[12.5px] font-bold text-rose-300">{t(key)}</p> : null;
}

export function SubmitButton({
  children,
  variant = "primary",
  confirm,
  name,
  value,
  className,
  pendingLabel,
  disabled,
}: {
  children: ReactNode;
  variant?: keyof typeof buttonClass;
  confirm?: AdminKey;
  name?: string;
  value?: string;
  className?: string;
  pendingLabel?: AdminKey;
  disabled?: boolean;
}) {
  const { pending } = useFormResult();
  const t = useT();
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (confirm && !window.confirm(t(confirm))) e.preventDefault();
  };
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending || disabled}
      onClick={onClick}
      className={className ?? buttonClass[variant]}
    >
      {pending && pendingLabel ? t(pendingLabel) : children}
    </button>
  );
}

/** Button that copies text (e.g. an image link) to the clipboard. */
export function CopyButton({ text, className }: { text: string; className?: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className ?? buttonClass.small}
      onClick={() => {
        void navigator.clipboard?.writeText(new URL(text, window.location.origin).toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
      {t(copied ? "common.copied" : "common.copy")}
    </button>
  );
}

/** Warns before leaving the page while `dirty`. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}
