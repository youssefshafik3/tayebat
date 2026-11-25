import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["Customer"]);
    if (!user) return unauthorizedResponse("Customer access required.");

    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";

    const db = getDb();
    const [profile, categories, favIds] = await Promise.all([
      db.getCustomerProfile(user.userId),
      db.getProductCategories(),
      db.getFavoriteIds(user.userId),
    ]);

    let businesses;
    if (keyword) {
      businesses = await db.searchPlatform(user.userId, keyword);
    } else if (category && profile?.active_address_id) {
      businesses = await db.nearbyBusinessesByCategory(profile.active_address_id, category);
    } else {
      businesses = await db.browseActiveBusinesses(user.userId);
    }

    return okResponse({
      profile,
      categories,
      businesses,
      favoriteBusinessIds: favIds.businessIds,
    });
  } catch (err) {
    return serverErrorResponse(err);
  }
}
