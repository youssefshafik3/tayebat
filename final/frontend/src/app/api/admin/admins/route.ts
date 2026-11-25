import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";
import type { AdminRole } from "@/types/database";

export async function GET() {
  try {
    const user = await requireRole(["Admin"]);
    if (!user) return unauthorizedResponse("Admin access required.");
    const admins = await getDb().getAdminList();
    return okResponse(admins);
  } catch (err) {
    return serverErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["Admin"]);
    if (!user) return unauthorizedResponse("Admin access required.");
    const body = await req.json();
    const db = getDb();

    if (body?.action === "assign_zone") {
      const code = await db.assignAdminZone(user.userId, Number(body?.admin_id), Number(body?.zone_id));
      return codeResponse("assign_admin_zone", code);
    }

    const role = (body?.role as AdminRole) || "Super Admin";
    const code = await db.createAdmin(user.userId, {
      first_name: String(body?.first_name ?? ""),
      middle_name: body?.middle_name ? String(body.middle_name) : null,
      last_name: String(body?.last_name ?? ""),
      username: String(body?.username ?? ""),
      password: String(body?.password ?? ""),
      email: String(body?.email ?? ""),
      phone: body?.phone ? String(body.phone) : null,
      dob: body?.dob ? String(body.dob) : null,
      role,
      zone_id: role === "Zone Admin" && body?.zone_id ? Number(body.zone_id) : null,
    });
    return codeResponse("create_admin", code);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
