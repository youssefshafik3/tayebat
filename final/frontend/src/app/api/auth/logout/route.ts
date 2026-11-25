import { okResponse, serverErrorResponse } from "@/lib/apiHelpers";
import { clearSessionCookie } from "@/lib/session";

export async function POST() {
  try {
    await clearSessionCookie();
    return okResponse({ loggedOut: true }, "Signed out successfully.");
  } catch (err) {
    return serverErrorResponse(err);
  }
}
