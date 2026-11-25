"use client";

/**
 * Authenticated Navigation Shell (`AppShell`)
 * ---------------------------------------------------------------------------
 * Requirement 3.1(b) & 3.1(c):
 * - Consistent menus & links for navigating inside a role (users never type URLs).
 * - "Log out" button on every authenticated page.
 * - Change Password modal (calls Milestone 2 `Change_Password`).
 * - Clear indicator showing whether the app is in Demo Mode (seed data) or
 *   connected to Live SQL Server.
 */

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bike,
  Heart,
  Home,
  KeyRound,
  LogOut,
  MapPin,
  Menu,
  Package,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { api } from "@/lib/apiClient";
import { useFeedback } from "@/components/ui/FeedbackBanner";
import { Button, Modal } from "@/components/ui/Primitives";
import type { SessionUser, UserRole } from "@/types/database";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case "Admin":
      return [
        { href: "/admin", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
        { href: "/admin/governance", label: "Businesses & Admins", icon: <ShieldCheck className="h-4 w-4" /> },
        { href: "/admin/customers", label: "Vouchers & Blacklist", icon: <Users className="h-4 w-4" /> },
        { href: "/admin/zones", label: "Zones & Comparison", icon: <MapPin className="h-4 w-4" /> },
        { href: "/admin/insights", label: "Revenue, Riders & Market", icon: <BarChart3 className="h-4 w-4" /> },
      ];
    case "Partner":
      return [
        { href: "/partner", label: "My Business", icon: <Store className="h-4 w-4" /> },
        { href: "/partner/products", label: "Products & Promos", icon: <Package className="h-4 w-4" /> },
        { href: "/partner/performance", label: "Sales & Feedback", icon: <BarChart3 className="h-4 w-4" /> },
      ];
    case "Rider":
      return [
        { href: "/rider", label: "Active Deliveries", icon: <Bike className="h-4 w-4" /> },
        { href: "/rider/performance", label: "Earnings & Ratings", icon: <BarChart3 className="h-4 w-4" /> },
      ];
    case "Customer":
      return [
        { href: "/customer", label: "Browse", icon: <Home className="h-4 w-4" /> },
        { href: "/customer/cart", label: "Cart & Checkout", icon: <ShoppingCart className="h-4 w-4" /> },
        { href: "/customer/orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4" /> },
        { href: "/customer/favorites", label: "Favorites & Picks", icon: <Heart className="h-4 w-4" /> },
        { href: "/customer/account", label: "Addresses & Cards", icon: <UserCheck className="h-4 w-4" /> },
      ];
  }
}

export function AppShell({
  user,
  dbMode,
  children,
}: {
  user: SessionUser;
  dbMode?: "mock" | "mssql";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { notifyResult } = useFeedback();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const navItems = getNavItems(user.role);

  async function handleLogout() {
    const res = await api.post("/api/auth/logout");
    notifyResult(res);
    router.push("/");
    router.refresh();
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!oldPassword || !newPassword || !repeatPassword) {
      notifyResult({ ok: false, message: "Please fill in all password fields." });
      return;
    }
    if (newPassword !== repeatPassword) {
      notifyResult({ ok: false, message: "New password and confirmation do not match." });
      return;
    }
    setPwLoading(true);
    const res = await api.post("/api/auth/change-password", {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_repeat: repeatPassword,
    });
    setPwLoading(false);
    notifyResult(res);
    if (res.ok) {
      setPwOpen(false);
      setOldPassword("");
      setNewPassword("");
      setRepeatPassword("");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href={navItems[0].href} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shadow-xs">
                T
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900">Tayebat</span>
                <span className="ml-2 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                  {user.role === "Admin" && user.adminRole ? user.adminRole : user.role}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active =
                item.href === navItems[0].href
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right User Controls */}
          <div className="flex items-center gap-2">
            <span
              title={
                dbMode === "mssql"
                  ? "Connected to SQL Server Milestone 2 database"
                  : "Running in Demo Mode with in-memory seed_data.sql"
              }
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                dbMode === "mssql"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  dbMode === "mssql" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {dbMode === "mssql" ? "SQL Server" : "Demo Data"}
            </span>

            <span className="hidden md:inline text-xs font-medium text-slate-600 px-2">
              {user.displayName || user.username}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPwOpen(true)}
              title="Change Password"
            >
              <KeyRound className="h-4 w-4" />
              <span className="hidden xl:inline">Password</span>
            </Button>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <nav className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active =
                  item.href === navItems[0].href
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      active
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>

      {/* Change Password Modal */}
      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Repeat New Password</label>
            <input
              type="password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setPwOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={pwLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
