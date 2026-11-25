import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";
import type { PaymentMethod } from "@/types/database";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["Customer"]);
    if (!user) return unauthorizedResponse("Customer access required.");

    const { searchParams } = new URL(req.url);
    const voucherIdParam = searchParams.get("voucher_id");
    const voucherId = voucherIdParam ? Number(voucherIdParam) : null;

    const db = getDb();
    const [profile, cartId, cards, vouchers, zones] = await Promise.all([
      db.getCustomerProfile(user.userId),
      db.getMyActiveCartId(user.userId),
      db.getMyCards(user.userId),
      db.getMyVouchers(user.userId),
      db.getZones(),
    ]);

    const items = cartId ? await db.getCartItems(cartId) : [];
    const activeZone = zones.find((z) => z.zone_id === profile?.active_zone_id) ?? null;
    const zoneFee = activeZone?.delivery_fee ?? 0;

    // Build transparent per-business cost breakdown (Req 3.5e)
    const businessGroupsMap = new Map<
      number,
      { business_id: number; business_name: string; subtotal: number; delivery_fee: number }
    >();
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.line_total;
      const existing = businessGroupsMap.get(item.business_id) ?? {
        business_id: item.business_id,
        business_name: item.business_name,
        subtotal: 0,
        delivery_fee: zoneFee,
      };
      existing.subtotal = Math.round((existing.subtotal + item.line_total) * 100) / 100;
      businessGroupsMap.set(item.business_id, existing);
    }

    subtotal = Math.round(subtotal * 100) / 100;
    const deliveryFeesTotal = Math.round(businessGroupsMap.size * zoneFee * 100) / 100;
    const voucherDiscount =
      subtotal > 0 ? await db.calculateVoucherDiscount(voucherId, subtotal) : 0;
    const finalTotal = Math.round((subtotal + deliveryFeesTotal - Math.max(0, voucherDiscount)) * 100) / 100;

    return okResponse({
      profile,
      cartId,
      items,
      cards,
      vouchers,
      breakdown: {
        businesses: Array.from(businessGroupsMap.values()),
        subtotal,
        zoneFeePerBusiness: zoneFee,
        deliveryFeesTotal,
        voucherDiscount: Math.max(0, voucherDiscount),
        finalTotal,
      },
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
    const db = getDb();

    if (body?.action === "create") {
      const code = await db.createCart(user.userId);
      return codeResponse("create_cart", code);
    }

    if (body?.action === "add") {
      let cartId = await db.getMyActiveCartId(user.userId);
      if (!cartId) {
        const createCode = await db.createCart(user.userId);
        if (createCode !== 0) {
          return codeResponse("create_cart", createCode);
        }
        cartId = await db.getMyActiveCartId(user.userId);
      }
      if (!cartId) return codeResponse("add_to_cart", -1);
      const code = await db.addToCart(
        cartId,
        Number(body?.product_id),
        Number(body?.quantity),
        body?.notes ? String(body.notes) : null
      );
      return codeResponse("add_to_cart", code);
    }

    if (body?.action === "remove") {
      const cartId = await db.getMyActiveCartId(user.userId);
      if (!cartId) return codeResponse("remove_from_cart", -1);
      const code = await db.removeFromCart(cartId, Number(body?.product_id));
      return codeResponse("remove_from_cart", code);
    }

    if (body?.action === "checkout") {
      const cartId = await db.getMyActiveCartId(user.userId);
      if (!cartId) return codeResponse("checkout_cart", -9);
      const code = await db.checkoutCart(
        cartId,
        body?.voucher_id ? Number(body.voucher_id) : null,
        body?.payment_method as PaymentMethod,
        body?.card_id ? Number(body.card_id) : null
      );
      return codeResponse("checkout_cart", code);
    }

    return codeResponse("add_to_cart", -1);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
