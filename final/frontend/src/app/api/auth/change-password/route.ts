import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { getSessionUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const body = await req.json();
    const db = getDb();
    const code = await db.changePassword(
      user.userId,
      String(body?.old_password ?? ""),
      String(body?.new_password ?? ""),
      String(body?.new_password_repeat ?? "")
    );
    return codeResponse("change_password", code);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
