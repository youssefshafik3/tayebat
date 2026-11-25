import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, serverErrorResponse } from "@/lib/apiHelpers";
import { setSessionCookie } from "@/lib/session";
import type { SessionUser, UserRole } from "@/types/database";

const VALID_ROLES: UserRole[] = ["Admin", "Partner", "Rider", "Customer"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const role = body?.role as UserRole;
    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "");

    if (!VALID_ROLES.includes(role) || !username || !password) {
      return codeResponse("login", -1);
    }

    const db = getDb();
    const valid = await db.validateLogin(role, username, password);
    if (!valid) {
      return codeResponse("login", -1);
    }

    const userId = await db.getUserId(username);
    if (!userId) {
      return codeResponse("login", -1);
    }

    const session: SessionUser = { userId, username, role };

    if (role === "Admin") {
      const profile = await db.getAdminProfile(userId);
      if (profile) {
        session.displayName = profile.admin_name;
        session.adminRole = profile.role;
        session.zoneId = profile.zone_id;
        session.zoneName = profile.zone_name;
      }
    } else if (role === "Partner") {
      const biz = await db.getMyBusiness(userId);
      session.displayName = biz?.business_name ?? username;
    } else if (role === "Rider") {
      const profile = await db.getRiderProfile(userId);
      session.displayName = profile?.rider_name ?? username;
      session.zoneName = profile?.zone_name ?? null;
    } else if (role === "Customer") {
      const profile = await db.getCustomerProfile(userId);
      session.displayName = profile?.customer_name ?? username;
      session.zoneId = profile?.active_zone_id ?? null;
      session.zoneName = profile?.active_zone ?? null;
    }

    await setSessionCookie(session);
    return codeResponse("login", 0, session);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
