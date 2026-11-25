"use client";

/**
 * Admin Zones & Zone Comparison (Requirements 3.3b & 3.3c)
 * ---------------------------------------------------------------------------
 * - View all zones with delivery fees (`h_ZoneList`).
 * - Create Zone & Update Zone Fee (Super Admin ONLY — hidden for Zone Admin).
 * - Zone comparison across businesses (`BusinessesPerZone`), orders & commission
 *   (`ZoneOrderReport`), and delivery speed (`ZoneDeliveryPerformance`) for a
 *   chosen date range.
 */

import React, { useCallback, useEffect, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { api } from "@/lib/apiClient";
import { useFeedback } from "@/components/ui/FeedbackBanner";
import {
  Button,
  Card,
  CardHeader,
  LoadingState,
  PageHeader,
} from "@/components/ui/Primitives";
import type {
  AdminProfile,
  BusinessesPerZoneRow,
  Zone,
  ZoneDeliveryPerformanceRow,
  ZoneOrderReportRow,
} from "@/types/database";

function ZonesContent() {
  const { notifyResult, showError } = useFeedback();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [bizCounts, setBizCounts] = useState<BusinessesPerZoneRow[]>([]);
  const [delPerf, setDelPerf] = useState<ZoneDeliveryPerformanceRow[]>([]);
  const [orderReports, setOrderReports] = useState<ZoneOrderReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [fromDate, setFromDate] = useState("2026-09-01");
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));

  // Super Admin forms
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneFee, setNewZoneFee] = useState("");
  const [feeEdits, setFeeEdits] = useState<Record<number, string>>({});

  const loadData = useCallback(async () => {
    const [profRes, insRes] = await Promise.all([
      api.get<AdminProfile>("/api/admin/profile"),
      api.get<{
        zones: Zone[];
        businessesPerZone: BusinessesPerZoneRow[];
        zoneDeliveryPerf: ZoneDeliveryPerformanceRow[];
        zoneOrderReports: ZoneOrderReportRow[];
      }>(`/api/admin/insights?from=${fromDate}&to=${toDate}`),
    ]);

    if (profRes.ok && profRes.data) setProfile(profRes.data);
    if (insRes.ok && insRes.data) {
      setZones(insRes.data.zones);
      setBizCounts(insRes.data.businessesPerZone);
      setDelPerf(insRes.data.zoneDeliveryPerf);
      setOrderReports(insRes.data.zoneOrderReports);
      const initialEdits: Record<number, string> = {};
      insRes.data.zones.forEach((z) => {
        initialEdits[z.zone_id] = String(z.delivery_fee);
      });
      setFeeEdits(initialEdits);
    }
    setLoading(false);
  }, [fromDate, toDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isSuperAdmin = profile?.role === "Super Admin";

  async function handleCreateZone(e: React.FormEvent) {
    e.preventDefault();
    const fee = Number(newZoneFee);
    if (!newZoneName.trim() || Number.isNaN(fee) || fee < 0) {
      showError("Provide a valid zone name and a delivery fee of 0 or greater.");
      return;
    }
    setBusy(true);
    const res = await api.post("/api/admin/zones", {
      zone_name: newZoneName.trim(),
      delivery_fee: fee,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      setNewZoneName("");
      setNewZoneFee("");
      loadData();
    }
  }

  async function handleUpdateFee(zoneId: number) {
    const fee = Number(feeEdits[zoneId]);
    if (Number.isNaN(fee) || fee < 0) {
      showError("Enter a delivery fee of 0 or greater.");
      return;
    }
    setBusy(true);
    const res = await api.post("/api/admin/zones", {
      action: "update_fee",
      zone_id: zoneId,
      new_fee: fee,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) loadData();
  }

  if (loading) return <LoadingState label="Loading zones and comparison metrics..." />;

  const maxOrders = Math.max(1, ...orderReports.map((r) => r.number_of_orders));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zones & Zone Comparison"
        description="Compare delivery zones by active businesses, order volume, delivery speed, and commission."
      />

      {/* Zone Comparison Table & Visual Bars (Req 3.3c) */}
      <Card>
        <CardHeader
          title="Zone Comparison"
          subtitle="Which zone is strongest and which needs help?"
          action={
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <label className="font-medium text-slate-600">From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5"
              />
              <label className="font-medium text-slate-600">To:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5"
              />
            </div>
          }
        />
        <div className="overflow-x-auto p-5">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
              <tr>
                <th className="pb-3 pr-4">Zone</th>
                <th className="pb-3 pr-4">Delivery Fee</th>
                <th className="pb-3 pr-4">Active Businesses</th>
                <th className="pb-3 pr-4">Orders (Range)</th>
                <th className="pb-3 pr-4">Avg Order Total</th>
                <th className="pb-3 pr-4">Platform Commission</th>
                <th className="pb-3">Avg Delivery Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {zones.map((z) => {
                const bz = bizCounts.find((b) => b.zone_id === z.zone_id);
                const dp = delPerf.find((d) => d.zone_id === z.zone_id);
                const rep = orderReports.find((r) => r.zone_id === z.zone_id);
                const pct = Math.round(((rep?.number_of_orders ?? 0) / maxOrders) * 100);
                return (
                  <tr key={z.zone_id}>
                    <td className="py-3 pr-4 font-semibold text-slate-900">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        {z.zone_name}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{z.delivery_fee.toFixed(2)} EGP</td>
                    <td className="py-3 pr-4">{bz?.business_count ?? 0}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 font-semibold">{rep?.number_of_orders ?? 0}</span>
                        <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {rep?.avg_order_total !== null && rep?.avg_order_total !== undefined
                        ? `${rep.avg_order_total.toFixed(2)} EGP`
                        : "—"}
                    </td>
                    <td className="py-3 pr-4 font-medium text-emerald-700">
                      {(rep?.platform_commission ?? 0).toFixed(2)} EGP
                    </td>
                    <td className="py-3">
                      {dp?.avg_tracking_time !== null && dp?.avg_tracking_time !== undefined
                        ? `${dp.avg_tracking_time} min (${dp.delivery_count} deliveries)`
                        : "No deliveries yet"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Zone Fee Management & Creation (Super Admin Only - Req 3.3b) */}
      {isSuperAdmin && (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-5">
            <CardHeader
              title="Create Delivery Zone (Super Admin)"
              subtitle="Add a new neighborhood and set its base delivery fee."
            />
            <form onSubmit={handleCreateZone} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Zone Name *</label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="e.g. Sheikh Zayed"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Delivery Fee (EGP) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={newZoneFee}
                  onChange={(e) => setNewZoneFee(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <Button type="submit" loading={busy} className="w-full">
                <Plus className="h-4 w-4" /> Create Zone
              </Button>
            </form>
          </Card>

          <Card className="lg:col-span-7">
            <CardHeader
              title="Update Zone Delivery Fees (Super Admin)"
              subtitle="Adjust delivery fees per zone."
            />
            <div className="divide-y divide-slate-100 p-5">
              {zones.map((z) => (
                <div key={z.zone_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{z.zone_name}</p>
                    <p className="text-xs text-slate-500">Current fee: {z.delivery_fee.toFixed(2)} EGP</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={feeEdits[z.zone_id] ?? ""}
                      onChange={(e) =>
                        setFeeEdits((prev) => ({ ...prev, [z.zone_id]: e.target.value }))
                      }
                      className="w-28 rounded-xl border border-slate-300 px-3 py-1.5 text-sm"
                    />
                    <Button size="sm" loading={busy} onClick={() => handleUpdateFee(z.zone_id)}>
                      Save Fee
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function AdminZonesPage() {
  return <RoleGuard allowedRole="Admin">{() => <ZonesContent />}</RoleGuard>;
}
