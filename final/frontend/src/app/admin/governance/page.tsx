"use client";

/**
 * Admin Governance: Businesses & Admins (Requirements 3.2b, 3.2c, 3.2d)
 * ---------------------------------------------------------------------------
 * - PendingBusinessApprovals: Approve or Reject from the same table.
 * - allBusinessProfiles: Browse filtered by Status and Business Type.
 * - Suspend Active business (with reason + ConfirmDialog).
 * - Reinstate Suspended business (Super Admin ONLY — hidden for Zone Admin).
 * - Create Admin & Assign Zone Admin to Zone (Super Admin ONLY — hidden for Zone Admin).
 */

import React, { useCallback, useEffect, useState } from "react";
import { Check, PauseCircle, PlayCircle, Plus, X } from "lucide-react";
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
  AdminListItem,
  AdminProfile,
  AdminRole,
  BusinessProfile,
  PendingBusinessApproval,
  SuspendedBusiness,
  Zone,
} from "@/types/database";

function GovernanceContent() {
  const { notifyResult, showError } = useFeedback();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [pending, setPending] = useState<PendingBusinessApproval[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<BusinessProfile[]>([]);
  const [suspended, setSuspended] = useState<SuspendedBusiness[]>([]);
  const [admins, setAdmins] = useState<AdminListItem[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for allBusinessProfiles
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  // Confirm dialogs
  const [suspendTarget, setSuspendTarget] = useState<BusinessProfile | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<PendingBusinessApproval | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  // Super Admin: Create Admin modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    dob: "",
    role: "Zone Admin" as AdminRole,
    zone_id: "",
  });

  // Super Admin: Assign Zone
  const [assignAdminId, setAssignAdminId] = useState("");
  const [assignZoneId, setAssignZoneId] = useState("");

  const loadData = useCallback(async () => {
    const [profRes, bizRes, admRes, zoneRes] = await Promise.all([
      api.get<AdminProfile>("/api/admin/profile"),
      api.get<{
        pending: PendingBusinessApproval[];
        all: BusinessProfile[];
        suspended: SuspendedBusiness[];
      }>("/api/admin/businesses"),
      api.get<AdminListItem[]>("/api/admin/admins"),
      api.get<Zone[]>("/api/zones"),
    ]);

    if (profRes.ok && profRes.data) setProfile(profRes.data);
    if (bizRes.ok && bizRes.data) {
      setPending(bizRes.data.pending);
      setAllBusinesses(bizRes.data.all);
      setSuspended(bizRes.data.suspended);
    }
    if (admRes.ok && admRes.data) {
      setAdmins(admRes.data);
      const firstZoneAdmin = admRes.data.find((a) => a.role === "Zone Admin");
      if (firstZoneAdmin && !assignAdminId) setAssignAdminId(String(firstZoneAdmin.admin_id));
    }
    if (zoneRes.ok && zoneRes.data) {
      setZones(zoneRes.data);
      if (zoneRes.data.length > 0 && !assignZoneId) {
        setAssignZoneId(String(zoneRes.data[0].zone_id));
        setNewAdmin((p) => ({ ...p, zone_id: String(zoneRes.data![0].zone_id) }));
      }
    }
    setLoading(false);
  }, [assignAdminId, assignZoneId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isSuperAdmin = profile?.role === "Super Admin";

  async function handleBusinessAction(
    action: "approve" | "reject" | "suspend" | "reinstate",
    businessId: number,
    reason?: string
  ) {
    setActionBusy(true);
    const res = await api.post("/api/admin/businesses", {
      action,
      business_id: businessId,
      reason,
    });
    setActionBusy(false);
    notifyResult(res);
    if (res.ok) {
      setSuspendTarget(null);
      setSuspendReason("");
      setRejectTarget(null);
      loadData();
    }
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (newAdmin.phone && !/^\d{11}$/.test(newAdmin.phone)) {
      showError("Phone number must be exactly 11 digits.");
      return;
    }
    setActionBusy(true);
    const res = await api.post("/api/admin/admins", {
      ...newAdmin,
      zone_id: newAdmin.role === "Zone Admin" ? Number(newAdmin.zone_id) : null,
    });
    setActionBusy(false);
    notifyResult(res);
    if (res.ok) {
      setCreateOpen(false);
      setNewAdmin({
        first_name: "",
        middle_name: "",
        last_name: "",
        username: "",
        password: "",
        email: "",
        phone: "",
        dob: "",
        role: "Zone Admin",
        zone_id: zones[0] ? String(zones[0].zone_id) : "",
      });
      loadData();
    }
  }

  async function handleAssignZone(e: React.FormEvent) {
    e.preventDefault();
    if (!assignAdminId || !assignZoneId) {
      showError("Select both a Zone Admin and a Zone.");
      return;
    }
    setActionBusy(true);
    const res = await api.post("/api/admin/admins", {
      action: "assign_zone",
      admin_id: Number(assignAdminId),
      zone_id: Number(assignZoneId),
    });
    setActionBusy(false);
    notifyResult(res);
    if (res.ok) loadData();
  }

  if (loading) return <LoadingState label="Loading governance controls..." />;

  const filteredBusinesses = allBusinesses.filter((b) => {
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    const matchType = typeFilter === "All" || b.business_type === typeFilter;
    return matchStatus && matchType;
  });

  const zoneAdmins = admins.filter((a) => a.role === "Zone Admin");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Businesses & Admin Governance"
        description="Review pending partner applications, manage active/suspended businesses, and administer platform accounts."
      />

      {/* 1. Pending Business Approvals (Req 3.2b) */}
      <Card>
        <CardHeader
          title={`Pending Business Approvals (${pending.length})`}
          subtitle="Approve or reject partner applications awaiting review."
        />
        <div className="p-5">
          {pending.length === 0 ? (
            <EmptyState
              title="No pending business applications"
              description="All submitted businesses have been reviewed."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="pb-3 pr-4">Business</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Zone</th>
                    <th className="pb-3 pr-4">Partner</th>
                    <th className="pb-3 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pending.map((b) => (
                    <tr key={b.business_id}>
                      <td className="py-3 pr-4 font-semibold text-slate-900">{b.business_name}</td>
                      <td className="py-3 pr-4 text-slate-600">{b.business_type}</td>
                      <td className="py-3 pr-4 text-slate-600">{b.zone_name}</td>
                      <td className="py-3 pr-4 text-slate-600">{b.partner_name}</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="sm"
                            loading={actionBusy}
                            onClick={() => handleBusinessAction("approve", b.business_id)}
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={actionBusy}
                            onClick={() => setRejectTarget(b)}
                          >
                            <X className="h-3.5 w-3.5" /> Reject
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

      {/* 2. Browse All Businesses + Suspend / Reinstate (Req 3.2c) */}
      <Card>
        <CardHeader
          title="All Business Profiles"
          subtitle="Filter by status and type. Suspending an active business cancels & refunds unpicked orders."
          action={
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium"
              >
                <option value="All">All Types</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Pharmacy">Pharmacy</option>
              </select>
            </div>
          }
        />
        <div className="overflow-x-auto p-5">
          {filteredBusinesses.length === 0 ? (
            <EmptyState title="No businesses match these filters" />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="pb-3 pr-4">Business</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Zone</th>
                  <th className="pb-3 pr-4">Partner</th>
                  <th className="pb-3 pr-4">Hours</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBusinesses.map((b) => {
                  const suspInfo = suspended.find((s) => s.business_id === b.business_id);
                  return (
                    <tr key={b.business_id}>
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-slate-900">{b.business_name}</div>
                        {suspInfo?.suspension_reason && (
                          <p className="text-xs text-rose-600">Reason: {suspInfo.suspension_reason}</p>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{b.business_type}</td>
                      <td className="py-3 pr-4 text-slate-600">{b.zone_name}</td>
                      <td className="py-3 pr-4 text-slate-600">{b.partner_name}</td>
                      <td className="py-3 pr-4 text-xs text-slate-500">
                        {b.opening_hour} – {b.closing_hour}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3 text-right">
                        {b.status === "Active" && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              setSuspendTarget(b);
                              setSuspendReason("");
                            }}
                          >
                            <PauseCircle className="h-3.5 w-3.5" /> Suspend
                          </Button>
                        )}
                        {b.status === "Suspended" && isSuperAdmin && (
                          <Button
                            size="sm"
                            loading={actionBusy}
                            onClick={() => handleBusinessAction("reinstate", b.business_id)}
                          >
                            <PlayCircle className="h-3.5 w-3.5" /> Reinstate
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* 3. Admin Management (Super Admin ONLY - hidden for Zone Admin per Req 3.2a & 3.2d) */}
      {isSuperAdmin && (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-7">
            <CardHeader
              title="Platform Admins (Super Admin Only)"
              subtitle="All Super Admins and Zone Admins."
              action={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" /> Create Admin
                </Button>
              }
            />
            <div className="overflow-x-auto p-5">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Username</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3">Assigned Zone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map((a) => (
                    <tr key={a.admin_id}>
                      <td className="py-3 pr-4 font-semibold text-slate-900">{a.admin_name}</td>
                      <td className="py-3 pr-4 text-slate-600">{a.username}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={a.role} />
                      </td>
                      <td className="py-3 text-slate-600">{a.zone_name ?? "All Zones"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="lg:col-span-5">
            <CardHeader
              title="Assign / Move Zone Admin"
              subtitle="Reassign an existing Zone Admin to another delivery zone."
            />
            <form onSubmit={handleAssignZone} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Zone Admin
                </label>
                <select
                  value={assignAdminId}
                  onChange={(e) => setAssignAdminId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {zoneAdmins.map((a) => (
                    <option key={a.admin_id} value={a.admin_id}>
                      {a.admin_name} ({a.zone_name ?? "Unassigned"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Target Zone
                </label>
                <select
                  value={assignZoneId}
                  onChange={(e) => setAssignZoneId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {zones.map((z) => (
                    <option key={z.zone_id} value={z.zone_id}>
                      {z.zone_name}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" loading={actionBusy} className="w-full">
                Update Zone Assignment
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Confirm Reject Dialog */}
      <ConfirmDialog
        open={Boolean(rejectTarget)}
        onCancel={() => setRejectTarget(null)}
        onConfirm={() => rejectTarget && handleBusinessAction("reject", rejectTarget.business_id)}
        title={`Reject "${rejectTarget?.business_name}"?`}
        consequence="The application status will be set to Rejected. The partner will need to submit a revised business registration."
        confirmLabel="Reject Business"
        loading={actionBusy}
      />

      {/* Confirm Suspend Dialog (Req 3.1f) */}
      <ConfirmDialog
        open={Boolean(suspendTarget)}
        onCancel={() => setSuspendTarget(null)}
        onConfirm={() => {
          if (!suspendReason.trim()) {
            showError("Please enter a suspension reason.");
            return;
          }
          if (suspendTarget) {
            handleBusinessAction("suspend", suspendTarget.business_id, suspendReason);
          }
        }}
        title={`Suspend "${suspendTarget?.business_name}"?`}
        consequence="All of this business's products will become unavailable, and any unpicked (Placed/Assigned) sub-orders will be cancelled and refunded to customers."
        confirmLabel="Confirm Suspension"
        loading={actionBusy}
      >
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Suspension Reason *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Hygiene violation, repeated delays..."
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </ConfirmDialog>

      {/* Create Admin Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Admin">
        <form onSubmit={handleCreateAdmin} className="space-y-3.5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium">First Name *</label>
              <input
                type="text"
                required
                value={newAdmin.first_name}
                onChange={(e) => setNewAdmin({ ...newAdmin, first_name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Middle Name</label>
              <input
                type="text"
                value={newAdmin.middle_name}
                onChange={(e) => setNewAdmin({ ...newAdmin, middle_name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Last Name *</label>
              <input
                type="text"
                required
                value={newAdmin.last_name}
                onChange={(e) => setNewAdmin({ ...newAdmin, last_name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Username *</label>
              <input
                type="text"
                required
                value={newAdmin.username}
                onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Email *</label>
              <input
                type="email"
                required
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Password *</label>
              <input
                type="password"
                required
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Phone (11 digits)</label>
              <input
                type="tel"
                maxLength={11}
                value={newAdmin.phone}
                onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Admin Role *</label>
              <select
                value={newAdmin.role}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, role: e.target.value as AdminRole })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="Zone Admin">Zone Admin</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
            {newAdmin.role === "Zone Admin" && (
              <div>
                <label className="mb-1 block text-xs font-medium">Assigned Zone *</label>
                <select
                  value={newAdmin.zone_id}
                  onChange={(e) => setNewAdmin({ ...newAdmin, zone_id: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {zones.map((z) => (
                    <option key={z.zone_id} value={z.zone_id}>
                      {z.zone_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={actionBusy}>
              Create Admin
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function AdminGovernancePage() {
  return <RoleGuard allowedRole="Admin">{() => <GovernanceContent />}</RoleGuard>;
}
