import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, serverErrorResponse } from "@/lib/apiHelpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const role = body?.role as "Customer" | "Partner" | "Rider";
    const db = getDb();

    const common = {
      first_name: String(body?.first_name ?? ""),
      middle_name: body?.middle_name ? String(body.middle_name) : null,
      last_name: String(body?.last_name ?? ""),
      username: String(body?.username ?? ""),
      password: String(body?.password ?? ""),
      email: String(body?.email ?? ""),
      phone: body?.phone ? String(body.phone) : null,
      dob: body?.dob ? String(body.dob) : null,
    };

    if (role === "Customer") {
      const code = await db.registerCustomer(common);
      return codeResponse("register_customer", code);
    }

    if (role === "Partner") {
      const code = await db.registerPartner(common);
      return codeResponse("register_partner", code);
    }

    if (role === "Rider") {
      const code = await db.registerRider({
        ...common,
        vehicle_type: String(body?.vehicle_type ?? ""),
        plate_no: String(body?.plate_no ?? ""),
        license_no: String(body?.license_no ?? ""),
        zone_id: Number(body?.zone_id),
      });
      return codeResponse("register_rider", code);
    }

    return codeResponse("register_customer", -1);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
