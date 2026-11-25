import { okResponse, serverErrorResponse } from "@/lib/apiHelpers";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    return okResponse(user, user ? "Active session" : "Not signed in");
  } catch (err) {
    return serverErrorResponse(err);
  }
}
