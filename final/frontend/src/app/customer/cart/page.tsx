"use client";

/**
 * Customer Cart & Checkout Page (Requirements 3.5d & 3.5e)
 * ---------------------------------------------------------------------------
 * - Create an active cart for the customer's active address (`Create_Cart`).
 * - View items (`h_CartItems`) and remove items (`Remove_From_Cart`).
 * - Shows "What exactly will I pay, and why?" with per-business subtotals,
 *   delivery fees per business, and live `Calculate_Voucher_Discount`.
 * - Checkout (`Checkout_Cart`) using Cash, saved Card (last 4 digits only),
 *   or Wallet balance.
 */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Plus,
  ShoppingCart,
  Ticket,
  Trash2,
  Wallet,
} from "lucide-react";
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
} from "@/components/ui/Primitives";
import type {
  CartItemRow,
  CustomerCard,
  CustomerProfile,
  CustomerVoucher,
  PaymentMethod,
} from "@/types/database";

interface CartBreakdown {
  businesses: { business_id: number; business_name: string; subtotal: number; delivery_fee: number }[];
  subtotal: number;
  zoneFeePerBusiness: number;
  deliveryFeesTotal: number;
  voucherDiscount: number;
  finalTotal: number;
}

function CartContent() {
  const router = useRouter();
  const { notifyResult, showError } = useFeedback();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [cartId, setCartId] = useState<number | null>(null);
  const [items, setItems] = useState<CartItemRow[]>([]);
  const [cards, setCards] = useState<CustomerCard[]>([]);
  const [vouchers, setVouchers] = useState<CustomerVoucher[]>([]);
  const [breakdown, setBreakdown] = useState<CartBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [selectedVoucherId, setSelectedVoucherId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [selectedCardId, setSelectedCardId] = useState<string>("");

  const loadCart = useCallback(async (voucherIdStr: string) => {
    const q = voucherIdStr ? `?voucher_id=${voucherIdStr}` : "";
    const res = await api.get<{
      profile: CustomerProfile | null;
      cartId: number | null;
      items: CartItemRow[];
      cards: CustomerCard[];
      vouchers: CustomerVoucher[];
      breakdown: CartBreakdown;
    }>(`/api/customer/cart${q}`);

    if (res.ok && res.data) {
      setProfile(res.data.profile);
      setCartId(res.data.cartId);
      setItems(res.data.items);
      setCards(res.data.cards);
      setVouchers(res.data.vouchers);
      setBreakdown(res.data.breakdown);
      if (res.data.cards.length > 0 && !selectedCardId) {
        setSelectedCardId(String(res.data.cards[0].card_id));
      }
    }
    setLoading(false);
  }, [selectedCardId]);

  useEffect(() => {
    loadCart(selectedVoucherId);
  }, [loadCart, selectedVoucherId]);

  async function handleCreateCart() {
    setBusy(true);
    const res = await api.post("/api/customer/cart", { action: "create" });
    setBusy(false);
    notifyResult(res);
    if (res.ok) loadCart(selectedVoucherId);
  }

  async function handleRemoveItem(productId: number) {
    setBusy(true);
    const res = await api.post("/api/customer/cart", {
      action: "remove",
      product_id: productId,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) loadCart(selectedVoucherId);
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (paymentMethod === "Card" && !selectedCardId) {
      showError("Please select a saved card or add a card on your Account page first.");
      return;
    }
    setBusy(true);
    const res = await api.post("/api/customer/cart", {
      action: "checkout",
      voucher_id: selectedVoucherId ? Number(selectedVoucherId) : null,
      payment_method: paymentMethod,
      card_id: paymentMethod === "Card" ? Number(selectedCardId) : null,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      router.push("/customer/orders");
    }
  }

  if (loading) return <LoadingState label="Loading your cart..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Cart & Checkout"
        description={
          profile?.active_address
            ? `Active Address: ${profile.active_address} (${profile.active_zone})`
            : "Set an active address before creating a cart."
        }
        actions={
          <Link href="/customer">
            <Button variant="outline" size="sm">
              Browse Businesses
            </Button>
          </Link>
        }
      />

      {!cartId ? (
        <EmptyState
          icon={<ShoppingCart className="h-10 w-10" />}
          title="No active cart for this address"
          description="Create an active cart for your current delivery address, or add a product from any business page."
          action={
            <Button onClick={handleCreateCart} loading={busy}>
              <Plus className="h-4 w-4" /> Create Cart for Active Address
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Cart Items */}
          <Card className="lg:col-span-7">
            <CardHeader
              title={`Cart Items (${items.length})`}
              subtitle="Items currently in your active cart."
            />
            <div className="p-5">
              {items.length === 0 ? (
                <EmptyState
                  title="Your cart is empty"
                  description="Browse restaurants and pharmacies in your zone to add products."
                  action={
                    <Link href="/customer">
                      <Button size="sm">Browse Businesses</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-start justify-between gap-4 py-3.5"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{item.product_name}</p>
                        <p className="text-xs text-slate-500">
                          From: <strong>{item.business_name}</strong> · Qty: {item.quantity} ×{" "}
                          {item.unit_price.toFixed(2)} EGP
                        </p>
                        {item.notes && (
                          <p className="mt-0.5 text-xs italic text-slate-500">Note: {item.notes}</p>
                        )}
                        {!item.is_available && (
                          <p className="mt-1 text-xs font-semibold text-rose-600">
                            Currently unavailable — remove before checkout
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 text-sm">
                          {item.line_total.toFixed(2)} EGP
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={busy}
                          onClick={() => handleRemoveItem(item.product_id)}
                          aria-label={`Remove ${item.product_name}`}
                        >
                          <Trash2 className="h-4 w-4 text-rose-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Transparent Total Breakdown & Checkout Form (Req 3.5e) */}
          <Card className="lg:col-span-5">
            <CardHeader
              title="Order Summary & Checkout"
              subtitle="See exactly what you will pay and why before confirming."
            />
            <form onSubmit={handleCheckout} className="space-y-5 p-5">
              {/* Breakdown per business */}
              {breakdown && breakdown.businesses.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Price Breakdown
                  </p>
                  {breakdown.businesses.map((bg) => (
                    <div key={bg.business_id} className="space-y-1 border-b border-slate-200/70 pb-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-800">{bg.business_name} items</span>
                        <span>{bg.subtotal.toFixed(2)} EGP</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Delivery fee ({profile?.active_zone})</span>
                        <span>{bg.delivery_fee.toFixed(2)} EGP</span>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between text-slate-700 pt-1">
                    <span>Items Subtotal</span>
                    <span>{breakdown.subtotal.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>
                      Delivery Fees ({breakdown.businesses.length} business
                      {breakdown.businesses.length > 1 ? "es" : ""} ×{" "}
                      {breakdown.zoneFeePerBusiness.toFixed(2)} EGP)
                    </span>
                    <span>{breakdown.deliveryFeesTotal.toFixed(2)} EGP</span>
                  </div>
                  {breakdown.voucherDiscount > 0 && (
                    <div className="flex justify-between font-medium text-emerald-700">
                      <span>Voucher Discount</span>
                      <span>-{breakdown.voucherDiscount.toFixed(2)} EGP</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-300 pt-2 text-base font-bold text-slate-900">
                    <span>Total to Pay</span>
                    <span>{breakdown.finalTotal.toFixed(2)} EGP</span>
                  </div>
                </div>
              )}

              {/* Optional Voucher */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Ticket className="h-3.5 w-3.5 text-emerald-600" />
                  Apply Voucher (Optional)
                </label>
                <select
                  value={selectedVoucherId}
                  onChange={(e) => setSelectedVoucherId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">No voucher</option>
                  {vouchers.map((v) => (
                    <option key={v.voucher_id} value={v.voucher_id}>
                      {v.promo_code} —{" "}
                      {v.is_percentage ? `${v.amount}% off` : `${v.amount.toFixed(2)} EGP off`}{" "}
                      (exp {v.expiry_date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Payment Method *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Cash", "Card", "Wallet"] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold cursor-pointer ${
                        paymentMethod === method
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                {paymentMethod === "Wallet" && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                    <Wallet className="h-3.5 w-3.5 text-amber-600" />
                    Available wallet balance:{" "}
                    <strong>{(profile?.wallet_balance ?? 0).toFixed(2)} EGP</strong>
                  </p>
                )}

                {paymentMethod === "Card" && (
                  <div className="mt-2.5 space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                      Select Saved Card (last 4 digits)
                    </label>
                    {cards.length === 0 ? (
                      <p className="text-xs text-rose-600">
                        You have no saved cards.{" "}
                        <Link href="/customer/account" className="underline font-semibold">
                          Add a card first
                        </Link>
                        .
                      </p>
                    ) : (
                      <select
                        value={selectedCardId}
                        onChange={(e) => setSelectedCardId(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        {cards.map((c) => (
                          <option key={c.card_id} value={c.card_id}>
                            •••• {c.last_four_digits} ({c.card_holder_name}, exp{" "}
                            {c.expiration_date})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                loading={busy}
                disabled={items.length === 0}
                className="w-full"
              >
                Confirm & Place Order ({(breakdown?.finalTotal ?? 0).toFixed(2)} EGP)
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function CustomerCartPage() {
  return <RoleGuard allowedRole="Customer">{() => <CartContent />}</RoleGuard>;
}
