"use client";

/**
 * Rider Performance: Earnings, Ratings & Delivery History (Requirement 3.4g)
 * ---------------------------------------------------------------------------
 * - `My_Earnings(rider_id, from_date, to_date)`: completed deliveries, total
 *   delivery fees, and rider's 80% earnings.
 * - `My_Rating_Summary(rider_id)`: average rating & 1–5 star distribution.
 * - `My_Delivery_History(rider_id, from_date, to_date)`: past deliveries with
 *   tracking speed in minutes.
 */

import React, { useCallback, useEffect, useState } from "react";
import { Clock, DollarSign, Star } from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { api } from "@/lib/apiClient";
import {
  Card,
  CardHeader,
  EmptyState,
  LoadingState,
  PageHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import type {
  RiderDeliveryHistoryRow,
  RiderEarnings,
  RiderRatingSummary,
} from "@/types/database";

function RiderPerformanceContent() {
  const [fromDate, setFromDate] = useState("2026-09-01");
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [earnings, setEarnings] = useState<RiderEarnings | null>(null);
  const [ratings, setRatings] = useState<RiderRatingSummary | null>(null);
  const [history, setHistory] = useState<RiderDeliveryHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const res = await api.get<{
      earnings: RiderEarnings;
      ratingSummary: RiderRatingSummary;
      history: RiderDeliveryHistoryRow[];
    }>(`/api/rider/performance?from=${fromDate}&to=${toDate}`);
    if (res.ok && res.data) {
      setEarnings(res.data.earnings);
      setRatings(res.data.ratingSummary);
      setHistory(res.data.history);
    }
    setLoading(false);
  }, [fromDate, toDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingState label="Loading your rider performance..." />;

  const deliveredWithTime = history.filter((h) => h.tracking_time !== null);
  const avgSpeed =
    deliveredWithTime.length > 0
      ? (
          deliveredWithTime.reduce((sum, h) => sum + (h.tracking_time ?? 0), 0) /
          deliveredWithTime.length
        ).toFixed(1)
      : null;

  const totalRatings = Math.max(1, ratings?.ratings_count ?? 0);
  const starRows = [
    { label: "5 stars", count: ratings?.five_star ?? 0 },
    { label: "4 stars", count: ratings?.four_star ?? 0 },
    { label: "3 stars", count: ratings?.three_star ?? 0 },
    { label: "2 stars", count: ratings?.two_star ?? 0 },
    { label: "1 star", count: ratings?.one_star ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Earnings, Speed & Ratings"
        description="Track how much you earned, how fast you deliver, and how customers rate you."
        actions={
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="font-medium text-slate-600">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
            />
            <label className="font-medium text-slate-600">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
            />
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Completed Deliveries</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {earnings?.completed_deliveries ?? 0}
          </p>
        </Card>

        <Card className="p-5 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold uppercase">My Earnings (80% of fees)</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-900">
            {(earnings?.total_earnings ?? 0).toFixed(2)} EGP
          </p>
          <p className="mt-0.5 text-xs text-emerald-700">
            Total fees: {(earnings?.total_delivery_fees ?? 0).toFixed(2)} EGP
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Average Delivery Speed</span>
            <Clock className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {avgSpeed ? `${avgSpeed} min` : "—"}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Average Rating</span>
            <Star className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {ratings?.avg_rating !== null && ratings?.avg_rating !== undefined
              ? `${ratings.avg_rating.toFixed(2)} / 5`
              : "No ratings"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{ratings?.ratings_count ?? 0} ratings</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader title="Rating Breakdown" subtitle="Customer ratings across all deliveries." />
          <div className="space-y-3 p-5">
            {starRows.map((row) => {
              const pct = ratings?.ratings_count ? Math.round((row.count / totalRatings) * 100) : 0;
              return (
                <div key={row.label} className="flex items-center gap-3 text-xs">
                  <span className="w-14 font-medium text-slate-600">{row.label}</span>
                  <div className="h-2.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right font-semibold text-slate-700">{row.count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="lg:col-span-8">
          <CardHeader
            title={`Delivery History (${history.length})`}
            subtitle="Delivered and cancelled assignments in the selected period."
          />
          <div className="overflow-x-auto p-5">
            {history.length === 0 ? (
              <EmptyState title="No delivery history in this period" />
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="pb-3 pr-4">Order</th>
                    <th className="pb-3 pr-4">Business</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Assigned</th>
                    <th className="pb-3 pr-4">Delivered</th>
                    <th className="pb-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((h) => (
                    <tr key={h.delivery_id}>
                      <td className="py-3 pr-4 font-semibold">#{h.order_id}</td>
                      <td className="py-3 pr-4">{h.business_name}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={h.status} />
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-500">{h.assigned_at}</td>
                      <td className="py-3 pr-4 text-xs text-slate-500">{h.delivered_at || "—"}</td>
                      <td className="py-3 font-medium">
                        {h.tracking_time !== null ? `${h.tracking_time} min` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function RiderPerformancePage() {
  return <RoleGuard allowedRole="Rider">{() => <RiderPerformanceContent />}</RoleGuard>;
}
