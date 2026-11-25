import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { codeResponse, okResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/apiHelpers";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireRole(["Admin"]);
    if (!user) return unauthorizedResponse("Admin access required.");
    const db = getDb();
    const [vouchers, customers] = await Promise.all([db.getActiveVouchers(), db.getCustomerList()]);
    return okResponse({ vouchers, customers });
  } catch (err) {
    return serverErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["Admin"]);
    if (!user) return unauthorizedResponse("Admin access required.");
    const body = await req.json();
    const db = getDb();
    const customerId = Number(body?.customer_id);
    const promoCode = String(body?.promo_code ?? "");
    const code = await db.issueVoucher({
      customer_id: customerId,
      promo_code: promoCode,
      is_percentage: Boolean(body?.is_percentage),
      amount: Number(body?.amount),
      expiry_date: String(body?.expiry_date ?? ""),
      admin_id: user.userId,
    });
    const customers = code === 0 ? await db.getCustomerList() : [];
    const custName = customers.find((c) => c.customer_id === customerId)?.customer_name;
    return codeResponse(
      "issue_voucher",
      code,
      undefined,
      code === 0 ? `The voucher ${promoCode.trim()} was issued to ${custName ?? "the customer"}.` : undefined
    );
  } catch (err) {
    return serverErrorResponse(err);
  }
}
