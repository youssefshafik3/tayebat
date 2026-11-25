"use client";

/**
 * Admin Home & Platform Dashboard (Requirements 3.2a & 3.3a)
 * ---------------------------------------------------------------------------
 * - Displays Admin's name, role (`Super Admin` / `Zone Admin`), and Zone (if Zone Admin).
 * - Shows `Platform_Health_Snapshot`: active businesses, available riders,
 *   orders today, avg delivery time today, low ratings today.
 * - Shows `Reconcile_Order_Totals` warning if any order/payment mismatch exists.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { api } from "@/lib/apiClient";
import {
  Card,
  CardHeader,
  LoadingState,
  PageHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import type {
  AdminProfile,
  OrderReconciliationIssue,
  PlatformHealthSnapshot,
} from "@/types/database";

function AdminDashboardContent() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [health, setHealth] = useState<PlatformHealthSnapshot | null>(null);
  const [issues, setIssues] = useState<OrderReconciliationIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<AdminProfile>("/api/admin/profile"),
      api.get<{ health: PlatformHealthSnapshot; reconciliation: OrderReconciliationIssue[] }>(
        "/api/admin/dashboard"
      ),
    ]).then(([profRes, dashRes]) => {
      if (profRes.ok && profRes.data) setProfile(profRes.data);
      if (dashRes.ok && dashRes.data) {
        setHealth(dashRes.data.health);
        setIssues(dashRes.data.reconciliation);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState label="Loading platform dashboard..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${profile?.admin_name ?? "Admin"}`}
        description="Monitor platform health, reconcile order totals, and jump to governance & insights."
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={profile?.role ?? "Admin"} />
            {profile?.role === "Zone Admin" && profile.zone_name && (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
                <MapPin className="h-3.5 w-3.5" />
                Zone: {profile.zone_name}
              </span>
            )}
          </div>
        }
      />

      {/* Order Total Reconciliation Alert (Req 3.3a) */}
      {issues.length > 0 ? (
        <Card className="border-rose-300 bg-rose-50/70">
          <div className="p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-rose-600" />
              <div className="flex-1">
                <h2 className="text-base font-bold text-rose-900">
                  Order Reconciliation Warning ({issues.length} mismatched order
                  {issues.length > 1 ? "s" : ""})
                </h2>
                <p className="mt-0.5 text-sm text-rose-800">
                  The following orders have a mismatch between sub-order totals, order total, or payment amount:
                </p>
                <div className="mt-3 overflow-x-auto rounded-xl border border-rose-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-rose-50 text-xs font-semibold text-rose-900">
                      <tr>
                        <th className="px-4 py-2.5">Order ID</th>
                        <th className="px-4 py-2.5">Expected Total</th>
                        <th className="px-4 py-2.5">Recorded Order Total</th>
                        <th className="px-4 py-2.5">Payment Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100">
                      {issues.map((row) => (
                        <tr key={row.order_id}>
                          <td className="px-4 py-2.5 font-semibold">#{row.order_id}</td>
                          <td className="px-4 py-2.5">{row.expected_total.toFixed(2)} EGP</td>
                          <td className="px-4 py-2.5">{row.order_total.toFixed(2)} EGP</td>
                          <td className="px-4 py-2.5">
                            {row.payment_amount !== null ? `${row.payment_amount.toFixed(2)} EGP` : "Missing"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-900">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>
            <strong>Order Reconciliation Healthy:</strong> All recorded orders match their sub-order totals and payment amounts.
          </span>
        </div>
      )}

      {/* Platform Health Snapshot Cards (Req 3.3a) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Active Businesses</span>
            <Store className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{health?.active_businesses ?? 0}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Available Riders</span>
            <Bike className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{health?.available_riders ?? 0}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Orders Today</span>
            <ShoppingBag className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{health?.orders_today ?? 0}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Avg Speed Today</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {health?.avg_delivery_time_today !== null && health?.avg_delivery_time_today !== undefined
              ? `${health.avg_delivery_time_today} min`
              : "—"}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Low Ratings Today</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{health?.low_ratings_today ?? 0}</p>
        </Card>
      </div>

      {/* Quick Links to Admin Workflows */}
      <Card>
        <CardHeader
          title="Admin Workspace Shortcuts"
          subtitle={
            profile?.role === "Zone Admin"
              ? `Note: Super Admin-only features are hidden for your Zone Admin (${profile.zone_name}) account.`
              : "Full Super Admin governance and platform insights."
          }
        />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/governance"
            className="rounded-xl border border-slate-200 p-4 transition hover:border-emerald-400 hover:bg-emerald-50/40"
          >
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">Businesses & Admins</h3>
            <p className="mt-1 text-xs text-slate-500">
              Approve/reject pending applications, suspend businesses, and manage admins.
            </p>
          </Link>

          <Link
            href="/admin/customers"
            className="rounded-xl border border-slate-200 p-4 transition hover:border-emerald-400 hover:bg-emerald-50/40"
          >
            <Users className="h-6 w-6 text-emerald-600" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">Vouchers & Blacklist</h3>
            <p className="mt-1 text-xs text-slate-500">
              Issue promo vouchers to customers and manage customer blacklists.
            </p>
          </Link>

          <Link
            href="/admin/zones"
            className="rounded-xl border border-slate-200 p-4 transition hover:border-emerald-400 hover:bg-emerald-50/40"
          >
            <MapPin className="h-6 w-6 text-emerald-600" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">Zones & Comparison</h3>
            <p className="mt-1 text-xs text-slate-500">
              Compare zone performance, delivery speeds, and configure delivery fees.
            </p>
          </Link>

          <Link
            href="/admin/insights"
            className="rounded-xl border border-slate-200 p-4 transition hover:border-emerald-400 hover:bg-emerald-50/40"
          >
            <BarChart3 className="h-6 w-6 text-emerald-600" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">Revenue, Riders & Market</h3>
            <p className="mt-1 text-xs text-slate-500">
              Inspect daily revenue breakdowns, top riders, and best-selling products.
            </p>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function AdminHomePage() {
  return <RoleGuard allowedRole="Admin">{() => <AdminDashboardContent />}</RoleGuard>;
}
