"use client";

/**
 * Customer Home: Profile Summary, Search & Category Browse (3.5a & 3.6a)
 * ---------------------------------------------------------------------------
 * - Displays customer's name, active delivery address, and wallet balance.
 * - Lets customer search businesses by name (`Search_Platform`) or browse
 *   nearby businesses by product category (`Nearby_Businesses_By_Category`).
 * - Shows business rating, zone delivery info, and lets customer toggle favorites.
 */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Heart,
  MapPin,
  Search,
  ShoppingCart,
  Star,
  Store,
  Wallet,
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
import type { BrowseBusinessItem, CustomerProfile } from "@/types/database";

function CustomerHomeContent() {
  const { notifyResult } = useFeedback();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [businesses, setBusinesses] = useState<BrowseBusinessItem[]>([]);
  const [favBizIds, setFavBizIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const loadBrowse = useCallback(async (q: string, cat: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("category", cat);
    const res = await api.get<{
      profile: CustomerProfile | null;
      categories: string[];
      businesses: BrowseBusinessItem[];
      favoriteBusinessIds: number[];
    }>(`/api/customer/browse?${params.toString()}`);

    if (res.ok && res.data) {
      setProfile(res.data.profile);
      setCategories(res.data.categories);
      setBusinesses(res.data.businesses);
      setFavBizIds(res.data.favoriteBusinessIds);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBrowse("", "");
  }, [loadBrowse]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSelectedCategory("");
    loadBrowse(searchTerm.trim(), "");
  }

  function handleCategoryClick(cat: string) {
    const next = selectedCategory === cat ? "" : cat;
    setSelectedCategory(next);
    setSearchTerm("");
    loadBrowse("", next);
  }

  async function toggleFavBusiness(businessId: number) {
    const res = await api.post("/api/customer/favorites", {
      item_id: businessId,
      item_type: "Business",
    });
    notifyResult(res);
    if (res.ok) {
      loadBrowse(searchTerm.trim(), selectedCategory);
    }
  }

  if (loading) return <LoadingState label="Loading businesses near you..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${profile?.customer_name ?? "Customer"}`}
        description="Explore local restaurants and pharmacies delivering to your neighborhood."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/customer/cart">
              <Button size="sm">
                <ShoppingCart className="h-4 w-4" /> View Cart
              </Button>
            </Link>
            <Link href="/customer/account">
              <Button size="sm" variant="outline">
                Change Address
              </Button>
            </Link>
          </div>
        }
      />

      {profile?.account_status === "Blacklisted" && (
        <AlertBanner
          variant="error"
          title="Account Blacklisted"
          message="Your account is currently blacklisted, so creating new carts or checking out is disabled. Contact platform support."
        />
      )}

      {/* Customer Status Strip: Active Address + Wallet Balance (Req 3.5a) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Active Delivery Address</p>
              <p className="text-sm font-bold text-slate-900">
                {profile?.active_address
                  ? `${profile.active_address} (${profile.active_zone})`
                  : "No active address selected"}
              </p>
            </div>
          </div>
          <Link href="/customer/account" className="text-xs font-semibold text-emerald-700 hover:underline">
            Manage
          </Link>
        </Card>

        <Card className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Wallet Balance</p>
              <p className="text-sm font-bold text-slate-900">
                {(profile?.wallet_balance ?? 0).toFixed(2)} EGP
              </p>
            </div>
          </div>
          <StatusBadge status={profile?.account_status ?? "Active"} />
        </Card>
      </div>

      {/* Search & Category Filters (Req 3.6a) */}
      <Card className="p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search active businesses in ${profile?.active_zone || "your zone"} (e.g. Koshary, Pizza)...`}
              className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <Button type="submit">Search</Button>
          {(searchTerm || selectedCategory) && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                loadBrowse("", "");
              }}
            >
              Reset
            </Button>
          )}
        </form>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Browse by Product Category
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Businesses Grid */}
      {businesses.length === 0 ? (
        <EmptyState
          icon={<Store className="h-10 w-10" />}
          title="No matching active businesses found"
          description={
            searchTerm
              ? `Note: Name search only returns active businesses inside your active zone (${profile?.active_zone || "none"}). Try another keyword or browse by category.`
              : "Try another category or switch your active delivery address."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b) => {
            const isFav = favBizIds.includes(b.business_id);
            return (
              <Card key={b.business_id} className="flex flex-col justify-between p-5">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{b.business_name}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {b.business_type ? `${b.business_type} · ` : ""}
                        {b.zone_name || profile?.active_zone}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavBusiness(b.business_id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                      aria-label="Toggle favorite business"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isFav ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {b.same_zone ? (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 font-medium text-emerald-700">
                        Delivers to your zone
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 font-medium text-amber-800">
                        Other zone ({b.zone_name})
                      </span>
                    )}

                    {b.avg_rating !== null && b.avg_rating !== undefined ? (
                      <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {b.avg_rating.toFixed(1)} ({b.ratings_count})
                      </span>
                    ) : (
                      <span className="text-slate-400">New</span>
                    )}

                    {b.zone_avg_delivery_time && (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Clock className="h-3.5 w-3.5" />~{b.zone_avg_delivery_time} min zone avg
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link href={`/customer/business/${b.business_id}`}>
                    <Button className="w-full" size="sm">
                      Open Business & Menu
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CustomerHomePage() {
  return <RoleGuard allowedRole="Customer">{() => <CustomerHomeContent />}</RoleGuard>;
}
