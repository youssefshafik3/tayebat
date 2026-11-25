import { getDb } from "@/lib/db";
import { okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireRole(["Admin"]);
    if (!user) return unauthorizedResponse("Admin access required.");
    const db = getDb();
    const [health, reconciliation] = await Promise.all([
      db.getPlatformHealthSnapshot(),
      db.getReconcileOrderTotals(),
    ]);
    return okResponse({ health, reconciliation });
  } catch (err) {
    return serverErrorResponse(err);
  }
}
