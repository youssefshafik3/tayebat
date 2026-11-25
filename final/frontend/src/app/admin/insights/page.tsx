"use client";

/**
 * Admin Platform Insights: Daily Revenue, Riders, & Market (3.3d, 3.3e, 3.3f)
 * ---------------------------------------------------------------------------
 * - Daily Revenue Report (`Daily_Revenue_Report(date)`): gross sales, delivery
 *   fees, and platform commission grouped by zone & business type.
 * - Riders (`TopRiders` + `RiderPerformanceSummary`): top 5 riders for a date
 *   range and full rider performance summary.
 * - Market (`TopSellingProducts` + `BusinessRatingsSummary`): what sells most
 *   and which businesses customers love or avoid.
 */

import React, { useCallback, useEffect, useState } from "react";
import { Award, DollarSign, Star, TrendingUp } from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { api } from "@/lib/apiClient";
import {
  Card,
  CardHeader,
  EmptyState,
  LoadingState,
  PageHeader,
} from "@/components/ui/Primitives";
import type {
  BusinessRatingRow,
  DailyRevenueRow,
  RiderPerformanceRow,
  TopRiderRow,
  TopSellingProductRow,
} from "@/types/database";

function InsightsContent() {
  const [reportDate, setReportDate] = useState("2026-09-01");
  const [fromDate, setFromDate] = useState("2026-09-01");
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenueRow[]>([]);
  const [topRiders, setTopRiders] = useState<TopRiderRow[]>([]);
  const [riderSummary, setRiderSummary] = useState<RiderPerformanceRow[]>([]);
  const [topProducts, setTopProducts] = useState<TopSellingProductRow[]>([]);
  const [businessRatings, setBusinessRatings] = useState<BusinessRatingRow[]>([]);

  const loadData = useCallback(async () => {
    const res = await api.get<{
      dailyRevenue: DailyRevenueRow[];
      topRiders: TopRiderRow[];
      riderPerfSummary: RiderPerformanceRow[];
      topProducts: TopSellingProductRow[];
      businessRatings: BusinessRatingRow[];
    }>(`/api/admin/insights?date=${reportDate}&from=${fromDate}&to=${toDate}`);
    if (res.ok && res.data) {
      setDailyRevenue(res.data.dailyRevenue);
      setTopRiders(res.data.topRiders);
      setRiderSummary(res.data.riderPerfSummary);
      setTopProducts(res.data.topProducts);
      setBusinessRatings(res.data.businessRatings);
    }
    setLoading(false);
  }, [reportDate, fromDate, toDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingState label="Loading revenue, rider & market insights..." />;

  const totalGross = dailyRevenue.reduce((s, r) => s + r.gross_sales, 0);
  const totalFees = dailyRevenue.reduce((s, r) => s + r.delivery_fees, 0);
  const totalCommission = dailyRevenue.reduce((s, r) => s + r.platform_commission, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue, Riders & Market Insights"
        description="Analyze daily revenue sources, top riders, and customer-favorite products & businesses."
      />

      {/* 1. Daily Revenue Report (Req 3.3d) */}
      <Card>
        <CardHeader
          title="Revenue of a Day"
          subtitle="Where did the money of this day come from, and how much did the platform earn?"
          action={
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setReportDate("2026-09-01")}
                className="rounded-lg border border-slate-200 px-2.5 py-1 hover:bg-slate-50 cursor-pointer"
              >
                2026-09-01
              </button>
              <button
                type="button"
                onClick={() => setReportDate("2026-09-02")}
                className="rounded-lg border border-slate-200 px-2.5 py-1 hover:bg-slate-50 cursor-pointer"
              >
                2026-09-02
              </button>
              <button
                type="button"
                onClick={() => setReportDate(new Date().toISOString().slice(0, 10))}
                className="rounded-lg border border-slate-200 px-2.5 py-1 hover:bg-slate-50 cursor-pointer"
              >
                Today
              </button>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5"
              />
            </div>
          }
        />
        <div className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/70">
              <p className="text-xs font-semibold text-slate-500 uppercase">Gross Product Sales</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{totalGross.toFixed(2)} EGP</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/70">
              <p className="text-xs font-semibold text-slate-500 uppercase">Delivery Fees Collected</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{totalFees.toFixed(2)} EGP</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200">
              <p className="text-xs font-semibold text-emerald-700 uppercase">
                Platform Commission (10%)
              </p>
              <p className="mt-1 text-xl font-bold text-emerald-900">
                {totalCommission.toFixed(2)} EGP
              </p>
            </div>
          </div>

          {dailyRevenue.length === 0 ? (
            <EmptyState
              icon={<DollarSign className="h-8 w-8" />}
              title={`No orders recorded on ${reportDate}`}
              description="Pick another date (such as 2026-09-01 or 2026-09-02 from seed data) to inspect daily revenue."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="pb-3 pr-4">Zone</th>
                    <th className="pb-3 pr-4">Business Type</th>
                    <th className="pb-3 pr-4">Sub-Orders</th>
                    <th className="pb-3 pr-4">Gross Sales</th>
                    <th className="pb-3 pr-4">Delivery Fees</th>
                    <th className="pb-3">Platform Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyRevenue.map((row, idx) => (
                    <tr key={`${row.zone_name}-${row.business_type}-${idx}`}>
                      <td className="py-3 pr-4 font-semibold text-slate-900">{row.zone_name}</td>
                      <td className="py-3 pr-4">{row.business_type}</td>
                      <td className="py-3 pr-4">{row.number_of_suborders}</td>
                      <td className="py-3 pr-4">{row.gross_sales.toFixed(2)} EGP</td>
                      <td className="py-3 pr-4">{row.delivery_fees.toFixed(2)} EGP</td>
                      <td className="py-3 font-semibold text-emerald-700">
                        {row.platform_commission.toFixed(2)} EGP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* 2. Riders Insights (Req 3.3e) */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader
            title="Top 5 Riders (Period)"
            subtitle="Who delivered the most orders in the chosen range?"
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
          <div className="p-5">
            {topRiders.length === 0 ? (
              <EmptyState title="No completed deliveries in this period" />
            ) : (
              <div className="space-y-3">
                {topRiders.map((r) => (
                  <div
                    key={r.rider_id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
                        #{r.rider_rank}
                      </span>
                      <span className="font-semibold text-slate-900 text-sm">{r.rider_name}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">
                      {r.completed_delivery_count} deliveries
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader
            title="All Riders Performance Summary"
            subtitle="Compare completed deliveries and customer ratings across zones."
          />
          <div className="overflow-x-auto p-5">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="pb-3 pr-4">Rider</th>
                  <th className="pb-3 pr-4">Zone</th>
                  <th className="pb-3 pr-4">Completed Deliveries</th>
                  <th className="pb-3">Avg Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riderSummary.map((r) => (
                  <tr key={r.rider_id}>
                    <td className="py-3 pr-4 font-semibold text-slate-900">{r.rider_name}</td>
                    <td className="py-3 pr-4 text-slate-600">{r.zone_name}</td>
                    <td className="py-3 pr-4">{r.completed_deliveries}</td>
                    <td className="py-3">
                      {r.avg_rating !== null ? (
                        <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {r.avg_rating.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400">No ratings yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* 3. Market Insights (Req 3.3f) */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader
            title="Top Selling Products"
            subtitle="What sells most on the platform?"
            action={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          />
          <div className="overflow-x-auto p-5">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 pr-4">Business</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Units Sold</th>
                  <th className="pb-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts.map((p) => (
                  <tr key={p.product_id}>
                    <td className="py-3 pr-4 font-semibold text-slate-900">{p.product_name}</td>
                    <td className="py-3 pr-4 text-slate-600">{p.business_name}</td>
                    <td className="py-3 pr-4 text-slate-500">{p.business_type}</td>
                    <td className="py-3 pr-4 font-semibold">{p.units_sold}</td>
                    <td className="py-3 font-medium text-emerald-700">
                      {p.total_revenue.toFixed(2)} EGP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader
            title="Business Ratings Summary"
            subtitle="Which businesses do customers love or avoid?"
            action={<Award className="h-5 w-5 text-amber-600" />}
          />
          <div className="overflow-x-auto p-5">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="pb-3 pr-4">Business</th>
                  <th className="pb-3 pr-4">Avg Rating</th>
                  <th className="pb-3">Reviews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {businessRatings.map((b) => (
                  <tr key={b.business_id}>
                    <td className="py-3 pr-4 font-semibold text-slate-900">{b.business_name}</td>
                    <td className="py-3 pr-4">
                      {b.avg_rating !== null ? (
                        <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {b.avg_rating.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400">No reviews</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-600">{b.ratings_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminInsightsPage() {
  return <RoleGuard allowedRole="Admin">{() => <InsightsContent />}</RoleGuard>;
}
