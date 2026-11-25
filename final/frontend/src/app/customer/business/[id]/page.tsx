"use client";

/**
 * Business Details & Product Ordering Page (Requirements 3.5d, 3.6a, 3.6b)
 * ---------------------------------------------------------------------------
 * - Displays business details (`h_BusinessDetails`), Open Now badge, rating,
 *   and Favorite Business toggle.
 * - Lists available products (`h_BusinessProducts`) with Favorite Product
 *   toggle, quantity picker (1–10), optional notes, and Add to Cart.
 */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Globe,
  Heart,
  MapPin,
  ShoppingCart,
  Star,
} from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { api } from "@/lib/apiClient";
import { AlertBanner, useFeedback } from "@/components/ui/FeedbackBanner";
import {
  Button,
  Card,
  EmptyState,
  LoadingState,
  PageHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import type {
  BusinessDetails,
  CustomerProfile,
  PublicProduct,
} from "@/types/database";

function BusinessDetailContent() {
  const params = useParams<{ id: string }>();
  const businessId = params.id;
  const { notifyResult, showError } = useFeedback();

  const [details, setDetails] = useState<BusinessDetails | null>(null);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [isFavBusiness, setIsFavBusiness] = useState(false);
  const [favProductIds, setFavProductIds] = useState<number[]>([]);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});

  const loadData = useCallback(async () => {
    const res = await api.get<{
      details: BusinessDetails;
      products: PublicProduct[];
      isFavoriteBusiness: boolean;
      favoriteProductIds: number[];
      profile: CustomerProfile | null;
    }>(`/api/customer/businesses/${businessId}`);

    if (res.ok && res.data) {
      setDetails(res.data.details);
      setProducts(res.data.products);
      setIsFavBusiness(res.data.isFavoriteBusiness);
      setFavProductIds(res.data.favoriteProductIds);
      setProfile(res.data.profile);
    }
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function toggleFavorite(itemId: number, itemType: "Business" | "Product") {
    const res = await api.post("/api/customer/favorites", {
      item_id: itemId,
      item_type: itemType,
    });
    notifyResult(res);
    if (res.ok) loadData();
  }

  async function handleAddToCart(productId: number) {
    const qty = quantities[productId] ?? 1;
    if (qty < 1 || qty > 10) {
      showError("You can order between 1 and 10 of one product at a time.");
      return;
    }
    setBusy(true);
    const res = await api.post("/api/customer/cart", {
      action: "add",
      product_id: productId,
      quantity: qty,
      notes: notes[productId]?.trim() || null,
    });
    setBusy(false);
    notifyResult(res);
  }

  if (loading) return <LoadingState label="Loading business menu..." />;

  if (!details) {
    return (
      <EmptyState
        title="Business not found"
        action={
          <Link href="/customer">
            <Button>Back to Browse</Button>
          </Link>
        }
      />
    );
  }

  const zoneMismatch =
    profile?.active_zone && details.zone_name && profile.active_zone !== details.zone_name;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Link href="/customer">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back to Browse
          </Button>
        </Link>
        <Link href="/customer/cart">
          <Button size="sm">
            <ShoppingCart className="h-4 w-4" /> Go to Cart & Checkout
          </Button>
        </Link>
      </div>

      <PageHeader
        title={details.business_name}
        description={details.description || "Local business on Tayebat"}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={details.is_open_now ? "Open" : "Closed"} />
            <StatusBadge status={details.status} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleFavorite(details.business_id, "Business")}
            >
              <Heart
                className={`h-4 w-4 ${isFavBusiness ? "fill-rose-500 text-rose-500" : ""}`}
              />
              {isFavBusiness ? "Favorited" : "Add Favorite"}
            </Button>
          </div>
        }
      />

      {zoneMismatch && (
        <AlertBanner
          variant="warning"
          title="Zone Mismatch Notice"
          message={`This business is in ${details.zone_name}, while your active address is in ${profile?.active_zone}. Change your active address on your Account page before adding items here.`}
        />
      )}

      {!details.is_open_now && (
        <AlertBanner
          variant="warning"
          title="Currently Closed"
          message={`Operating hours are ${details.opening_hour} – ${details.closing_hour}. Checkout will not succeed while a business is closed.`}
        />
      )}

      <Card className="p-5">
        <div className="flex flex-wrap gap-6 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span>
              Zone: <strong>{details.zone_name}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span>
              Hours: <strong>{details.opening_hour} – {details.closing_hour}</strong> · Est.{" "}
              {details.expected_delivery_time} min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>
              {details.avg_rating !== null
                ? `${details.avg_rating.toFixed(2)} / 5 (${details.number_of_ratings} reviews)`
                : "No reviews yet"}
            </span>
          </div>
          {details.link_website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" />
              <span>{details.link_website}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Available Products */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-slate-900">
          Available Products ({products.length})
        </h2>
        {products.length === 0 ? (
          <EmptyState
            title="No available products"
            description="This business currently has no available items or is not Active."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((p) => {
              const isFav = favProductIds.includes(p.product_id);
              return (
                <Card key={p.product_id} className="p-5 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {p.category}
                        </span>
                        <h3 className="mt-1.5 text-base font-bold text-slate-900">
                          {p.product_name}
                        </h3>
                        {p.description && (
                          <p className="mt-0.5 text-xs text-slate-500">{p.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(p.product_id, "Product")}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        aria-label="Toggle favorite product"
                      >
                        <Heart className={`h-5 w-5 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-emerald-700">
                        {p.final_price.toFixed(2)} EGP
                      </span>
                      {p.discount_amount > 0 && (
                        <>
                          <span className="text-xs text-slate-400 line-through">
                            {p.price.toFixed(2)} EGP
                          </span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            Save {p.discount_amount.toFixed(2)} EGP
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={quantities[p.product_id] ?? 1}
                      onChange={(e) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [p.product_id]: Number(e.target.value),
                        }))
                      }
                      className="w-16 rounded-xl border border-slate-300 px-2.5 py-1.5 text-sm text-center"
                      aria-label="Quantity"
                    />
                    <input
                      type="text"
                      maxLength={255}
                      placeholder="Optional note (e.g. extra sauce)"
                      value={notes[p.product_id] ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [p.product_id]: e.target.value }))
                      }
                      className="flex-1 min-w-[140px] rounded-xl border border-slate-300 px-3 py-1.5 text-sm"
                    />
                    <Button
                      size="sm"
                      loading={busy}
                      onClick={() => handleAddToCart(p.product_id)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerBusinessDetailPage() {
  return <RoleGuard allowedRole="Customer">{() => <BusinessDetailContent />}</RoleGuard>;
}
