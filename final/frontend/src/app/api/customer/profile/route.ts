import { getDb } from "@/lib/db";
import { okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireRole(["Customer"]);
    if (!user) return unauthorizedResponse("Customer access required.");
    const profile = await getDb().getCustomerProfile(user.userId);
    if (!profile) return unauthorizedResponse("Customer profile not found.");
    return okResponse(profile);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
