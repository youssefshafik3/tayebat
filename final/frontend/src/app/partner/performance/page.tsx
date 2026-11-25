"use client";

/**
 * Partner Business Performance (Requirement 3.4d)
 * ---------------------------------------------------------------------------
 * - Sales Report (`BusinessSalesReport(business_id, from_date, to_date)`):
 *   shows which products bring revenue in the chosen period.
 * - Feedback Overview (`BusinessFeedbackOverview(business_id)`):
 *   shows average rating, total feedbacks, and 5-star down to 1-star counts.
 */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Star } from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { api } from "@/lib/apiClient";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  LoadingState,
  PageHeader,
} from "@/components/ui/Primitives";
import type {
  BusinessFeedbackOverview,
  BusinessSalesRow,
  PartnerBusiness,
} from "@/types/database";

function PartnerPerformanceContent() {
  const [fromDate, setFromDate] = useState("2026-09-01");
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [business, setBusiness] = useState<PartnerBusiness | null>(null);
  const [sales, setSales] = useState<BusinessSalesRow[]>([]);
  const [feedback, setFeedback] = useState<BusinessFeedbackOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const res = await api.get<{
      business: PartnerBusiness | null;
      sales: BusinessSalesRow[];
      feedback: BusinessFeedbackOverview | null;
    }>(`/api/partner/performance?from=${fromDate}&to=${toDate}`);
    if (res.ok && res.data) {
      setBusiness(res.data.business);
      setSales(res.data.sales);
      setFeedback(res.data.feedback);
    }
    setLoading(false);
  }, [fromDate, toDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingState label="Loading business performance..." />;

  if (!business) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-10 w-10" />}
        title="No business registered yet"
        description="Register your business first to track product sales and customer feedback."
        action={
          <Link href="/partner">
            <Button>Go to My Business</Button>
          </Link>
        }
      />
    );
  }

  const totalRevenue = sales.reduce((acc, r) => acc + r.revenue_per_product, 0);
  const totalUnits = sales.reduce((acc, r) => acc + r.units_sold, 0);
  const fbTotal = Math.max(1, feedback?.number_of_feedbacks ?? 0);

  const starRows = [
    { label: "5 stars", count: feedback?.five_star ?? 0 },
    { label: "4 stars", count: feedback?.four_star ?? 0 },
    { label: "3 stars", count: feedback?.three_star ?? 0 },
    { label: "2 stars", count: feedback?.two_star ?? 0 },
    { label: "1 star", count: feedback?.one_star ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Business Performance"
        description={`Revenue breakdown and customer sentiment for ${business.business_name}.`}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Product Sales Report */}
        <Card className="lg:col-span-7">
          <CardHeader
            title="Product Sales Report"
            subtitle="Which products bring your revenue in this period?"
            action={
              <div className="flex items-center gap-1.5 text-xs">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1"
                />
                <span>–</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1"
                />
              </div>
            }
          />
          <div className="p-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/70">
                <p className="text-xs font-semibold text-slate-500 uppercase">Units Sold</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{totalUnits}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200">
                <p className="text-xs font-semibold text-emerald-700 uppercase">Total Revenue</p>
                <p className="mt-1 text-2xl font-bold text-emerald-900">
                  {totalRevenue.toFixed(2)} EGP
                </p>
              </div>
            </div>

            {sales.length === 0 ? (
              <EmptyState
                title="No sales in this date range"
                description="Try expanding your date range (seed orders are from September 2026)."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                    <tr>
                      <th className="pb-3 pr-4">Product</th>
                      <th className="pb-3 pr-4">Units Sold</th>
                      <th className="pb-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sales.map((s) => (
                      <tr key={s.product_id}>
                        <td className="py-3 pr-4 font-semibold text-slate-900">{s.product_name}</td>
                        <td className="py-3 pr-4">{s.units_sold}</td>
                        <td className="py-3 font-semibold text-emerald-700">
                          {s.revenue_per_product.toFixed(2)} EGP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Customer Feedback Overview */}
        <Card className="lg:col-span-5">
          <CardHeader
            title="Customer Feedback Overview"
            subtitle="What do customers think of your business?"
          />
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-4 rounded-xl bg-amber-50/70 border border-amber-200 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Star className="h-6 w-6 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {feedback?.avg_rating !== null && feedback?.avg_rating !== undefined
                    ? `${feedback.avg_rating.toFixed(2)} / 5`
                    : "No ratings yet"}
                </p>
                <p className="text-xs text-slate-600">
                  Based on {feedback?.number_of_feedbacks ?? 0} customer review
                  {feedback?.number_of_feedbacks === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {starRows.map((row) => {
                const pct = feedback?.number_of_feedbacks
                  ? Math.round((row.count / fbTotal) * 100)
                  : 0;
                return (
                  <div key={row.label} className="flex items-center gap-3 text-xs">
                    <span className="w-14 font-medium text-slate-600">{row.label}</span>
                    <div className="h-2.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-semibold text-slate-700">{row.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function PartnerPerformancePage() {
  return <RoleGuard allowedRole="Partner">{() => <PartnerPerformanceContent />}</RoleGuard>;
}
