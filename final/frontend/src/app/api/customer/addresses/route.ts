import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireRole(["Customer"]);
    if (!user) return unauthorizedResponse("Customer access required.");
    const db = getDb();
    const [addresses, zones] = await Promise.all([db.getMyAddresses(user.userId), db.getZones()]);
    return okResponse({ addresses, zones });
  } catch (err) {
    return serverErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["Customer"]);
    if (!user) return unauthorizedResponse("Customer access required.");
    const body = await req.json();
    const db = getDb();

    if (body?.action === "set_active") {
      const code = await db.changeActiveAddress(user.userId, Number(body?.address_id));
      return codeResponse("change_active_address", code);
    }

    if (body?.action === "Update" || body?.action === "Delete" || body?.action === "Remove") {
      const code = await db.updateOrDeleteCustomerAddress(
        user.userId,
        Number(body?.address_id),
        String(body?.description ?? ""),
        Number(body?.zone_id ?? 0),
        body.action
      );
      return codeResponse(body.action === "Update" ? "update_address" : "delete_address", code);
    }

    const code = await db.addCustomerAddress(
      user.userId,
      String(body?.description ?? ""),
      Number(body?.zone_id)
    );
    return codeResponse("add_address", code);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
