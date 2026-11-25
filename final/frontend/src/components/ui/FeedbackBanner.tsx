"use client";

/**
 * Global Feedback Toast & Alert Context
 * ---------------------------------------------------------------------------
 * Requirement 3.1(a):
 * Shows clear success or error feedback whenever any action runs on the site.
 *
 * Beginner Note:
 * React Context (`createContext`) lets any page or button call `showFeedback(...)`
 * without passing callback props down through ten layers of components.
 */

import React, { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface FeedbackMessage {
  id: number;
  type: "success" | "error";
  text: string;
}

interface FeedbackContextValue {
  showSuccess: (text: string) => void;
  showError: (text: string) => void;
  notifyResult: (res: { ok: boolean; message: string }) => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FeedbackMessage[]>([]);

  const push = useCallback((type: "success" | "error", text: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev.slice(-3), { id, type, text }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 6500);
  }, []);

  const showSuccess = useCallback((text: string) => push("success", text), [push]);
  const showError = useCallback((text: string) => push("error", text), [push]);
  const notifyResult = useCallback(
    (res: { ok: boolean; message: string }) => {
      push(res.ok ? "success" : "error", res.message);
    },
    [push]
  );

  return (
    <FeedbackContext.Provider value={{ showSuccess, showError, notifyResult }}>
      {children}
      {/* Floating notification stack in bottom-right */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex max-w-md flex-col gap-2 pointer-events-none"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all ${
              item.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : "border-rose-200 bg-rose-50 text-rose-950"
            }`}
          >
            {item.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            )}
            <p className="flex-1 text-sm font-medium leading-snug">{item.text}</p>
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
              className="rounded p-0.5 opacity-60 hover:opacity-100"
              aria-label="Dismiss message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error("useFeedback must be used inside <FeedbackProvider>");
  }
  return ctx;
}

/** Inline alert banner for page-level warnings or form validation messages. */
export function AlertBanner({
  variant,
  title,
  message,
}: {
  variant: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-rose-200 bg-rose-50 text-rose-900",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
    info: "border-sky-200 bg-sky-50 text-sky-950",
  }[variant];

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {title && <p className="font-semibold mb-0.5">{title}</p>}
      <p>{message}</p>
    </div>
  );
}
