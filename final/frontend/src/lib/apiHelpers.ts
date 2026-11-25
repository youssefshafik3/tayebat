/**
 * API Route Response Helpers
 * ---------------------------------------------------------------------------
 * Keeps every `/api/...` route concise and ensures every response follows the
 * exact `ApiResponse<T>` format and translates SQL return codes via Table 3.1.
 */

import { NextResponse } from "next/server";
import { getDbMode } from "./db";
import { translateReturnCode, type ActionKey } from "./errorMessages";
import type { ApiResponse } from "@/types/database";

export function okResponse<T>(data: T, message = "Success"): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    ok: true,
    code: 0,
    message,
    data,
    dbMode: getDbMode(),
  });
}

export function codeResponse<T = undefined>(
  action: ActionKey,
  code: number,
  data?: T,
  customSuccess?: string
): NextResponse<ApiResponse<T>> {
  const ok = code === 0;
  const status = ok ? 200 : code === -3 ? 403 : 400;
  return NextResponse.json(
    {
      ok,
      code,
      message: translateReturnCode(action, code, customSuccess),
      data,
      dbMode: getDbMode(),
    },
    { status }
  );
}

export function unauthorizedResponse(message = "Please sign in to continue."): NextResponse<ApiResponse> {
  return NextResponse.json(
    { ok: false, code: -3, message, dbMode: getDbMode() },
    { status: 401 }
  );
}

export function serverErrorResponse(err: unknown): NextResponse<ApiResponse> {
  // Log full details on the server only; never expose raw SQL errors to the browser (Req 3.1a).
  console.error("[Tayebat API Error]", err);
  return NextResponse.json(
    {
      ok: false,
      code: -1,
      message: "Something went wrong while communicating with the server. Please try again.",
      dbMode: getDbMode(),
    },
    { status: 500 }
  );
}
