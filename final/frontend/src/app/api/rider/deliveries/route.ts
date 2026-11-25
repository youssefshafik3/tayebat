import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireRole(["Rider"]);
    if (!user) return unauthorizedResponse("Rider access required.");
    const deliveries = await getDb().getMyActiveDeliveries(user.userId);
    return okResponse(deliveries);
  } catch (err) {
    return serverErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["Rider"]);
    if (!user) return unauthorizedResponse("Rider access required.");
    const body = await req.json();
    const deliveryId = Number(body?.delivery_id);
    const db = getDb();

    if (body?.action === "picked_up") {
      const code = await db.markPickedUp(deliveryId);
      return codeResponse("mark_picked_up", code);
    }
    if (body?.action === "delivered") {
      const code = await db.markDelivered(deliveryId);
      return codeResponse("mark_delivered", code);
    }
    return codeResponse("mark_picked_up", -1);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
