import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireRole(["Customer"]);
    if (!user) return unauthorizedResponse("Customer access required.");
    const db = getDb();
    const [orders, addresses, zonePerf, vouchers] = await Promise.all([
      db.getMyOrderHistory(user.userId),
      db.getMyAddresses(user.userId),
      db.getZoneDeliveryPerformance(),
      db.getMyVouchers(user.userId),
    ]);

    const subOrdersEntries = await Promise.all(
      orders.map(async (o) => [o.order_id, await db.getOrderSubOrders(o.order_id)] as const)
    );
    const subOrdersByOrder: Record<number, Awaited<ReturnType<typeof db.getOrderSubOrders>>> = {};
    for (const [oid, subs] of subOrdersEntries) {
      subOrdersByOrder[oid] = subs;
    }

    return okResponse({ orders, subOrdersByOrder, addresses, zonePerf, vouchers });
  } catch (err) {
    return serverErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["Customer"]);
    if (!user) return unauthorizedResponse("Customer access required.");
    const body = await req.json();
    const db = getDb();

    if (body?.action === "cancel") {
      const code = await db.cancelOrder(Number(body?.order_id), user.userId);
      return codeResponse("cancel_order", code);
    }

    if (body?.action === "reorder") {
      const code = await db.reorder(Number(body?.order_id), Number(body?.address_id), user.userId);
      return codeResponse("reorder", code);
    }

    if (body?.action === "feedback") {
      const code = await db.submitFeedback(
        Number(body?.suborder_id),
        String(body?.headline ?? ""),
        body?.description ? String(body.description) : null,
        Number(body?.rating)
      );
      return codeResponse("submit_feedback", code);
    }

    if (body?.action === "rate_rider") {
      const code = await db.rateRider(Number(body?.suborder_id), Number(body?.rider_rating));
      return codeResponse("rate_rider", code);
    }

    return codeResponse("cancel_order", -1);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
