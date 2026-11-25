"use client";

/**
 * Customer Orders, Tracking, ETA Prediction, Cancel, Reorder & Feedback
 * ---------------------------------------------------------------------------
 * Requirements 3.6c, 3.6d, 3.6e:
 * - Shows order history (`My_Order_History`) and each order's sub-orders
 *   (`h_OrderSubOrders`) with rider, timestamps, and progress.
 * - For active orders (`Placed` / `In Progress`), predicts an estimated arrival
 *   from database data (`expected_delivery_time` + `ZoneDeliveryPerformance`).
 * - Cancel Order (`Cancel_Order`) with a ConfirmDialog showing the exact refund
 *   amount.
 * - Reorder (`Reorder`) to a chosen saved address.
 * - Submit Feedback (`Submit_Feedback`) and Rate Rider (`Rate_Rider`) on
 *   Delivered sub-orders.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  MessageSquare,
  RotateCcw,
  ShoppingBag,
  Star,
  XCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { api } from "@/lib/apiClient";
import { useFeedback } from "@/components/ui/FeedbackBanner";
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
  StarRating,
  StatusBadge,
} from "@/components/ui/Primitives";
import type {
  CustomerAddress,
  CustomerOrderRow,
  OrderSubOrderRow,
  ZoneDeliveryPerformanceRow,
} from "@/types/database";

function estimateOrderArrival(
  order: CustomerOrderRow,
  subs: OrderSubOrderRow[],
  zonePerf: ZoneDeliveryPerformanceRow[]
): string | null {
  if (order.status === "Delivered" || order.status === "Cancelled") return null;
  const activeSubs = subs.filter((s) => s.status !== "Delivered" && s.status !== "Cancelled");
  if (activeSubs.length === 0) return null;

  const zoneAvg = zonePerf.find((z) => z.zone_name === order.zone_name)?.avg_tracking_time ?? null;

  const estimates = activeSubs.map((s) => {
    const baseExpected = s.expected_delivery_time;
    const blended = zoneAvg !== null ? Math.round((baseExpected + zoneAvg) / 2) : baseExpected;
    // If already picked up by rider, roughly half the journey remains
    return s.status === "Picked Up" ? Math.max(8, Math.round(blended * 0.5)) : blended;
  });

  const maxEst = Math.max(...estimates);
  const basis =
    zoneAvg !== null
      ? `based on business prep time & ${order.zone_name} avg delivery speed (${zoneAvg} min)`
      : `based on business expected delivery time`;
  return `Estimated arrival in ~${maxEst} min (${basis})`;
}

function CustomerOrdersContent() {
  const router = useRouter();
  const { notifyResult, showError } = useFeedback();

  const [orders, setOrders] = useState<CustomerOrderRow[]>([]);
  const [subOrdersByOrder, setSubOrdersByOrder] = useState<Record<number, OrderSubOrderRow[]>>({});
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [zonePerf, setZonePerf] = useState<ZoneDeliveryPerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Cancel Confirm
  const [cancelTarget, setCancelTarget] = useState<CustomerOrderRow | null>(null);

  // Reorder Modal
  const [reorderTarget, setReorderTarget] = useState<CustomerOrderRow | null>(null);
  const [reorderAddrId, setReorderAddrId] = useState("");

  // Feedback Modal
  const [feedbackSub, setFeedbackSub] = useState<OrderSubOrderRow | null>(null);
  const [fbHeadline, setFbHeadline] = useState("");
  const [fbDesc, setFbDesc] = useState("");
  const [fbRating, setFbRating] = useState(5);

  // Rider Rating Modal
  const [rateRiderSub, setRateRiderSub] = useState<OrderSubOrderRow | null>(null);
  const [riderStars, setRiderStars] = useState(5);

  const loadData = useCallback(async () => {
    const res = await api.get<{
      orders: CustomerOrderRow[];
      subOrdersByOrder: Record<number, OrderSubOrderRow[]>;
      addresses: CustomerAddress[];
      zonePerf: ZoneDeliveryPerformanceRow[];
    }>("/api/customer/orders");

    if (res.ok && res.data) {
      setOrders(res.data.orders);
      setSubOrdersByOrder(res.data.subOrdersByOrder);
      setAddresses(res.data.addresses);
      setZonePerf(res.data.zonePerf);
      const active = res.data.addresses.find((a) => a.is_active) ?? res.data.addresses[0];
      if (active && !reorderAddrId) setReorderAddrId(String(active.address_id));
    }
    setLoading(false);
  }, [reorderAddrId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setBusy(true);
    const res = await api.post("/api/customer/orders", {
      action: "cancel",
      order_id: cancelTarget.order_id,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      setCancelTarget(null);
      loadData();
    }
  }

  async function handleReorder(e: React.FormEvent) {
    e.preventDefault();
    if (!reorderTarget || !reorderAddrId) return;
    setBusy(true);
    const res = await api.post("/api/customer/orders", {
      action: "reorder",
      order_id: reorderTarget.order_id,
      address_id: Number(reorderAddrId),
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      setReorderTarget(null);
      router.push("/customer/cart");
    }
  }

  async function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!feedbackSub || !fbHeadline.trim()) {
      showError("Please enter a review headline.");
      return;
    }
    setBusy(true);
    const res = await api.post("/api/customer/orders", {
      action: "feedback",
      suborder_id: feedbackSub.suborder_id,
      headline: fbHeadline.trim(),
      description: fbDesc.trim() || null,
      rating: fbRating,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      setFeedbackSub(null);
      setFbHeadline("");
      setFbDesc("");
      setFbRating(5);
      loadData();
    }
  }

  async function handleRateRider(e: React.FormEvent) {
    e.preventDefault();
    if (!rateRiderSub) return;
    setBusy(true);
    const res = await api.post("/api/customer/orders", {
      action: "rate_rider",
      suborder_id: rateRiderSub.suborder_id,
      rider_rating: riderStars,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      setRateRiderSub(null);
      setRiderStars(5);
      loadData();
    }
  }

  if (loading) return <LoadingState label="Loading your order history..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Orders & Tracking"
        description="Track live sub-order progress, estimated arrival times, cancel eligible orders, reorder, and leave reviews."
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10" />}
          title="No orders placed yet"
          description="Browse businesses and place your first order."
        />
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const subs = subOrdersByOrder[order.order_id] ?? [];
            const etaText = estimateOrderArrival(order, subs, zonePerf);
            const canCancel =
              order.status !== "Cancelled" &&
              !subs.some((s) => s.status === "Picked Up" || s.status === "Delivered");
            const refundable = Math.max(0, order.total_amount - order.refunded_amount);

            return (
              <Card key={order.order_id} className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base font-bold text-slate-900">
                        Order #{order.order_id}
                      </h2>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {order.order_date} · Zone: {order.zone_name} · Paid via{" "}
                      {order.payment_method || "—"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {order.total_amount.toFixed(2)} EGP
                      </p>
                      {order.discount_amount > 0 && (
                        <p className="text-[11px] text-emerald-700">
                          Saved {order.discount_amount.toFixed(2)} EGP
                        </p>
                      )}
                      {order.refunded_amount > 0 && (
                        <p className="text-[11px] text-rose-700">
                          Refunded: {order.refunded_amount.toFixed(2)} EGP
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReorderTarget(order)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reorder
                    </Button>

                    {canCancel && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setCancelTarget(order)}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {etaText && (
                  <div className="flex items-center gap-2 border-b border-sky-100 bg-sky-50 px-5 py-2.5 text-xs font-medium text-sky-900">
                    <Clock className="h-4 w-4 text-sky-600" />
                    <span>{etaText}</span>
                  </div>
                )}

                <div className="divide-y divide-slate-100 p-5">
                  {subs.map((s) => (
                    <div
                      key={s.suborder_id}
                      className="flex flex-wrap items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">
                            {s.business_name}
                          </span>
                          <StatusBadge status={s.status} />
                        </div>
                        <p className="text-xs text-slate-600">
                          Items: {s.total_price.toFixed(2)} EGP + Delivery:{" "}
                          {s.delivery_fee.toFixed(2)} EGP
                          {s.rider_name && ` · Rider: ${s.rider_name}`}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {s.assigned_at && `Assigned: ${s.assigned_at}`}
                          {s.picked_up_at && ` · Picked up: ${s.picked_up_at}`}
                          {s.delivered_at && ` · Delivered: ${s.delivered_at}`}
                        </p>
                      </div>

                      {s.status === "Delivered" && (
                        <div className="flex flex-wrap items-center gap-2">
                          {s.has_feedback ? (
                            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              Feedback submitted
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setFeedbackSub(s);
                                setFbRating(5);
                              }}
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> Leave Feedback
                            </Button>
                          )}

                          {s.rider_rating !== null ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              Rider: {s.rider_rating}/5
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setRateRiderSub(s);
                                setRiderStars(5);
                              }}
                            >
                              <Star className="h-3.5 w-3.5" /> Rate Rider
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Order Confirm Dialog (Req 3.1f & 3.6d showing refund amount) */}
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onCancel={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        title={`Cancel Order #${cancelTarget?.order_id}?`}
        consequence={
          cancelTarget
            ? `All pending parts of this order will be cancelled. ${
                cancelTarget.payment_method === "Cash"
                  ? `Cash payment of ${Math.max(
                      0,
                      cancelTarget.total_amount - cancelTarget.refunded_amount
                    ).toFixed(2)} EGP will be voided.`
                  : `${Math.max(
                      0,
                      cancelTarget.total_amount - cancelTarget.refunded_amount
                    ).toFixed(2)} EGP will be refunded to your wallet.`
              }`
            : ""
        }
        confirmLabel="Cancel Order"
        loading={busy}
      />

      {/* Reorder Modal */}
      <Modal
        open={Boolean(reorderTarget)}
        onClose={() => setReorderTarget(null)}
        title={`Reorder Order #${reorderTarget?.order_id}`}
      >
        <form onSubmit={handleReorder} className="space-y-4">
          <p className="text-sm text-slate-600">
            Choose which delivery address should receive this reorder (must be in{" "}
            <strong>{reorderTarget?.zone_name}</strong> and have no active cart yet).
          </p>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Delivery Address *
            </label>
            <select
              value={reorderAddrId}
              onChange={(e) => setReorderAddrId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {addresses.map((a) => (
                <option key={a.address_id} value={a.address_id}>
                  {a.description} ({a.zone_name}){a.is_active ? " — Active" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setReorderTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Create Reorder Cart
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submit Feedback Modal */}
      <Modal
        open={Boolean(feedbackSub)}
        onClose={() => setFeedbackSub(null)}
        title={`Review "${feedbackSub?.business_name}"`}
      >
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Rating *</label>
            <StarRating value={fbRating} onChange={setFbRating} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Headline *</label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Hot and delicious!"
              value={fbHeadline}
              onChange={(e) => setFbHeadline(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Details (optional)
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={fbDesc}
              onChange={(e) => setFbDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setFeedbackSub(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rate Rider Modal */}
      <Modal
        open={Boolean(rateRiderSub)}
        onClose={() => setRateRiderSub(null)}
        title={`Rate Rider (${rateRiderSub?.rider_name ?? "Delivery"})`}
      >
        <form onSubmit={handleRateRider} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              How was your delivery experience? *
            </label>
            <StarRating value={riderStars} onChange={setRiderStars} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRateRiderSub(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Save Rider Rating
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function CustomerOrdersPage() {
  return <RoleGuard allowedRole="Customer">{() => <CustomerOrdersContent />}</RoleGuard>;
}
