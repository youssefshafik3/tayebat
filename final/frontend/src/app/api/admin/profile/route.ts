import { getDb } from "@/lib/db";
import { okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireRole(["Admin"]);
    if (!user) return unauthorizedResponse("Admin access required.");
    const profile = await getDb().getAdminProfile(user.userId);
    if (!profile) return unauthorizedResponse("Admin profile not found.");
    return okResponse(profile);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
