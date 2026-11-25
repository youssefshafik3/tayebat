import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["Admin"]);
    if (!user) return unauthorizedResponse("Admin access required.");

    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get("from") || "2026-09-01";
    const toDate = searchParams.get("to") || new Date().toISOString().slice(0, 10);
    const reportDate = searchParams.get("date") || "2026-09-01";

    const db = getDb();
    const [
      zones,
      businessesPerZone,
      zoneDeliveryPerf,
      dailyRevenue,
      topRiders,
      riderPerfSummary,
      topProducts,
      businessRatings,
    ] = await Promise.all([
      db.getZones(),
      db.getBusinessesPerZone(),
      db.getZoneDeliveryPerformance(),
      db.getDailyRevenueReport(reportDate),
      db.getTopRiders(fromDate, toDate),
      db.getRiderPerformanceSummary(),
      db.getTopSellingProducts(),
      db.getBusinessRatingsSummary(),
    ]);

    const zoneOrderReports = await Promise.all(
      zones.map((z) => db.getZoneOrderReport(z.zone_id, fromDate, toDate))
    );

    return okResponse({
      zones,
      businessesPerZone,
      zoneDeliveryPerf,
      zoneOrderReports: zoneOrderReports.filter(Boolean),
      dailyRevenue,
      topRiders,
      riderPerfSummary,
      topProducts,
      businessRatings,
    });
  } catch (err) {
    return serverErrorResponse(err);
  }
}
