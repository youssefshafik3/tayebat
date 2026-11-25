import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["Rider"]);
    if (!user) return unauthorizedResponse("Rider access required.");
    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get("from") || "2026-09-01";
    const toDate = searchParams.get("to") || new Date().toISOString().slice(0, 10);

    const db = getDb();
    const [earnings, ratingSummary, history] = await Promise.all([
      db.getMyEarnings(user.userId, fromDate, toDate),
      db.getMyRatingSummary(user.userId),
      db.getMyDeliveryHistory(user.userId, fromDate, toDate),
    ]);
    return okResponse({ earnings, ratingSummary, history });
  } catch (err) {
    return serverErrorResponse(err);
  }
}
