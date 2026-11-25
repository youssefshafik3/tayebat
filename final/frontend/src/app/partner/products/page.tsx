"use client";

/**
 * Partner Products & Promotions Manager (Requirement 3.4c)
 * ---------------------------------------------------------------------------
 * - View all products (`h_MyProducts`), available or unavailable.
 * - Add or edit a product (`Upsert_Product`).
 * - Deactivate or reactivate a product (`Toggle_Product_Status`).
 * - Set or remove a product's discount (`Set_Product_Promotion` — max 50% of price).
 */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Edit2, Package, Percent, Plus, Power } from "lucide-react";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { api } from "@/lib/apiClient";
import { AlertBanner, useFeedback } from "@/components/ui/FeedbackBanner";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import type { PartnerBusiness, PartnerProduct } from "@/types/database";

function PartnerProductsContent() {
  const { notifyResult, showError } = useFeedback();

  const [business, setBusiness] = useState<PartnerBusiness | null>(null);
  const [products, setProducts] = useState<PartnerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Add / Edit Product modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PartnerProduct | null>(null);
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pCat, setPCat] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pAvailable, setPAvailable] = useState(true);

  // Promotion Modal
  const [promoTarget, setPromoTarget] = useState<PartnerProduct | null>(null);
  const [promoDiscount, setPromoDiscount] = useState("");

  const loadData = useCallback(async () => {
    const res = await api.get<{ business: PartnerBusiness | null; products: PartnerProduct[] }>(
      "/api/partner/products"
    );
    if (res.ok && res.data) {
      setBusiness(res.data.business);
      setProducts(res.data.products);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openAddModal() {
    setEditingProduct(null);
    setPName("");
    setPDesc("");
    setPCat("");
    setPPrice("");
    setPAvailable(true);
    setProductModalOpen(true);
  }

  function openEditModal(p: PartnerProduct) {
    setEditingProduct(p);
    setPName(p.product_name);
    setPDesc(p.description || "");
    setPCat(p.category);
    setPPrice(String(p.price));
    setPAvailable(p.is_available);
    setProductModalOpen(true);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    const numPrice = Number(pPrice);
    if (!pName.trim() || !pCat.trim() || Number.isNaN(numPrice) || numPrice <= 0) {
      showError("Product name, category, and price greater than 0 are required.");
      return;
    }
    setBusy(true);
    const res = await api.post("/api/partner/products", {
      product_id: editingProduct?.product_id ?? null,
      name: pName.trim(),
      description: pDesc.trim() || null,
      category: pCat.trim(),
      price: numPrice,
      is_available: pAvailable,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      setProductModalOpen(false);
      loadData();
    }
  }

  async function handleToggle(p: PartnerProduct) {
    setBusy(true);
    const res = await api.post("/api/partner/products", {
      action: "toggle",
      product_id: p.product_id,
      is_available: !p.is_available,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) loadData();
  }

  async function handleSavePromotion(discountValue: number) {
    if (!promoTarget) return;
    if (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 0.5 * promoTarget.price) {
      showError(
        `Discount must be between 0 and ${(0.5 * promoTarget.price).toFixed(2)} EGP (50% of price).`
      );
      return;
    }
    setBusy(true);
    const res = await api.post("/api/partner/products", {
      action: "promotion",
      product_id: promoTarget.product_id,
      discount_amount: discountValue,
    });
    setBusy(false);
    notifyResult(res);
    if (res.ok) {
      setPromoTarget(null);
      loadData();
    }
  }

  if (loading) return <LoadingState label="Loading your product catalog..." />;

  if (!business) {
    return (
      <EmptyState
        icon={<Package className="h-10 w-10" />}
        title="Register a business first"
        description="You need a registered business before adding products."
        action={
          <Link href="/partner">
            <Button>Go to My Business</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Promotions"
        description={`Manage items for ${business.business_name} (${business.status}).`}
        actions={
          <Button onClick={openAddModal} disabled={business.status === "Suspended"}>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        }
      />

      {business.status === "Suspended" && (
        <AlertBanner
          variant="warning"
          title="Business Suspended"
          message="You cannot add, edit, or activate products while your business is suspended."
        />
      )}

      <Card>
        <CardHeader
          title={`Product Catalog (${products.length})`}
          subtitle="Toggle availability or set discounts up to 50% of the product price."
        />
        <div className="p-5">
          {products.length === 0 ? (
            <EmptyState
              title="No products added yet"
              description="Add your first product so customers can discover and order from your business."
              action={<Button onClick={openAddModal}>Add First Product</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Base Price</th>
                    <th className="pb-3 pr-4">Discount</th>
                    <th className="pb-3 pr-4">Final Price</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.product_id}>
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-slate-900">{p.product_name}</div>
                        {p.description && (
                          <div className="text-xs text-slate-500">{p.description}</div>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{p.category}</td>
                      <td className="py-3 pr-4">{p.price.toFixed(2)} EGP</td>
                      <td className="py-3 pr-4">
                        {p.discount_amount > 0 ? (
                          <span className="font-medium text-amber-700">
                            -{p.discount_amount.toFixed(2)} EGP
                          </span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 font-bold text-emerald-700">
                        {p.final_price.toFixed(2)} EGP
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={p.is_available ? "Available" : "Unavailable"} />
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex flex-wrap justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(p)}
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPromoTarget(p);
                              setPromoDiscount(String(p.discount_amount));
                            }}
                          >
                            <Percent className="h-3.5 w-3.5" /> Promo
                          </Button>
                          <Button
                            size="sm"
                            variant={p.is_available ? "ghost" : "primary"}
                            loading={busy}
                            onClick={() => handleToggle(p)}
                          >
                            <Power className="h-3.5 w-3.5" />
                            {p.is_available ? "Deactivate" : "Reactivate"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Add / Edit Product Modal */}
      <Modal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProduct ? `Edit "${editingProduct.product_name}"` : "Add New Product"}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Product Name *</label>
            <input
              type="text"
              required
              maxLength={100}
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Description</label>
            <input
              type="text"
              maxLength={255}
              value={pDesc}
              onChange={(e) => setPDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Category *</label>
              <input
                type="text"
                required
                maxLength={50}
                placeholder="e.g. Main Dishes, Pizza, Vitamins"
                value={pCat}
                onChange={(e) => setPCat(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Price (EGP) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={pPrice}
                onChange={(e) => setPPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={pAvailable}
              onChange={(e) => setPAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
            />
            Product is available for ordering
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setProductModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Save Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Promotion Modal */}
      <Modal
        open={Boolean(promoTarget)}
        onClose={() => setPromoTarget(null)}
        title={`Promotion for "${promoTarget?.product_name}"`}
      >
        {promoTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Base price: <strong>{promoTarget.price.toFixed(2)} EGP</strong>. Maximum allowed discount (50%):{" "}
              <strong>{(promoTarget.price * 0.5).toFixed(2)} EGP</strong>.
            </p>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Discount Amount (EGP)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={promoDiscount}
                onChange={(e) => setPromoDiscount(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-wrap justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                loading={busy}
                onClick={() => handleSavePromotion(0)}
              >
                Remove Discount (0 EGP)
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setPromoTarget(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  loading={busy}
                  onClick={() => handleSavePromotion(Number(promoDiscount))}
                >
                  Apply Discount
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function PartnerProductsPage() {
  return <RoleGuard allowedRole="Partner">{() => <PartnerProductsContent />}</RoleGuard>;
}
