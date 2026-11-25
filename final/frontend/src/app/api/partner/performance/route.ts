import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["Partner"]);
    if (!user) return unauthorizedResponse("Partner access required.");

    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get("from") || "2026-09-01";
    const toDate = searchParams.get("to") || new Date().toISOString().slice(0, 10);

    const db = getDb();
    const business = await db.getMyBusiness(user.userId);
    if (!business) {
      return okResponse({ business: null, sales: [], feedback: null });
    }
    const [sales, feedback] = await Promise.all([
      db.getBusinessSalesReport(business.business_id, fromDate, toDate),
      db.getBusinessFeedbackOverview(business.business_id),
    ]);
    return okResponse({ business, sales, feedback });
  } catch (err) {
    return serverErrorResponse(err);
  }
}
