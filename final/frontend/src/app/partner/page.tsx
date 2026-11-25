"use client";

/**
 * Partner Home & Business Management (Requirement 3.4b)
 * ---------------------------------------------------------------------------
 * - Always shows where the partner's business stands (`Pending`, `Active`,
 *   `Suspended` with its `suspension_reason`, or `Rejected`).
 * - Allows registering a business (or re-registering if `Rejected`).
 * - Allows updating opening/closing hours, website, and adding a phone number.
 */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Globe, Phone, Plus, Store } from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { api } from "@/lib/apiClient";
import { AlertBanner, useFeedback } from "@/components/ui/FeedbackBanner";
import {
  Button,
  Card,
  CardHeader,
  LoadingState,
  PageHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import type { BusinessType, PartnerBusiness, Zone } from "@/types/database";

function PartnerHomeContent() {
  const { notifyResult, showError } = useFeedback();

  const [business, setBusiness] = useState<PartnerBusiness | null>(null);
  const [phones, setPhones] = useState<string[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Register / Re-register form state
  const [regForm, setRegForm] = useState({
    name: "",
    description: "",
    link_website: "",
    zone_id: "",
    opening_hour: "09:00",
    closing_hour: "23:00",
    expected_delivery_time: "30",
    phone: "",
    business_type: "Restaurant" as BusinessType,
    cuisine_type: "",
    food_category: "",
    pharmacy_type: "",
  });

  // Update Business Info state
  const [updOpening, setUpdOpening] = useState("09:00");
  const [updClosing, setUpdClosing] = useState("23:00");
  const [updWebsite, setUpdWebsite] = useState("");
  const [updPhone, setUpdPhone] = useState("");

  const loadData = useCallback(async () => {
    const res = await api.get<{
      business: PartnerBusiness | null;
      phones: string[];
      zones: Zone[];
    }>("/api/partner/business");
    if (res.ok && res.data) {
      setBusiness(res.data.business);
      setPhones(res.data.phones);
      setZones(res.data.zones);
      if (res.data.business) {
        setUpdOpening(res.data.business.opening_hour.slice(0, 5));
        setUpdClosing(res.data.business.closing_hour.slice(0, 5));
        setUpdWebsite(res.data.business.link_website || "");
        setRegForm((prev) => ({
          ...prev,
          name: res.data!.business!.business_name,
          description: res.data!.business!.description || "",
          link_website: res.data!.business!.link_website || "",
          zone_id: String(res.data!.business!.zone_id),
          opening_hour: res.data!.business!.opening_hour.slice(0, 5),
          closing_hour: res.data!.business!.closing_hour.slice(0, 5),
          expected_delivery_time: String(res.data!.business!.expected_delivery_time),
          business_type: res.data!.business!.business_type,
          cuisine_type: res.data!.business!.cuisine_type || "",
          food_category: res.data!.business!.food_category || "",
          pharmacy_type: res.data!.business!.pharmacy_type || "",
        }));
      } else if (res.data.zones.length > 0) {
        setRegForm((prev) => ({ ...prev, zone_id: prev.zone_id || String(res.data!.zones[0].zone_id) }));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleRegisterBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.zone_id || Number(regForm.expected_delivery_time) <= 0) {
      showError("Provide a business name, zone, and expected delivery time greater than 0.");
      return;
    }
    if (regForm.phone.trim() && !/^\d{11}$/.test(regForm.phone.trim())) {
      showError("Business phone number must be exactly 11 digits.");
      return;
    }
    if (regForm.business_type === "Restaurant" && (!regForm.cuisine_type.trim() || !regForm.food_category.trim())) {
      showError("Restaurants must specify both cuisine type and food category.");
      return;
    }
    if (regForm.business_type === "Pharmacy" && !regForm.pharmacy_type.trim()) {
      showError("Pharmacies must specify a pharmacy type.");
      return;
    }

    setBusy(true);
    const res = await api.post("/api/partner/business", {
      ...regForm,
      zone_id: Number(regForm.zone_id),
      expected_delivery_time: Number(regForm.expected_delivery_time),
      phone: regForm.phone.trim() || null,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) loadData();
  }

  async function handleUpdateInfo(e: React.FormEvent) {
    e.preventDefault();
    if (updPhone.trim() && !/^\d{11}$/.test(updPhone.trim())) {
      showError("New phone number must be exactly 11 digits.");
      return;
    }
    setBusy(true);
    const res = await api.post("/api/partner/business", {
      action: "update",
      opening_hour: updOpening,
      closing_hour: updClosing,
      link_website: updWebsite.trim(),
      phone: updPhone.trim() || null,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      setUpdPhone("");
      loadData();
    }
  }

  if (loading) return <LoadingState label="Loading your business profile..." />;

  const canRegister = !business || business.status === "Rejected";

  return (
    <div className="space-y-6">
      <PageHeader
        title={business ? business.business_name : "Partner Portal"}
        description="View your business approval status, manage operating hours, and update contact details."
        actions={
          business && (
            <div className="flex items-center gap-2">
              <StatusBadge status={business.status} />
              <Link href="/partner/products">
                <Button size="sm" variant="outline">
                  Manage Products
                </Button>
              </Link>
              <Link href="/partner/performance">
                <Button size="sm">Sales & Feedback</Button>
              </Link>
            </div>
          )
        }
      />

      {/* Status Banners */}
      {business?.status === "Pending" && (
        <AlertBanner
          variant="warning"
          title="Application Pending Admin Review"
          message="Your business has been submitted and is waiting for a Zone Admin or Super Admin to approve it."
        />
      )}
      {business?.status === "Suspended" && (
        <AlertBanner
          variant="error"
          title="Your Business is Currently Suspended"
          message={`Reason: ${business.suspension_reason || "Contact platform support."}. While suspended, products cannot be activated and new orders cannot be placed.`}
        />
      )}
      {business?.status === "Rejected" && (
        <AlertBanner
          variant="error"
          title="Previous Application Was Rejected"
          message="Update your business details below and re-submit your registration for admin approval."
        />
      )}

      {/* Existing Business Overview & Update Info */}
      {business && (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-6 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Store className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Business Profile</h2>
              </div>
              <StatusBadge status={business.status} />
            </div>

            <p className="text-sm text-slate-600">{business.description || "No description provided."}</p>

            <dl className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm">
              <div>
                <dt className="text-xs font-medium text-slate-500">Type</dt>
                <dd className="font-semibold text-slate-900">{business.business_type}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Zone</dt>
                <dd className="font-semibold text-slate-900">{business.zone_name}</dd>
              </div>
              {business.business_type === "Restaurant" ? (
                <>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Cuisine</dt>
                    <dd className="font-semibold text-slate-900">{business.cuisine_type}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Food Category</dt>
                    <dd className="font-semibold text-slate-900">{business.food_category}</dd>
                  </div>
                </>
              ) : (
                <div>
                  <dt className="text-xs font-medium text-slate-500">Pharmacy Type</dt>
                  <dd className="font-semibold text-slate-900">{business.pharmacy_type}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-slate-500">Hours</dt>
                <dd className="font-semibold text-slate-900 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {business.opening_hour} – {business.closing_hour}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Est. Delivery Time</dt>
                <dd className="font-semibold text-slate-900">{business.expected_delivery_time} min</dd>
              </div>
            </dl>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Registered Phone Numbers
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {phones.length === 0 ? (
                  <span className="text-xs text-slate-400">No phone numbers added yet.</span>
                ) : (
                  phones.map((ph) => (
                    <span
                      key={ph}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      <Phone className="h-3.5 w-3.5 text-emerald-600" />
                      {ph}
                    </span>
                  ))
                )}
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-6">
            <CardHeader
              title="Update Operating Info & Add Phone"
              subtitle="Adjust your hours, website URL, or add another contact phone."
            />
            <form onSubmit={handleUpdateInfo} className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Opening Hour
                  </label>
                  <input
                    type="time"
                    value={updOpening}
                    onChange={(e) => setUpdOpening(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Closing Hour
                  </label>
                  <input
                    type="time"
                    value={updClosing}
                    onChange={(e) => setUpdClosing(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Website Link
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="www.yourbusiness.example"
                    value={updWebsite}
                    onChange={(e) => setUpdWebsite(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Add New Phone Number (optional, 11 digits)
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  placeholder="02200000099"
                  value={updPhone}
                  onChange={(e) => setUpdPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <Button type="submit" loading={busy} className="w-full">
                Save Business Updates
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Register / Re-register Business Form */}
      {canRegister && (
        <Card>
          <CardHeader
            title={
              business?.status === "Rejected"
                ? "Re-Register Your Business"
                : "Register Your Business"
            }
            subtitle="Submit your business details to start selling on Tayebat."
          />
          <form onSubmit={handleRegisterBusiness} className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Zone *</label>
                <select
                  value={regForm.zone_id}
                  onChange={(e) => setRegForm({ ...regForm, zone_id: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {zones.map((z) => (
                    <option key={z.zone_id} value={z.zone_id}>
                      {z.zone_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Description</label>
              <input
                type="text"
                maxLength={255}
                value={regForm.description}
                onChange={(e) => setRegForm({ ...regForm, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Opening Hour *
                </label>
                <input
                  type="time"
                  required
                  value={regForm.opening_hour}
                  onChange={(e) => setRegForm({ ...regForm, opening_hour: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Closing Hour *
                </label>
                <input
                  type="time"
                  required
                  value={regForm.closing_hour}
                  onChange={(e) => setRegForm({ ...regForm, closing_hour: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Expected Delivery (min) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={regForm.expected_delivery_time}
                  onChange={(e) =>
                    setRegForm({ ...regForm, expected_delivery_time: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Phone (11 digits)
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  placeholder="02200000055"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Business Type *
                </label>
                <select
                  value={regForm.business_type}
                  onChange={(e) =>
                    setRegForm({ ...regForm, business_type: e.target.value as BusinessType })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="Restaurant">Restaurant</option>
                  <option value="Pharmacy">Pharmacy</option>
                </select>
              </div>
              {regForm.business_type === "Restaurant" ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Cuisine Type *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Egyptian, Italian"
                      value={regForm.cuisine_type}
                      onChange={(e) => setRegForm({ ...regForm, cuisine_type: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Food Category *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fast Food, Desserts"
                      value={regForm.food_category}
                      onChange={(e) => setRegForm({ ...regForm, food_category: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Pharmacy Type *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Retail"
                    value={regForm.pharmacy_type}
                    onChange={(e) => setRegForm({ ...regForm, pharmacy_type: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>

            <Button type="submit" loading={busy}>
              <Plus className="h-4 w-4" /> Submit Business Registration
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}

export default function PartnerHomePage() {
  return <RoleGuard allowedRole="Partner">{() => <PartnerHomeContent />}</RoleGuard>;
}
