"use client";

/**
 * Shared UI Building Blocks
 * ---------------------------------------------------------------------------
 * Reusable, accessible components used across Admin, Partner, Rider, and
 * Customer pages to keep typography, spacing, badges, modals, and confirmation
 * dialogs consistent throughout the application.
 */

import React from "react";
import { AlertTriangle, Loader2, Star, X } from "lucide-react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}) {
  const variantCls = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs",
    secondary: "bg-amber-600 text-white hover:bg-amber-700 shadow-xs",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-xs",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  }[variant];

  const sizeCls = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-5 py-2.5 text-sm rounded-xl",
  }[size];

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantCls} ${sizeCls} ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let cls = "bg-slate-100 text-slate-700 border-slate-200";
  if (["active", "delivered", "unused", "open", "available"].includes(s)) {
    cls = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (["pending", "placed", "assigned", "in progress"].includes(s)) {
    cls = "bg-amber-50 text-amber-800 border-amber-200";
  } else if (["picked up"].includes(s)) {
    cls = "bg-sky-50 text-sky-700 border-sky-200";
  } else if (["suspended", "blacklisted", "cancelled", "closed", "unavailable"].includes(s)) {
    cls = "bg-rose-50 text-rose-700 border-rose-200";
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export function LoadingState({ label = "Loading data..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-slate-500">
      <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-slate-400">{icon}</div>}
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 max-w-md text-xs text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/**
 * Confirmation Dialog for irreversible actions (Requirement 3.1f:
 * blacklisting, suspending, cancelling an order, deleting an address, etc.).
 */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  consequence,
  confirmLabel = "Confirm",
  loading = false,
  children,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  consequence: string;
  confirmLabel?: string;
  loading?: boolean;
  children?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <p className="font-semibold">This action cannot be undone.</p>
            <p className="mt-1 text-rose-800">{consequence}</p>
          </div>
        </div>
        {children}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (val: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
          aria-label={`${star} stars`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
