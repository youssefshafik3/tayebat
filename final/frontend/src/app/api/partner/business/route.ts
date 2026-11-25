import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";
import type { BusinessType } from "@/types/database";

export async function GET() {
  try {
    const user = await requireRole(["Partner"]);
    if (!user) return unauthorizedResponse("Partner access required.");
    const db = getDb();
    const business = await db.getMyBusiness(user.userId);
    const phones = business ? await db.getBusinessPhones(business.business_id) : [];
    const zones = await db.getZones();
    return okResponse({ business, phones, zones });
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

    if (body?.action === "update") {
      const biz = await db.getMyBusiness(user.userId);
      if (!biz) return codeResponse("update_business_info", -1);
      const code = await db.updateBusinessInfo(biz.business_id, {
        opening_hour: body?.opening_hour ? String(body.opening_hour) : null,
        closing_hour: body?.closing_hour ? String(body.closing_hour) : null,
        phone: body?.phone ? String(body.phone) : null,
        link_website: body?.link_website !== undefined ? String(body.link_website) : null,
      });
      return codeResponse("update_business_info", code);
    }

    const code = await db.registerBusiness(user.userId, {
      name: String(body?.name ?? ""),
      description: body?.description ? String(body.description) : null,
      link_website: body?.link_website ? String(body.link_website) : null,
      zone_id: Number(body?.zone_id),
      opening_hour: String(body?.opening_hour ?? ""),
      closing_hour: String(body?.closing_hour ?? ""),
      expected_delivery_time: Number(body?.expected_delivery_time),
      phone: body?.phone ? String(body.phone) : null,
      business_type: (body?.business_type as BusinessType) || "Restaurant",
      cuisine_type: body?.cuisine_type ? String(body.cuisine_type) : null,
      food_category: body?.food_category ? String(body.food_category) : null,
      pharmacy_type: body?.pharmacy_type ? String(body.pharmacy_type) : null,
    });
    return codeResponse("register_business", code);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
