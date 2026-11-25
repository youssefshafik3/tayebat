import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireRole(["Partner"]);
    if (!user) return unauthorizedResponse("Partner access required.");
    const db = getDb();
    const [business, products] = await Promise.all([
      db.getMyBusiness(user.userId),
      db.getMyProducts(user.userId),
    ]);
    return okResponse({ business, products });
  } catch (err) {
    return serverErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["Partner"]);
    if (!user) return unauthorizedResponse("Partner access required.");
    const body = await req.json();
    const db = getDb();
    const biz = await db.getMyBusiness(user.userId);
    if (!biz) return codeResponse("upsert_product", -1);

    if (body?.action === "toggle") {
      const code = await db.toggleProductStatus(Number(body?.product_id), Boolean(body?.is_available));
      return codeResponse("toggle_product_status", code);
    }

    if (body?.action === "promotion") {
      const code = await db.setProductPromotion(Number(body?.product_id), Number(body?.discount_amount));
      return codeResponse("set_product_promotion", code);
    }

    const code = await db.upsertProduct(biz.business_id, {
      product_id: body?.product_id ? Number(body.product_id) : null,
      name: String(body?.name ?? ""),
      description: body?.description ? String(body.description) : null,
      category: String(body?.category ?? ""),
      price: Number(body?.price),
      is_available: Boolean(body?.is_available ?? true),
    });
    return codeResponse("upsert_product", code);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
