/**
 * Unified Server-Side Database Gateway
 * ---------------------------------------------------------------------------
 * Chooses between:
 *  - `mssqlDb` (when `DB_MODE=mssql` in `.env.local`) -> calls SQL Server directly
 *  - `mockDb`  (default / `DB_MODE=mock`)             -> uses seed_data.sql in memory
 *
 * Only imported by Next.js API route handlers (`src/app/api/...`).
 */

import { mockDb } from "./mockDb";
import { mssqlDb } from "./mssqlDb";

export function getDbMode(): "mock" | "mssql" {
  return process.env.DB_MODE === "mssql" ? "mssql" : "mock";
}

export function getDb() {
  return getDbMode() === "mssql" ? mssqlDb : mockDb;
}
