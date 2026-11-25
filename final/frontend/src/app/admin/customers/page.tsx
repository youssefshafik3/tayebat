"use client";

/**
 * Admin Customers: Vouchers & Blacklist (Requirements 3.2e & 3.2f)
 * ---------------------------------------------------------------------------
 * - Issue a voucher (`Issue_Voucher`) picking customer by name from `h_CustomerList`.
 * - View all active vouchers (`ActiveVouchers`).
 * - Blacklist a customer (`Blacklist_Customer`) with ConfirmDialog explaining consequences.
 * - Lift a blacklist (`Lift_Customer_Blacklist`) — only permitted for the admin who set it.
 */

import React, { useCallback, useEffect, useState } from "react";
import { Ban, ShieldCheck, Ticket } from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { api } from "@/lib/apiClient";
import { useFeedback } from "@/components/ui/FeedbackBanner";
import {
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  LoadingState,
  PageHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import type {
  ActiveVoucher,
  BlacklistedCustomer,
  CustomerListItem,
  SessionUser,
} from "@/types/database";

function CustomersAdminContent({ currentUser }: { currentUser: SessionUser }) {
  const { notifyResult, showError } = useFeedback();

  const [vouchers, setVouchers] = useState<ActiveVoucher[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [blacklisted, setBlacklisted] = useState<BlacklistedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Voucher form
  const [voucherCustomerId, setVoucherCustomerId] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isPercentage, setIsPercentage] = useState(false);
  const [amount, setAmount] = useState("");
  const [expiryDate, setExpiryDate] = useState("2030-12-31");

  // Blacklist form
  const [blCustomerId, setBlCustomerId] = useState("");
  const [blReason, setBlReason] = useState("");
  const [confirmBlacklistOpen, setConfirmBlacklistOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [vRes, bRes] = await Promise.all([
      api.get<{ vouchers: ActiveVoucher[]; customers: CustomerListItem[] }>("/api/admin/vouchers"),
      api.get<{ blacklisted: BlacklistedCustomer[]; customers: CustomerListItem[] }>(
        "/api/admin/blacklist"
      ),
    ]);
    if (vRes.ok && vRes.data) {
      setVouchers(vRes.data.vouchers);
      setCustomers(vRes.data.customers);
      const activeCusts = vRes.data.customers.filter((c) => c.account_status === "Active");
      if (activeCusts.length > 0) {
        if (!voucherCustomerId) setVoucherCustomerId(String(activeCusts[0].customer_id));
        if (!blCustomerId) setBlCustomerId(String(activeCusts[0].customer_id));
      }
    }
    if (bRes.ok && bRes.data) {
      setBlacklisted(bRes.data.blacklisted);
    }
    setLoading(false);
  }, [blCustomerId, voucherCustomerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleIssueVoucher(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!voucherCustomerId || !promoCode.trim() || !numAmount || numAmount <= 0) {
      showError("Select a customer, enter a promo code, and provide a positive discount amount.");
      return;
    }
    if (isPercentage && (numAmount < 1 || numAmount > 100)) {
      showError("Percentage voucher discount must be between 1% and 100%.");
      return;
    }
    setBusy(true);
    const res = await api.post("/api/admin/vouchers", {
      customer_id: Number(voucherCustomerId),
      promo_code: promoCode.trim(),
      is_percentage: isPercentage,
      amount: numAmount,
      expiry_date: expiryDate,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      setPromoCode("");
      setAmount("");
      loadData();
    }
  }

  async function handleConfirmBlacklist() {
    if (!blCustomerId || !blReason.trim()) {
      showError("Select a customer and provide a reason.");
      return;
    }
    setBusy(true);
    const res = await api.post("/api/admin/blacklist", {
      customer_id: Number(blCustomerId),
      reason: blReason.trim(),
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      setConfirmBlacklistOpen(false);
      setBlReason("");
      loadData();
    }
  }

  async function handleLiftBlacklist(customerId: number) {
    setBusy(true);
    const res = await api.post("/api/admin/blacklist", {
      action: "lift",
      customer_id: customerId,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) loadData();
  }

  if (loading) return <LoadingState label="Loading customer governance..." />;

  const activeCustomers = customers.filter((c) => c.account_status === "Active");
  const selectedBlCustomer = customers.find((c) => String(c.customer_id) === blCustomerId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Vouchers & Blacklist"
        description="Issue promotional vouchers to active customers and enforce account blacklists."
      />

      {/* Row 1: Vouchers */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader title="Issue Voucher" subtitle="Assign a new promo code to a customer." />
          <form onSubmit={handleIssueVoucher} className="space-y-4 p-5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Customer *</label>
              <select
                value={voucherCustomerId}
                onChange={(e) => setVoucherCustomerId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.customer_name} ({c.username}) — {c.account_status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Promo Code *</label>
              <input
                type="text"
                required
                maxLength={30}
                placeholder="e.g. SUMMER10"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Discount Type</label>
                <select
                  value={isPercentage ? "percent" : "fixed"}
                  onChange={(e) => setIsPercentage(e.target.value === "percent")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="fixed">Fixed Amount (EGP)</option>
                  <option value="percent">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Amount ({isPercentage ? "1–100%" : "EGP"}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Expiry Date *</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <Button type="submit" loading={busy} className="w-full">
              <Ticket className="h-4 w-4" /> Issue Voucher
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader
            title={`Active Vouchers (${vouchers.length})`}
            subtitle="Unused vouchers that have not yet expired."
          />
          <div className="overflow-x-auto p-5">
            {vouchers.length === 0 ? (
              <EmptyState title="No active vouchers" />
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="pb-3 pr-4">Code</th>
                    <th className="pb-3 pr-4">Customer</th>
                    <th className="pb-3 pr-4">Value</th>
                    <th className="pb-3">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vouchers.map((v) => (
                    <tr key={v.voucher_id}>
                      <td className="py-3 pr-4 font-mono font-semibold text-emerald-700">
                        {v.promo_code}
                      </td>
                      <td className="py-3 pr-4 text-slate-800">
                        {v.customer_name || `Customer #${v.customer_id}`}
                      </td>
                      <td className="py-3 pr-4 font-medium">
                        {v.is_percentage ? `${v.amount}% off` : `${v.amount.toFixed(2)} EGP`}
                      </td>
                      <td className="py-3 text-slate-600">{v.expiry_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* Row 2: Blacklist */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader
            title="Blacklist a Customer"
            subtitle="Restricts checkout, deletes unused vouchers, and refunds unpicked orders."
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!blCustomerId || !blReason.trim()) {
                showError("Select an active customer and enter a reason.");
                return;
              }
              setConfirmBlacklistOpen(true);
            }}
            className="space-y-4 p-5"
          >
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Active Customer *
              </label>
              <select
                value={blCustomerId}
                onChange={(e) => setBlCustomerId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {activeCustomers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.customer_name} ({c.active_zone || "No zone"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Reason *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe why this customer is being blacklisted..."
                value={blReason}
                onChange={(e) => setBlReason(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <Button type="submit" variant="danger" className="w-full" disabled={activeCustomers.length === 0}>
              <Ban className="h-4 w-4" /> Blacklist Customer
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader
            title={`Blacklisted Customers (${blacklisted.length})`}
            subtitle="You can only lift blacklists that you placed."
          />
          <div className="overflow-x-auto p-5">
            {blacklisted.length === 0 ? (
              <EmptyState title="No blacklisted customers" />
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="pb-3 pr-4">Customer</th>
                    <th className="pb-3 pr-4">Reason</th>
                    <th className="pb-3 pr-4">Blacklisted By</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {blacklisted.map((b) => {
                    const isOwner = b.admin_id === currentUser.userId;
                    return (
                      <tr key={b.customer_id}>
                        <td className="py-3 pr-4 font-semibold text-slate-900">
                          {b.customer_name}
                          <div className="mt-0.5">
                            <StatusBadge status="Blacklisted" />
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{b.reason}</td>
                        <td className="py-3 pr-4 text-slate-600">{b.blacklisted_by}</td>
                        <td className="py-3 text-right">
                          {isOwner ? (
                            <Button
                              size="sm"
                              loading={busy}
                              onClick={() => handleLiftBlacklist(b.customer_id)}
                            >
                              <ShieldCheck className="h-3.5 w-3.5" /> Lift Blacklist
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Only {b.blacklisted_by} can lift
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* Confirm Blacklist Dialog (Req 3.1f) */}
      <ConfirmDialog
        open={confirmBlacklistOpen}
        onCancel={() => setConfirmBlacklistOpen(false)}
        onConfirm={handleConfirmBlacklist}
        title={`Blacklist "${selectedBlCustomer?.customer_name}"?`}
        consequence="Their account status will become Blacklisted, all unused vouchers will be permanently deleted, and any unpicked orders will be cancelled and refunded."
        confirmLabel="Confirm Blacklist"
        loading={busy}
      />
    </div>
  );
}

export default function AdminCustomersPage() {
  return (
    <RoleGuard allowedRole="Admin">
      {(user) => <CustomersAdminContent currentUser={user} />}
    </RoleGuard>
  );
}
