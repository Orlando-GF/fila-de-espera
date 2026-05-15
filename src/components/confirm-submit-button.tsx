"use client";

import { AlertTriangle } from "lucide-react";
import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  message: string;
  dialogTitle?: string;
  confirmLabel?: string;
  children: ReactNode;
};

export function ConfirmSubmitButton({
  message,
  dialogTitle = "Confirmar ação",
  confirmLabel = "Confirmar",
  children,
  onClick,
  ...props
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        {...props}
        type="button"
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(true);
        }}
      >
        {children}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-xl"
          >
            <div className="flex gap-3 border-b border-slate-200 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700">
                <AlertTriangle size={21} aria-hidden="true" />
              </span>
              <div>
                <h2 id="confirm-title" className="text-base font-semibold text-slate-950">
                  {dialogTitle}
                </h2>
                <p id="confirm-message" className="mt-1 text-sm text-slate-600">
                  {message}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4">
              <button
                type="button"
                className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
