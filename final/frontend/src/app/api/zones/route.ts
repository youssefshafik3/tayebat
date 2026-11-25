import { getDb } from "@/lib/db";
import { okResponse, serverErrorResponse } from "@/lib/apiHelpers";

export async function GET() {
  try {
    const zones = await getDb().getZones();
    return okResponse(zones);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
