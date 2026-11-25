"use client";

/**
 * Role Guard Wrapper (`RoleGuard`)
 * ---------------------------------------------------------------------------
 * Requirement 3.1(c):
 * "Pages of a user type open only for a signed-in user of that type."
 *
 * How it works:
 * When a user opens `/admin`, `/partner`, `/rider`, or `/customer`, this
 * component asks `/api/auth/session` who is currently signed in. If nobody is
 * signed in (or they belong to a different user type), it refuses access and
 * sends them back to the start page or their own home page.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { api } from "@/lib/apiClient";
import { AppShell } from "./AppShell";
import { Button, LoadingState } from "@/components/ui/Primitives";
import type { SessionUser, UserRole } from "@/types/database";

const HOME_BY_ROLE: Record<UserRole, string> = {
  Admin: "/admin",
  Partner: "/partner",
  Rider: "/rider",
  Customer: "/customer",
};

export function RoleGuard({
  allowedRole,
  children,
}: {
  allowedRole: UserRole;
  children: (user: SessionUser) => React.ReactNode;
}) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [dbMode, setDbMode] = useState<"mock" | "mssql">("mock");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get<SessionUser | null>("/api/auth/session").then((res) => {
      if (!active) return;
      if (res.dbMode) setDbMode(res.dbMode);
      setUser(res.data ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState label="Checking your session..." />
      </div>
    );
  }

  if (!user || user.role !== allowedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Access Restricted</h1>
          <p className="mt-2 text-sm text-slate-600">
            {!user
              ? `Please sign in as a ${allowedRole} to view this page.`
              : `You are signed in as a ${user.role}. This section is only available to ${allowedRole} accounts.`}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {user ? (
              <Link href={HOME_BY_ROLE[user.role]}>
                <Button>Go to My {user.role} Home</Button>
              </Link>
            ) : (
              <Link href="/">
                <Button>Go to Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell user={user} dbMode={dbMode}>
      {children(user)}
    </AppShell>
  );
}
