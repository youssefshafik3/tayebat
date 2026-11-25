"use client";

/**
 * Start Page — Login & Registration Portal
 * ---------------------------------------------------------------------------
 * Requirement 3.1(c):
 * "The website opens on a start page with Login and Register for each user type
 *  (admins only log in). After login, every user lands on a home page of his or
 *  her type..."
 *
 * Requirement 3.1(e):
 * "Forms check the input before calling the database (required fields, numbers,
 *  dates, 11-digit phone, 16-digit card) and hide passwords."
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bike,
  Eye,
  EyeOff,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import { api } from "@/lib/apiClient";
import { AlertBanner, useFeedback } from "@/components/ui/FeedbackBanner";
import { Button, Card } from "@/components/ui/Primitives";
import type { SessionUser, UserRole, Zone } from "@/types/database";

const ROLE_META: Record<
  UserRole,
  { label: string; subtitle: string; icon: React.ReactNode; canRegister: boolean; home: string }
> = {
  Customer: {
    label: "Customer",
    subtitle: "Browse local restaurants & pharmacies, manage carts, and track orders",
    icon: <ShoppingBag className="h-5 w-5" />,
    canRegister: true,
    home: "/customer",
  },
  Partner: {
    label: "Partner",
    subtitle: "Register your business, manage products & discounts, and view sales",
    icon: <Store className="h-5 w-5" />,
    canRegister: true,
    home: "/partner",
  },
  Rider: {
    label: "Rider",
    subtitle: "Toggle availability, pick up and deliver orders, and track earnings",
    icon: <Bike className="h-5 w-5" />,
    canRegister: true,
    home: "/rider",
  },
  Admin: {
    label: "Admin",
    subtitle: "Govern businesses, zones, vouchers, blacklists, and platform insights",
    icon: <ShieldCheck className="h-5 w-5" />,
    canRegister: false,
    home: "/admin",
  },
};

const DEMO_ACCOUNTS: { role: UserRole; label: string; username: string; password: string }[] = [
  { role: "Admin", label: "Super Admin (Mona Hassan)", username: "mona.hassan", password: "Pass@001" },
  { role: "Admin", label: "Zone Admin - Maadi (Karim Adel)", username: "karim.adel", password: "Pass@002" },
  { role: "Customer", label: "Customer (Ahmed Salem · 500 EGP)", username: "ahmed.salem", password: "Pass@017" },
  { role: "Customer", label: "Customer (Sara Mostafa)", username: "sara.mostafa", password: "Pass@018" },
  { role: "Partner", label: "Partner - Koshary El Tahrir", username: "tarek.fouad", password: "Pass@004" },
  { role: "Partner", label: "Partner - No Business Yet (Mai)", username: "mai.lotfy", password: "Pass@011" },
  { role: "Rider", label: "Rider - Maadi (Ali Ibrahim)", username: "ali.ibrahim", password: "Pass@012" },
];

export default function StartPage() {
  const router = useRouter();
  const { notifyResult } = useFeedback();

  const [role, setRole] = useState<UserRole>("Customer");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [dbMode, setDbMode] = useState<"mock" | "mssql">("mock");
  const [existingSession, setExistingSession] = useState<SessionUser | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Registration fields
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [vehicleType, setVehicleType] = useState("Motorcycle");
  const [plateNo, setPlateNo] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [zoneId, setZoneId] = useState<string>("");

  useEffect(() => {
    api.get<Zone[]>("/api/zones").then((res) => {
      if (res.dbMode) setDbMode(res.dbMode);
      if (res.ok && res.data) {
        setZones(res.data);
        if (res.data.length > 0) setZoneId(String(res.data[0].zone_id));
      }
    });
    api.get<SessionUser | null>("/api/auth/session").then((res) => {
      if (res.data) setExistingSession(res.data);
    });
  }, []);

  function selectRole(nextRole: UserRole) {
    setRole(nextRole);
    setFormError(null);
    if (!ROLE_META[nextRole].canRegister) {
      setMode("login");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!username.trim() || !password) {
      setFormError("Please enter both your username and password.");
      return;
    }

    setSubmitting(true);
    const res = await api.post<SessionUser>("/api/auth/login", {
      role,
      username: username.trim(),
      password,
    });
    setSubmitting(false);

    if (!res.ok) {
      setFormError(res.message);
      notifyResult(res);
      return;
    }

    notifyResult(res);
    router.push(ROLE_META[role].home);
    router.refresh();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!firstName.trim() || !lastName.trim() || !regUsername.trim() || !regPassword || !email.trim()) {
      setFormError("Please fill in all required fields (First Name, Last Name, Username, Email, Password).");
      return;
    }
    if (phone.trim() && !/^\d{11}$/.test(phone.trim())) {
      setFormError("Phone number must be exactly 11 digits (numbers only, e.g. 01012345678).");
      return;
    }
    if (dob && dob > new Date().toISOString().slice(0, 10)) {
      setFormError("Date of birth cannot be in the future.");
      return;
    }
    if (role === "Rider" && (!vehicleType.trim() || !plateNo.trim() || !licenseNo.trim() || !zoneId)) {
      setFormError("Riders must provide vehicle type, plate number, license number, and delivery zone.");
      return;
    }

    setSubmitting(true);
    const res = await api.post("/api/auth/register", {
      role,
      first_name: firstName.trim(),
      middle_name: middleName.trim() || null,
      last_name: lastName.trim(),
      username: regUsername.trim(),
      password: regPassword,
      email: email.trim(),
      phone: phone.trim() || null,
      dob: dob || null,
      vehicle_type: vehicleType.trim(),
      plate_no: plateNo.trim(),
      license_no: licenseNo.trim(),
      zone_id: zoneId ? Number(zoneId) : null,
    });
    setSubmitting(false);

    if (!res.ok) {
      setFormError(res.message);
      notifyResult(res);
      return;
    }

    notifyResult(res);
    setMode("login");
    setUsername(regUsername.trim());
    setPassword("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50/60">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Top Hero Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white shadow-md">
              T
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Tayebat Delivery Platform
              </h1>
              <p className="text-sm text-slate-600">
                Local Business Delivery & Fulfillment Management System
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
              dbMode === "mssql"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                dbMode === "mssql" ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {dbMode === "mssql"
              ? "Connected to SQL Server"
              : "Demo Mode (Seeded from seed_data.sql)"}
          </span>
        </div>

        {existingSession && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-900">
            <span>
              You are currently signed in as{" "}
              <strong>{existingSession.displayName || existingSession.username}</strong> (
              {existingSession.role}).
            </span>
            <Button size="sm" onClick={() => router.push(ROLE_META[existingSession.role].home)}>
              Continue to {existingSession.role} Home
            </Button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Role Selector + Quick Demo Accounts */}
          <div className="space-y-6 lg:col-span-5">
            <Card className="p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                1. Choose Your Account Type
              </h2>
              <div className="mt-3 grid gap-2.5">
                {(Object.keys(ROLE_META) as UserRole[]).map((r) => {
                  const meta = ROLE_META[r];
                  const selected = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => selectRole(r)}
                      className={`flex items-start gap-3.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                        selected
                          ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          selected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {meta.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{meta.label}</span>
                          {!meta.canRegister && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                              Login Only
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{meta.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Quick-Fill Seed Accounts Helper */}
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>Quick Fill Seed Accounts (from seed_data.sql)</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Click any sample account below to populate the login form.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => {
                      setRole(acc.role);
                      setMode("login");
                      setUsername(acc.username);
                      setPassword(acc.password);
                      setFormError(null);
                    }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Login / Register Form */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {role} {mode === "login" ? "Sign In" : "Registration"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {mode === "login"
                      ? `Sign in with your ${role.toLowerCase()} username and password.`
                      : `Create a new ${role.toLowerCase()} account on Tayebat.`}
                  </p>
                </div>

                {ROLE_META[role].canRegister && (
                  <div className="inline-flex rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setFormError(null);
                      }}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                        mode === "login" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setFormError(null);
                      }}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                        mode === "register" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                      }`}
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>

              {formError && (
                <div className="mb-5">
                  <AlertBanner variant="error" title="Could not proceed" message={formError} />
                </div>
              )}

              {mode === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={role === "Admin" ? "e.g. mona.hassan" : "Enter your username"}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" size="lg" loading={submitting} className="w-full">
                    Sign In as {role}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={30}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        maxLength={30}
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={30}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Username *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={30}
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        maxLength={100}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Password *
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        maxLength={30}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Phone (11 digits)
                      </label>
                      <input
                        type="tel"
                        maxLength={11}
                        placeholder="01012345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {role === "Rider" && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Rider Vehicle & Zone Details
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            Vehicle Type *
                          </label>
                          <select
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="Motorcycle">Motorcycle</option>
                            <option value="Bicycle">Bicycle</option>
                            <option value="Car">Car</option>
                            <option value="Scooter">Scooter</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            Delivery Zone *
                          </label>
                          <select
                            value={zoneId}
                            onChange={(e) => setZoneId(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                          >
                            {zones.map((z) => (
                              <option key={z.zone_id} value={z.zone_id}>
                                {z.zone_name} ({z.delivery_fee} EGP fee)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            Plate Number *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={15}
                            placeholder="MAA-9901"
                            value={plateNo}
                            onChange={(e) => setPlateNo(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            License Number *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={20}
                            placeholder="LIC-9901"
                            value={licenseNo}
                            onChange={(e) => setLicenseNo(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button type="submit" size="lg" loading={submitting} className="w-full">
                    Create {role} Account
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
