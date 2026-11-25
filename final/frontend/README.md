# Tayebat Frontend (Next.js)

Frontend web application for **Milestone 3: Local Business Delivery and Fulfillment Management System**, built with Next.js (App Router), React, TypeScript, and Tailwind CSS.

## Quick Start (Demo Mode — Seed Data)

```bash
cd final/frontend
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Connecting to SQL Server (Live Mode)

1. Execute `final/MS3_Database_Solution.sql` and `final/seed_data.sql` on your SQL Server instance.
2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Set `DB_MODE=mssql` and fill in `DB_SERVER`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` in `.env.local`.
4. Restart `npm run dev`.
