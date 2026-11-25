import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireRole(["Admin"]);
    if (!user) return unauthorizedResponse("Admin access required.");
    const db = getDb();
    const [blacklisted, customers] = await Promise.all([db.getBlacklistedCustomers(), db.getCustomerList()]);
    return okResponse({ blacklisted, customers });
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

    if (body?.action === "lift") {
      const code = await db.liftCustomerBlacklist(Number(body?.customer_id), user.userId);
      return codeResponse("lift_blacklist", code);
    }

    const code = await db.blacklistCustomer(
      Number(body?.customer_id),
      user.userId,
      String(body?.reason ?? "")
    );
    return codeResponse("blacklist_customer", code);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
