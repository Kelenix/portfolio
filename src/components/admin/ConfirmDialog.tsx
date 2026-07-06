"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Bouton de confirmation en rouge pour les actions destructrices. */
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

let confirmFn: ((options: ConfirmOptions) => Promise<boolean>) | null = null;

/**
 * Remplace `window.confirm()` par une boîte de dialogue stylée.
 * Usage : `if (!(await confirm({ message: "Supprimer ?" }))) return;`
 */
export function useConfirm() {
  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    if (confirmFn) return confirmFn(options);
    // Repli si le conteneur n'est pas monté.
    return Promise.resolve(window.confirm(options.message));
  }, []);
  return { confirm };
}

export function ConfirmContainer() {
  const [state, setState] = useState<ConfirmState | null>(null);

  confirmFn = (options: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });

  const close = useCallback(
    (value: boolean) => {
      state?.resolve(value);
      setState(null);
    },
    [state]
  );

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, close]);

  if (!state) return null;

  const danger = state.danger ?? true;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
      onClick={() => close(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-xl border shadow-2xl"
        style={{ background: "var(--background)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
            style={{
              background: danger ? "rgba(239,68,68,0.12)" : "var(--muted)",
              color: danger ? "#ef4444" : "var(--foreground)",
            }}
          >
            <AlertTriangle size={18} strokeWidth={2} />
          </div>
          <div className="flex-1 pt-0.5">
            <h2
              className="text-sm font-mono font-bold"
              style={{ color: "var(--foreground)" }}
            >
              {state.title ?? "Confirmation"}
            </h2>
            <p
              className="mt-1 text-xs font-mono leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              {state.message}
            </p>
          </div>
          <button
            onClick={() => close(false)}
            className="transition-opacity hover:opacity-70"
            style={{ color: "var(--muted-foreground)" }}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <div
          className="flex justify-end gap-2 border-t px-5 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={() => close(false)}
            className="rounded-lg border px-4 py-2 text-xs font-mono transition-all hover:opacity-70"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            {state.cancelLabel ?? "Annuler"}
          </button>
          <button
            onClick={() => close(true)}
            autoFocus
            className="rounded-lg px-4 py-2 text-xs font-mono font-bold text-white transition-all hover:opacity-85"
            style={{ background: danger ? "#ef4444" : "var(--foreground)" }}
          >
            {state.confirmLabel ?? "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}
