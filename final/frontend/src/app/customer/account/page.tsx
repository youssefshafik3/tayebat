"use client";

/**
 * Customer Account: Addresses, Saved Cards & Vouchers (Requirements 3.5b & 3.5c)
 * ---------------------------------------------------------------------------
 * - Manage delivery addresses (`h_MyAddresses`): add, edit, delete (with
 *   ConfirmDialog per 3.1f), and switch active address (`Change_Active_Address`).
 * - Save payment cards (`Add_Card`) and list cards (`h_MyCards`) showing ONLY
 *   the last 4 digits of any card number.
 * - View unused, non-expired vouchers (`h_MyVouchers`).
 */

import React, { useCallback, useEffect, useState } from "react";
import { Check, CreditCard, Edit2, MapPin, Plus, Ticket, Trash2 } from "lucide-react";
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
  Modal,
  PageHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import type {
  CustomerAddress,
  CustomerCard,
  CustomerVoucher,
  Zone,
} from "@/types/database";

function CustomerAccountContent() {
  const { notifyResult, showError } = useFeedback();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [cards, setCards] = useState<CustomerCard[]>([]);
  const [vouchers, setVouchers] = useState<CustomerVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Add Address form
  const [newAddrDesc, setNewAddrDesc] = useState("");
  const [newAddrZoneId, setNewAddrZoneId] = useState("");

  // Edit Address Modal
  const [editAddr, setEditAddr] = useState<CustomerAddress | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editZoneId, setEditZoneId] = useState("");

  // Delete Address ConfirmDialog
  const [deleteAddr, setDeleteAddr] = useState<CustomerAddress | null>(null);

  // Add Card form
  const [cardNo, setCardNo] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("2030-12-31");

  const loadData = useCallback(async () => {
    const [addrRes, cardRes, cartRes] = await Promise.all([
      api.get<{ addresses: CustomerAddress[]; zones: Zone[] }>("/api/customer/addresses"),
      api.get<CustomerCard[]>("/api/customer/cards"),
      api.get<{ vouchers: CustomerVoucher[] }>("/api/customer/cart"),
    ]);

    if (addrRes.ok && addrRes.data) {
      setAddresses(addrRes.data.addresses);
      setZones(addrRes.data.zones);
      if (addrRes.data.zones.length > 0 && !newAddrZoneId) {
        setNewAddrZoneId(String(addrRes.data.zones[0].zone_id));
      }
    }
    if (cardRes.ok && cardRes.data) setCards(cardRes.data);
    if (cartRes.ok && cartRes.data) setVouchers(cartRes.data.vouchers);
    setLoading(false);
  }, [newAddrZoneId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!newAddrDesc.trim() || !newAddrZoneId) {
      showError("Enter an address description and choose a delivery zone.");
      return;
    }
    setBusy(true);
    const res = await api.post("/api/customer/addresses", {
      description: newAddrDesc.trim(),
      zone_id: Number(newAddrZoneId),
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      setNewAddrDesc("");
      loadData();
    }
  }

  async function handleSetActive(addressId: number) {
    setBusy(true);
    const res = await api.post("/api/customer/addresses", {
      action: "set_active",
      address_id: addressId,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) loadData();
  }

  async function handleUpdateAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!editAddr || !editDesc.trim()) {
      showError("Enter an address description.");
      return;
    }
    setBusy(true);
    const res = await api.post("/api/customer/addresses", {
      action: "Update",
      address_id: editAddr.address_id,
      description: editDesc.trim(),
      zone_id: Number(editZoneId),
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      setEditAddr(null);
      loadData();
    }
  }

  async function handleDeleteAddress() {
    if (!deleteAddr) return;
    setBusy(true);
    const res = await api.post("/api/customer/addresses", {
      action: "Delete",
      address_id: deleteAddr.address_id,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      setDeleteAddr(null);
      loadData();
    }
  }

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = cardNo.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(cleaned)) {
      showError("Card number must be exactly 16 digits (numbers only).");
      return;
    }
    if (!cardHolder.trim() || !cardExpiry) {
      showError("Cardholder name and expiration date are required.");
      return;
    }
    if (cardExpiry < new Date().toISOString().slice(0, 10)) {
      showError("Expiration date cannot be in the past.");
      return;
    }
    setBusy(true);
    const res = await api.post("/api/customer/cards", {
      card_no: cleaned,
      card_holder_name: cardHolder.trim(),
      expiration_date: cardExpiry,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      setCardNo("");
      setCardHolder("");
      loadData();
    }
  }

  if (loading) return <LoadingState label="Loading your addresses and cards..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Addresses, Cards & Vouchers"
        description="Manage your delivery locations, saved payment cards, and promotional vouchers."
      />

      {/* Addresses Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader
            title={`My Saved Addresses (${addresses.length})`}
            subtitle="Choose your active delivery address or edit/delete unused addresses."
          />
          <div className="p-5">
            {addresses.length === 0 ? (
              <EmptyState title="No addresses saved yet" />
            ) : (
              <div className="divide-y divide-slate-100">
                {addresses.map((a) => (
                  <div
                    key={a.address_id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin
                        className={`mt-0.5 h-5 w-5 ${
                          a.is_active ? "text-emerald-600" : "text-slate-400"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">
                            {a.description}
                          </span>
                          {a.is_active && <StatusBadge status="Active" />}
                        </div>
                        <p className="text-xs text-slate-500">Zone: {a.zone_name}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {!a.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={busy}
                          onClick={() => handleSetActive(a.address_id)}
                        >
                          <Check className="h-3.5 w-3.5" /> Set Active
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditAddr(a);
                          setEditDesc(a.description);
                          setEditZoneId(String(a.zone_id));
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteAddr(a)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader
            title="Add New Address"
            subtitle="New addresses become your active delivery address automatically."
          />
          <form onSubmit={handleAddAddress} className="space-y-4 p-5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Street & Building Details *
              </label>
              <input
                type="text"
                required
                maxLength={150}
                placeholder="e.g. Street 9 Building 14, Apt 3"
                value={newAddrDesc}
                onChange={(e) => setNewAddrDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Delivery Zone *
              </label>
              <select
                value={newAddrZoneId}
                onChange={(e) => setNewAddrZoneId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {zones.map((z) => (
                  <option key={z.zone_id} value={z.zone_id}>
                    {z.zone_name} ({z.delivery_fee} EGP fee)
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" loading={busy} className="w-full">
              <Plus className="h-4 w-4" /> Save Address
            </Button>
          </form>
        </Card>
      </div>

      {/* Cards & Vouchers Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader
            title={`Saved Cards (${cards.length})`}
            subtitle="Only the last 4 digits of any card number are ever shown."
          />
          <div className="p-5 space-y-5">
            {cards.length === 0 ? (
              <EmptyState title="No saved payment cards" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {cards.map((c) => (
                  <div
                    key={c.card_id}
                    className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-white"
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className="h-5 w-5 text-emerald-400" />
                      <span className="text-xs text-slate-300">Exp {c.expiration_date}</span>
                    </div>
                    <p className="mt-4 font-mono text-base tracking-wider">
                      •••• •••• •••• {c.last_four_digits}
                    </p>
                    <p className="mt-2 text-xs text-slate-300">{c.card_holder_name}</p>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={handleAddCard}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Add a New 16-Digit Card
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    16-Digit Card Number *
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={16}
                    placeholder="16 digits"
                    value={cardNo}
                    onChange={(e) => setCardNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Cardholder Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[160px]">
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <Button type="submit" loading={busy}>
                  <Plus className="h-4 w-4" /> Save Card
                </Button>
              </div>
            </form>
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader
            title={`My Available Vouchers (${vouchers.length})`}
            subtitle="Unused vouchers eligible for checkout."
          />
          <div className="p-5">
            {vouchers.length === 0 ? (
              <EmptyState
                icon={<Ticket className="h-8 w-8" />}
                title="No available vouchers"
              />
            ) : (
              <div className="space-y-3">
                {vouchers.map((v) => (
                  <div
                    key={v.voucher_id}
                    className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3"
                  >
                    <div>
                      <p className="font-mono text-sm font-bold text-emerald-800">
                        {v.promo_code}
                      </p>
                      <p className="text-xs text-slate-500">Expires {v.expiry_date}</p>
                    </div>
                    <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                      {v.is_percentage ? `${v.amount}% OFF` : `${v.amount.toFixed(2)} EGP OFF`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Edit Address Modal */}
      <Modal
        open={Boolean(editAddr)}
        onClose={() => setEditAddr(null)}
        title="Edit Address"
      >
        <form onSubmit={handleUpdateAddress} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Address Description *
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Zone *</label>
            <select
              value={editZoneId}
              onChange={(e) => setEditZoneId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {zones.map((z) => (
                <option key={z.zone_id} value={z.zone_id}>
                  {z.zone_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditAddr(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Address ConfirmDialog (Req 3.1f) */}
      <ConfirmDialog
        open={Boolean(deleteAddr)}
        onCancel={() => setDeleteAddr(null)}
        onConfirm={handleDeleteAddress}
        title={`Delete "${deleteAddr?.description}"?`}
        consequence="This saved address will be permanently removed. If it was your active address, another saved address will become active."
        confirmLabel="Delete Address"
        loading={busy}
      />
    </div>
  );
}

export default function CustomerAccountPage() {
  return <RoleGuard allowedRole="Customer">{() => <CustomerAccountContent />}</RoleGuard>;
}
