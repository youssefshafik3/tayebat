"use client";

/**
 * Customer Favorites & Recommendations Page (Requirement 3.6b)
 * ---------------------------------------------------------------------------
 * - View favorite products (`My_Favorites`) & favorite businesses, with remove
 *   toggle (`Toggle_Favorite`).
 * - View recommended products (`Recommended_Products`) based on past order
 *   categories in the customer's active zone.
 */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Sparkles, Store } from "lucide-react";
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
import type {
  BrowseBusinessItem,
  FavoriteProductRow,
  RecommendedProductRow,
} from "@/types/database";

function FavoritesContent() {
  const { notifyResult } = useFeedback();

  const [favorites, setFavorites] = useState<FavoriteProductRow[]>([]);
  const [favoriteBusinesses, setFavoriteBusinesses] = useState<BrowseBusinessItem[]>([]);
  const [recommended, setRecommended] = useState<RecommendedProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const res = await api.get<{
      favorites: FavoriteProductRow[];
      favoriteBusinesses: BrowseBusinessItem[];
      recommended: RecommendedProductRow[];
    }>("/api/customer/favorites");
    if (res.ok && res.data) {
      setFavorites(res.data.favorites);
      setFavoriteBusinesses(res.data.favoriteBusinesses);
      setRecommended(res.data.recommended);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleRemoveFavorite(itemId: number, itemType: "Business" | "Product") {
    const res = await api.post("/api/customer/favorites", {
      item_id: itemId,
      item_type: itemType,
    });
    notifyResult(res);
    if (res.ok) loadData();
  }

  if (loading) return <LoadingState label="Loading your favorites and recommendations..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Favorites & Recommendations"
        description="Your saved products and businesses, plus personalized recommendations in your active zone."
      />

      {/* Recommended Products */}
      <Card>
        <CardHeader
          title="Recommended For You"
          subtitle="Products in your active zone matching categories you enjoy that you haven't tried yet."
          action={<Sparkles className="h-5 w-5 text-amber-500" />}
        />
        <div className="p-5">
          {recommended.length === 0 ? (
            <EmptyState
              title="No recommendations yet"
              description="Place an order so Tayebat can recommend new products in your favorite categories."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((p) => (
                <div
                  key={p.product_id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                      {p.category}
                    </span>
                    <h3 className="mt-2 font-bold text-slate-900">{p.product_name}</h3>
                    <p className="text-xs text-slate-500">{p.business_name}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="font-bold text-emerald-700 text-sm">
                      {p.final_price.toFixed(2)} EGP
                    </span>
                    {p.business_id && (
                      <Link href={`/customer/business/${p.business_id}`}>
                        <Button size="sm">Order</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Favorite Products */}
        <Card>
          <CardHeader title={`Favorite Products (${favorites.length})`} />
          <div className="p-5">
            {favorites.length === 0 ? (
              <EmptyState
                icon={<Heart className="h-8 w-8" />}
                title="No favorite products yet"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {favorites.map((fp) => (
                  <div
                    key={fp.product_id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{fp.product_name}</p>
                      <p className="text-xs text-slate-500">{fp.business_name}</p>
                      <div className="mt-1">
                        <StatusBadge status={fp.is_orderable ? "Available" : "Unavailable"} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {fp.business_id && (
                        <Link href={`/customer/business/${fp.business_id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFavorite(fp.product_id, "Product")}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Favorite Businesses */}
        <Card>
          <CardHeader title={`Favorite Businesses (${favoriteBusinesses.length})`} />
          <div className="p-5">
            {favoriteBusinesses.length === 0 ? (
              <EmptyState
                icon={<Store className="h-8 w-8" />}
                title="No favorite businesses yet"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {favoriteBusinesses.map((fb) => (
                  <div
                    key={fb.business_id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{fb.business_name}</p>
                      <p className="text-xs text-slate-500">{fb.zone_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/customer/business/${fb.business_id}`}>
                        <Button size="sm" variant="outline">
                          Open Menu
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFavorite(fb.business_id, "Business")}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function CustomerFavoritesPage() {
  return <RoleGuard allowedRole="Customer">{() => <FavoritesContent />}</RoleGuard>;
}
