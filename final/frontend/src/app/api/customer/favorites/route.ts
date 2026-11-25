import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireRole(["Customer"]);
    if (!user) return unauthorizedResponse("Customer access required.");

    const db = getDb();
    const [favorites, recommended, favIds, allBusinesses] = await Promise.all([
      db.getMyFavorites(user.userId),
      db.getRecommendedProducts(user.userId),
      db.getFavoriteIds(user.userId),
      db.browseActiveBusinesses(user.userId),
    ]);

    const favoriteBusinesses = allBusinesses.filter((b) => favIds.businessIds.includes(b.business_id));

    return okResponse({
      favorites,
      recommended,
      favoriteBusinesses,
      favoriteProductIds: favIds.productIds,
      favoriteBusinessIds: favIds.businessIds,
    });
  } catch (err) {
    return serverErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["Customer"]);
    if (!user) return unauthorizedResponse("Customer access required.");
    const body = await req.json();
    const code = await getDb().toggleFavorite(
      user.userId,
      Number(body?.item_id),
      body?.item_type as "Business" | "Product"
    );
    return codeResponse("toggle_favorite", code);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
