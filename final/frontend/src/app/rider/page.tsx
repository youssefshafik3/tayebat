"use client";

/**
 * Rider Home & Active Deliveries (Requirements 3.4e & 3.4f)
 * ---------------------------------------------------------------------------
 * - Displays Rider profile (`h_RiderProfile`) and interactive Availability toggle
 *   (`Set_Rider_Availability`).
 * - Shows active deliveries (`My_Active_Deliveries`) with a visual journey
 *   stepper (`Assigned` -> `Picked Up` -> `Delivered`) and clear next-step
 *   buttons (`Mark_Picked_Up`, `Mark_Delivered`).
 */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bike, CheckCircle2, MapPin, PackageCheck, Truck } from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { api } from "@/lib/apiClient";
import { useFeedback } from "@/components/ui/FeedbackBanner";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  LoadingState,
  PageHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import type { ActiveDelivery, RiderProfile } from "@/types/database";

function RiderHomeContent() {
  const { notifyResult } = useFeedback();

  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [deliveries, setDeliveries] = useState<ActiveDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    const [profRes, delRes] = await Promise.all([
      api.get<RiderProfile>("/api/rider/profile"),
      api.get<ActiveDelivery[]>("/api/rider/deliveries"),
    ]);
    if (profRes.ok && profRes.data) setProfile(profRes.data);
    if (delRes.ok && delRes.data) setDeliveries(delRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function toggleAvailability() {
    if (!profile) return;
    setBusy(true);
    const res = await api.post("/api/rider/profile", {
      is_available: !profile.is_available,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) loadData();
  }

  async function handleDeliveryAction(deliveryId: number, action: "picked_up" | "delivered") {
    setBusy(true);
    const res = await api.post("/api/rider/deliveries", {
      delivery_id: deliveryId,
      action,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) loadData();
  }

  if (loading) return <LoadingState label="Loading your rider dashboard..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${profile?.rider_name ?? "Rider"}`}
        description="Switch your availability and complete your assigned deliveries step by step."
        actions={
          <Link href="/rider/performance">
            <Button variant="outline" size="sm">
              Earnings & Ratings
            </Button>
          </Link>
        }
      />

      {/* Profile & Availability Card */}
      {profile && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Bike className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{profile.rider_name}</h2>
                  <StatusBadge status={profile.is_available ? "Available" : "Unavailable"} />
                </div>
                <p className="mt-0.5 text-xs text-slate-600">
                  Zone: <strong>{profile.zone_name}</strong> · Vehicle: {profile.vehicle_type} (
                  {profile.plate_no})
                </p>
              </div>
            </div>

            <Button
              variant={profile.is_available ? "outline" : "primary"}
              loading={busy}
              onClick={toggleAvailability}
            >
              {profile.is_available ? "Go Offline (Unavailable)" : "Go Online (Available)"}
            </Button>
          </div>
        </Card>
      )}

      {/* Active Deliveries */}
      <Card>
        <CardHeader
          title={`My Active Deliveries (${deliveries.length})`}
          subtitle="What do I do next? Follow each delivery's step and mark Picked Up or Delivered."
        />
        <div className="p-5">
          {deliveries.length === 0 ? (
            <EmptyState
              icon={<Truck className="h-10 w-10" />}
              title="No active deliveries right now"
              description="Make sure your availability is set to Available so new zone orders can be assigned to you."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {deliveries.map((d) => (
                <div
                  key={d.delivery_id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-500">
                        Order #{d.order_id} · SubOrder #{d.suborder_id}
                      </span>
                      <StatusBadge status={d.status} />
                    </div>

                    <h3 className="mt-2 text-base font-bold text-slate-900">{d.business_name}</h3>
                    <p className="mt-1 text-sm text-slate-700">
                      Deliver to: <strong>{d.customer_name}</strong>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      {d.address_description} ({d.zone_name})
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Assigned at: {d.assigned_at}</p>

                    {/* Journey Progress Indicator */}
                    <div className="mt-4 flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-800">
                        1. Assigned
                      </span>
                      <span className="h-px flex-1 bg-slate-200" />
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-semibold ${
                          d.status === "Picked Up"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        2. Picked Up
                      </span>
                      <span className="h-px flex-1 bg-slate-200" />
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-400">
                        3. Delivered
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    {d.status === "Assigned" ? (
                      <Button
                        className="w-full"
                        loading={busy}
                        onClick={() => handleDeliveryAction(d.delivery_id, "picked_up")}
                      >
                        <PackageCheck className="h-4 w-4" /> Next Step: Mark Picked Up
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="w-full"
                        loading={busy}
                        onClick={() => handleDeliveryAction(d.delivery_id, "delivered")}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Next Step: Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function RiderHomePage() {
  return <RoleGuard allowedRole="Rider">{() => <RiderHomeContent />}</RoleGuard>;
}
