import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireRole(["Customer"]);
    if (!user) return unauthorizedResponse("Customer access required.");
    const cards = await getDb().getMyCards(user.userId);
    return okResponse(cards);
  } catch (err) {
    return serverErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["Customer"]);
    if (!user) return unauthorizedResponse("Customer access required.");
    const body = await req.json();
    const code = await getDb().addCard(
      user.userId,
      String(body?.card_no ?? "").replace(/\s+/g, ""),
      String(body?.card_holder_name ?? ""),
      String(body?.expiration_date ?? "")
    );
    return codeResponse("add_card", code);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
