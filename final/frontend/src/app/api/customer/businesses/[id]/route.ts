import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["Customer"]);
    if (!user) return unauthorizedResponse("Customer access required.");

    const { id } = await context.params;
    const businessId = Number(id);
    if (!businessId) return codeResponse("toggle_favorite", -1);

    const db = getDb();
    const [details, products, favIds, profile] = await Promise.all([
      db.getBusinessDetails(businessId),
      db.getBusinessProducts(businessId),
      db.getFavoriteIds(user.userId),
      db.getCustomerProfile(user.userId),
    ]);

    if (!details) return codeResponse("toggle_favorite", -1);

    return okResponse({
      details,
      products,
      isFavoriteBusiness: favIds.businessIds.includes(businessId),
      favoriteProductIds: favIds.productIds,
      profile,
    });
  } catch (err) {
    return serverErrorResponse(err);
  }
}
