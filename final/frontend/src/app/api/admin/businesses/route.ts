import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireRole(["Admin"]);
    if (!user) return unauthorizedResponse("Admin access required.");
    const db = getDb();
    const [pending, all, suspended] = await Promise.all([
      db.getPendingBusinessApprovals(),
      db.getAllBusinessProfiles(),
      db.getSuspendedBusinesses(),
    ]);
    return okResponse({ pending, all, suspended });
  } catch (err) {
    return serverErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["Admin"]);
    if (!user) return unauthorizedResponse("Admin access required.");
    const body = await req.json();
    const action = body?.action as "approve" | "reject" | "suspend" | "reinstate";
    const businessId = Number(body?.business_id);
    const db = getDb();

    if (action === "approve") {
      const code = await db.approveBusiness(businessId, user.userId);
      return codeResponse("approve_business", code);
    }
    if (action === "reject") {
      const code = await db.rejectBusiness(businessId, user.userId);
      return codeResponse("reject_business", code);
    }
    if (action === "suspend") {
      const code = await db.suspendBusiness(businessId, user.userId, String(body?.reason ?? ""));
      return codeResponse("suspend_business", code);
    }
    if (action === "reinstate") {
      const code = await db.reinstateBusiness(businessId, user.userId);
      return codeResponse("reinstate_business", code);
    }
    return codeResponse("approve_business", -1);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
