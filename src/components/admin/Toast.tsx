"use client";

import { useState, useCallback } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastMessage {
  id: string;
  type: "success" | "error";
  message: string;
}

let toastFn: ((type: "success" | "error", message: string) => void) | null = null;

export function useToast() {
  const toast = useCallback(
    (type: "success" | "error", message: string) => {
      toastFn?.(type, message);
    },
    []
  );
  return { toast };
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  toastFn = addToast;

  const remove = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 rounded-lg border text-xs font-mono shadow-lg"
          style={{
            background: "var(--background)",
            borderColor: toast.type === "success" ? "#22c55e" : "#ef4444",
            color: "var(--foreground)",
            minWidth: "240px",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
          ) : (
            <XCircle size={14} className="text-red-500 flex-shrink-0" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => remove(toast.id)}
            className="transition-opacity hover:opacity-70"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
