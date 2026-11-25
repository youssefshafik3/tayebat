import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireRole(["Admin"]);
    if (!user) return unauthorizedResponse("Admin access required.");
    const zones = await getDb().getZones();
    return okResponse(zones);
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

    if (body?.action === "update_fee") {
      const code = await db.updateZoneFee(Number(body?.zone_id), Number(body?.new_fee), user.userId);
      return codeResponse("update_zone_fee", code);
    }

    const code = await db.createZone(String(body?.zone_name ?? ""), Number(body?.delivery_fee), user.userId);
    return codeResponse("create_zone", code);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
