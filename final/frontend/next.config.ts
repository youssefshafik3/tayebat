import type { NextConfig } from "next";

/**
 * Next.js Configuration
 *
 * `serverExternalPackages` tells Next.js NOT to bundle `mssql` (and its underlying
 * `tedious` SQL Server driver) into client/webpack bundles. It runs strictly on
 * the Node.js server inside `/api/...` route handlers.
 */
const nextConfig: NextConfig = {
  serverExternalPackages: ["mssql", "tedious"],
};

export default nextConfig;
