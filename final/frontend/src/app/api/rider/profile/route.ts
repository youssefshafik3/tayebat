import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireRole(["Rider"]);
    if (!user) return unauthorizedResponse("Rider access required.");
    const profile = await getDb().getRiderProfile(user.userId);
    if (!profile) return unauthorizedResponse("Rider profile not found.");
    return okResponse(profile);
  } catch (err) {
    return serverErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["Rider"]);
    if (!user) return unauthorizedResponse("Rider access required.");
    const body = await req.json();
    const code = await getDb().setRiderAvailability(user.userId, Boolean(body?.is_available));
    return codeResponse("set_rider_availability", code);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
