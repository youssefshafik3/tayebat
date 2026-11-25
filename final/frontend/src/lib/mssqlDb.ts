/**
 * Live SQL Server Integration (`DB_MODE=mssql`)
 * ---------------------------------------------------------------------------
 * This module runs ONLY on the Node.js server (never in the browser) and
 * executes the exact Milestone 2 stored procedures, table-valued functions,
 * scalar functions, and views from `final/MS3_Database_Solution.sql`.
 *
 * Notice how zero business logic is re-implemented here: we pass parameters
 * directly to SQL Server and read back either result sets or the integer
 * `returnValue` (`0`, `-1` through `-9`).
 */

import sql from "mssql";
import type {
  ActiveDelivery,
  ActiveVoucher,
  AdminListItem,
  AdminProfile,
  AdminRole,
  BlacklistedCustomer,
  BrowseBusinessItem,
  BusinessDetails,
  BusinessFeedbackOverview,
  BusinessesPerZoneRow,
  BusinessProfile,
  BusinessRatingRow,
  BusinessSalesRow,
  BusinessType,
  CartItemRow,
  CustomerAddress,
  CustomerCard,
  CustomerListItem,
  CustomerOrderRow,
  CustomerProfile,
  CustomerVoucher,
  DailyRevenueRow,
  FavoriteProductRow,
  OrderReconciliationIssue,
  OrderSubOrderRow,
  PartnerBusiness,
  PartnerProduct,
  PaymentMethod,
  PendingBusinessApproval,
  PlatformHealthSnapshot,
  PublicProduct,
  RecommendedProductRow,
  RiderDeliveryHistoryRow,
  RiderEarnings,
  RiderPerformanceRow,
  RiderProfile,
  RiderRatingSummary,
  SuspendedBusiness,
  TopRiderRow,
  TopSellingProductRow,
  UserRole,
  Zone,
  ZoneDeliveryPerformanceRow,
  ZoneOrderReportRow,
} from "@/types/database";

const globalForSql = globalThis as unknown as { __tayebatSqlPool?: Promise<sql.ConnectionPool> };

async function getPool(): Promise<sql.ConnectionPool> {
  if (!globalForSql.__tayebatSqlPool) {
    const config: sql.config = {
      server: process.env.DB_SERVER || "localhost",
      port: Number(process.env.DB_PORT || 1433),
      database: process.env.DB_NAME || "LocalDeliveryMarketplace_Team_00",
      user: process.env.DB_USER || "sa",
      password: process.env.DB_PASSWORD || "",
      options: {
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== "false",
      },
    };
    globalForSql.__tayebatSqlPool = new sql.ConnectionPool(config).connect();
  }
  return globalForSql.__tayebatSqlPool;
}

function fmtTime(val: unknown): string {
  if (!val) return "00:00";
  if (val instanceof Date) return val.toISOString().slice(11, 16);
  return String(val).slice(0, 5);
}

function fmtDate(val: unknown): string {
  if (!val) return "";
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

function fmtDateTime(val: unknown): string {
  if (!val) return "";
  if (val instanceof Date) return val.toISOString().replace("T", " ").slice(0, 16);
  return String(val);
}

export const mssqlDb = {
  // ---------------- Auth & Shared ----------------
  async validateLogin(role: UserRole, username: string, password: string): Promise<boolean> {
    const pool = await getPool();
    const fnMap: Record<UserRole, string> = {
      Admin: "AdminLoginValidation",
      Partner: "PartnerLoginValidation",
      Rider: "RiderLoginValidation",
      Customer: "CustomerLoginValidation",
    };
    const res = await pool
      .request()
      .input("username", sql.VarChar(30), username)
      .input("password", sql.VarChar(30), password)
      .query(`SELECT dbo.${fnMap[role]}(@username, @password) AS valid`);
    return Boolean(res.recordset[0]?.valid);
  },

  async getUserId(username: string): Promise<number | null> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("username", sql.VarChar(30), username)
      .query("SELECT dbo.h_GetUserId(@username) AS user_id");
    return res.recordset[0]?.user_id ?? null;
  },

  async registerCustomer(input: {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    username: string;
    password: string;
    email: string;
    phone?: string | null;
    dob?: string | null;
  }): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("first_name", sql.VarChar(30), input.first_name)
      .input("middle_name", sql.VarChar(30), input.middle_name || null)
      .input("last_name", sql.VarChar(30), input.last_name)
      .input("username", sql.VarChar(30), input.username)
      .input("password", sql.VarChar(30), input.password)
      .input("email", sql.VarChar(100), input.email)
      .input("phone", sql.Char(11), input.phone || null)
      .input("dob", sql.Date, input.dob || null)
      .execute("Customer_Register");
    return res.returnValue;
  },

  async registerPartner(input: {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    username: string;
    password: string;
    email: string;
    phone?: string | null;
    dob?: string | null;
  }): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("first_name", sql.VarChar(30), input.first_name)
      .input("middle_name", sql.VarChar(30), input.middle_name || null)
      .input("last_name", sql.VarChar(30), input.last_name)
      .input("username", sql.VarChar(30), input.username)
      .input("password", sql.VarChar(30), input.password)
      .input("email", sql.VarChar(100), input.email)
      .input("phone", sql.Char(11), input.phone || null)
      .input("dob", sql.Date, input.dob || null)
      .execute("Partner_Register");
    return res.returnValue;
  },

  async registerRider(input: {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    username: string;
    password: string;
    email: string;
    phone?: string | null;
    dob?: string | null;
    vehicle_type: string;
    plate_no: string;
    license_no: string;
    zone_id: number;
  }): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("first_name", sql.VarChar(30), input.first_name)
      .input("middle_name", sql.VarChar(30), input.middle_name || null)
      .input("last_name", sql.VarChar(30), input.last_name)
      .input("username", sql.VarChar(30), input.username)
      .input("password", sql.VarChar(30), input.password)
      .input("email", sql.VarChar(100), input.email)
      .input("phone", sql.Char(11), input.phone || null)
      .input("dob", sql.Date, input.dob || null)
      .input("vehicle_type", sql.VarChar(30), input.vehicle_type)
      .input("plate_no", sql.VarChar(15), input.plate_no)
      .input("license_no", sql.VarChar(20), input.license_no)
      .input("zone_id", sql.Int, input.zone_id)
      .execute("Rider_Register");
    return res.returnValue;
  },

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    newPasswordRepeat: string
  ): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("user_id", sql.Int, userId)
      .input("old_password", sql.VarChar(30), oldPassword)
      .input("new_password", sql.VarChar(30), newPassword)
      .input("new_password_repeat", sql.VarChar(30), newPasswordRepeat)
      .output("success", sql.Bit)
      .execute("Change_Password");
    return res.returnValue;
  },

  async getZones(): Promise<Zone[]> {
    const pool = await getPool();
    const res = await pool.request().query("SELECT * FROM dbo.h_ZoneList");
    return res.recordset.map((r) => ({
      zone_id: r.zone_id,
      zone_name: r.zone_name,
      delivery_fee: Number(r.delivery_fee),
    }));
  },

  // ---------------- Admin ----------------
  async getAdminProfile(adminId: number): Promise<AdminProfile | null> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("admin_id", sql.Int, adminId)
      .query("SELECT * FROM dbo.h_AdminProfile(@admin_id)");
    return res.recordset[0] ?? null;
  },

  async getAdminList(): Promise<AdminListItem[]> {
    const pool = await getPool();
    const res = await pool.request().query("SELECT * FROM dbo.h_AdminList");
    return res.recordset;
  },

  async createAdmin(
    superAdminId: number,
    input: {
      first_name: string;
      middle_name?: string | null;
      last_name: string;
      username: string;
      password: string;
      email: string;
      phone?: string | null;
      dob?: string | null;
      role: AdminRole;
      zone_id: number | null;
    }
  ): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("first_name", sql.VarChar(30), input.first_name)
      .input("middle_name", sql.VarChar(30), input.middle_name || null)
      .input("last_name", sql.VarChar(30), input.last_name)
      .input("username", sql.VarChar(30), input.username)
      .input("password", sql.VarChar(30), input.password)
      .input("email", sql.VarChar(100), input.email)
      .input("phone", sql.Char(11), input.phone || null)
      .input("dob", sql.Date, input.dob || null)
      .input("role", sql.VarChar(20), input.role)
      .input("zone_id", sql.Int, input.zone_id)
      .input("super_admin_id", sql.Int, superAdminId)
      .execute("Create_Admin");
    return res.returnValue;
  },

  async assignAdminZone(superAdminId: number, adminId: number, zoneId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("admin_id", sql.Int, adminId)
      .input("zone_id", sql.Int, zoneId)
      .input("super_admin_id", sql.Int, superAdminId)
      .execute("Assign_Admin_Zone");
    return res.returnValue;
  },

  async getAllBusinessProfiles(): Promise<BusinessProfile[]> {
    const pool = await getPool();
    const res = await pool.request().query("SELECT * FROM dbo.allBusinessProfiles");
    return res.recordset.map((r) => ({
      ...r,
      opening_hour: fmtTime(r.opening_hour),
      closing_hour: fmtTime(r.closing_hour),
    }));
  },

  async getPendingBusinessApprovals(): Promise<PendingBusinessApproval[]> {
    const pool = await getPool();
    const res = await pool.request().query("SELECT * FROM dbo.PendingBusinessApprovals");
    return res.recordset;
  },

  async getSuspendedBusinesses(): Promise<SuspendedBusiness[]> {
    const pool = await getPool();
    const res = await pool.request().query("SELECT * FROM dbo.h_SuspendedBusinesses");
    return res.recordset;
  },

  async approveBusiness(businessId: number, adminId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("business_id", sql.Int, businessId)
      .input("admin_id", sql.Int, adminId)
      .execute("Approve_Business");
    return res.returnValue;
  },

  async rejectBusiness(businessId: number, adminId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("business_id", sql.Int, businessId)
      .input("admin_id", sql.Int, adminId)
      .execute("Reject_Business");
    return res.returnValue;
  },

  async suspendBusiness(businessId: number, adminId: number, reason: string): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("business_id", sql.Int, businessId)
      .input("admin_id", sql.Int, adminId)
      .input("reason", sql.VarChar(255), reason)
      .execute("Suspend_Business");
    return res.returnValue;
  },

  async reinstateBusiness(businessId: number, superAdminId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("business_id", sql.Int, businessId)
      .input("super_admin_id", sql.Int, superAdminId)
      .execute("Reinstate_Business");
    return res.returnValue;
  },

  async createZone(zoneName: string, deliveryFee: number, superAdminId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("zone_name", sql.VarChar(50), zoneName)
      .input("delivery_fee", sql.Decimal(10, 2), deliveryFee)
      .input("super_admin_id", sql.Int, superAdminId)
      .execute("Create_Zone");
    return res.returnValue;
  },

  async updateZoneFee(zoneId: number, newFee: number, superAdminId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("zone_id", sql.Int, zoneId)
      .input("new_fee", sql.Decimal(10, 2), newFee)
      .input("super_admin_id", sql.Int, superAdminId)
      .execute("Update_Zone_Fee");
    return res.returnValue;
  },

  async getCustomerList(): Promise<CustomerListItem[]> {
    const pool = await getPool();
    const res = await pool.request().query("SELECT * FROM dbo.h_CustomerList");
    return res.recordset;
  },

  async getActiveVouchers(): Promise<ActiveVoucher[]> {
    const pool = await getPool();
    const [vRes, cRes] = await Promise.all([
      pool.request().query("SELECT * FROM dbo.ActiveVouchers"),
      pool.request().query("SELECT customer_id, customer_name FROM dbo.h_CustomerList"),
    ]);
    const names = new Map<number, string>(cRes.recordset.map((c) => [c.customer_id, c.customer_name]));
    return vRes.recordset.map((v) => ({
      voucher_id: v.voucher_id,
      promo_code: v.promo_code,
      customer_id: v.customer_id,
      customer_name: names.get(v.customer_id),
      is_percentage: Boolean(v.is_percentage),
      amount: Number(v.amount),
      expiry_date: fmtDate(v.expiry_date),
    }));
  },

  async issueVoucher(input: {
    customer_id: number;
    promo_code: string;
    is_percentage: boolean;
    amount: number;
    expiry_date: string;
    admin_id: number;
  }): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, input.customer_id)
      .input("promo_code", sql.VarChar(30), input.promo_code)
      .input("is_percentage", sql.Bit, input.is_percentage ? 1 : 0)
      .input("amount", sql.Decimal(10, 2), input.amount)
      .input("expiry_date", sql.Date, input.expiry_date)
      .input("admin_id", sql.Int, input.admin_id)
      .execute("Issue_Voucher");
    return res.returnValue;
  },

  async getBlacklistedCustomers(): Promise<BlacklistedCustomer[]> {
    const pool = await getPool();
    const res = await pool.request().query("SELECT * FROM dbo.h_BlacklistedCustomers");
    return res.recordset;
  },

  async blacklistCustomer(customerId: number, adminId: number, reason: string): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .input("admin_id", sql.Int, adminId)
      .input("reason", sql.VarChar(255), reason)
      .execute("Blacklist_Customer");
    return res.returnValue;
  },

  async liftCustomerBlacklist(customerId: number, adminId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .input("admin_id", sql.Int, adminId)
      .execute("Lift_Customer_Blacklist");
    return res.returnValue;
  },

  async getPlatformHealthSnapshot(): Promise<PlatformHealthSnapshot> {
    const pool = await getPool();
    const res = await pool.request().query("SELECT * FROM dbo.Platform_Health_Snapshot()");
    const r = res.recordset[0];
    return {
      active_businesses: Number(r.active_businesses),
      available_riders: Number(r.available_riders),
      orders_today: Number(r.orders_today),
      avg_delivery_time_today: r.avg_delivery_time_today !== null ? Number(r.avg_delivery_time_today) : null,
      low_ratings_today: Number(r.low_ratings_today),
    };
  },

  async getReconcileOrderTotals(): Promise<OrderReconciliationIssue[]> {
    const pool = await getPool();
    const res = await pool.request().query("SELECT * FROM dbo.Reconcile_Order_Totals()");
    return res.recordset.map((r) => ({
      order_id: r.order_id,
      expected_total: Number(r.expected_total),
      order_total: Number(r.order_total),
      payment_amount: r.payment_amount !== null ? Number(r.payment_amount) : null,
    }));
  },

  async getBusinessesPerZone(): Promise<BusinessesPerZoneRow[]> {
    const pool = await getPool();
    const res = await pool.request().query("SELECT * FROM dbo.BusinessesPerZone");
    return res.recordset;
  },

  async getZoneDeliveryPerformance(): Promise<ZoneDeliveryPerformanceRow[]> {
    const pool = await getPool();
    const res = await pool.request().query("SELECT * FROM dbo.ZoneDeliveryPerformance");
    return res.recordset.map((r) => ({
      zone_id: r.zone_id,
      zone_name: r.zone_name,
      delivery_count: Number(r.delivery_count),
      avg_tracking_time: r.avg_tracking_time !== null ? Number(r.avg_tracking_time) : null,
    }));
  },

  async getZoneOrderReport(zoneId: number, fromDate: string, toDate: string): Promise<ZoneOrderReportRow | null> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("zone_id", sql.Int, zoneId)
      .input("from_date", sql.Date, fromDate)
      .input("to_date", sql.Date, toDate)
      .query("SELECT * FROM dbo.ZoneOrderReport(@zone_id, @from_date, @to_date)");
    const r = res.recordset[0];
    if (!r) return null;
    return {
      zone_id: r.zone_id,
      zone_name: r.zone_name,
      number_of_orders: Number(r.number_of_orders),
      avg_order_total: r.avg_order_total !== null ? Number(r.avg_order_total) : null,
      platform_commission: Number(r.platform_commission),
    };
  },

  async getDailyRevenueReport(reportDate: string): Promise<DailyRevenueRow[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("report_date", sql.Date, reportDate)
      .query("SELECT * FROM dbo.Daily_Revenue_Report(@report_date)");
    return res.recordset.map((r) => ({
      zone_name: r.zone_name,
      business_type: r.business_type,
      number_of_suborders: Number(r.number_of_suborders),
      gross_sales: Number(r.gross_sales),
      delivery_fees: Number(r.delivery_fees),
      platform_commission: Number(r.platform_commission),
    }));
  },

  async getTopRiders(fromDate: string, toDate: string): Promise<TopRiderRow[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("from_date", sql.Date, fromDate)
      .input("to_date", sql.Date, toDate)
      .query("SELECT * FROM dbo.TopRiders(@from_date, @to_date)");
    return res.recordset;
  },

  async getRiderPerformanceSummary(): Promise<RiderPerformanceRow[]> {
    const pool = await getPool();
    const res = await pool.request().query("SELECT * FROM dbo.RiderPerformanceSummary");
    return res.recordset.map((r) => ({
      ...r,
      avg_rating: r.avg_rating !== null ? Number(r.avg_rating) : null,
    }));
  },

  async getTopSellingProducts(): Promise<TopSellingProductRow[]> {
    const pool = await getPool();
    const res = await pool.request().query("SELECT * FROM dbo.TopSellingProducts");
    return res.recordset.map((r) => ({
      ...r,
      units_sold: Number(r.units_sold),
      total_revenue: Number(r.total_revenue),
    }));
  },

  async getBusinessRatingsSummary(): Promise<BusinessRatingRow[]> {
    const pool = await getPool();
    const res = await pool.request().query("SELECT * FROM dbo.BusinessRatingsSummary");
    return res.recordset.map((r) => ({
      ...r,
      avg_rating: r.avg_rating !== null ? Number(r.avg_rating) : null,
      ratings_count: Number(r.ratings_count),
    }));
  },

  // ---------------- Partner ----------------
  async getMyBusiness(partnerId: number): Promise<PartnerBusiness | null> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("partner_id", sql.Int, partnerId)
      .query("SELECT * FROM dbo.h_MyBusiness(@partner_id)");
    const r = res.recordset[0];
    if (!r) return null;
    return {
      ...r,
      opening_hour: fmtTime(r.opening_hour),
      closing_hour: fmtTime(r.closing_hour),
    };
  },

  async getBusinessPhones(businessId: number): Promise<string[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("business_id", sql.Int, businessId)
      .query("SELECT phone FROM dbo.h_BusinessPhones(@business_id)");
    return res.recordset.map((r) => r.phone);
  },

  async registerBusiness(
    partnerId: number,
    input: {
      name: string;
      description?: string | null;
      link_website?: string | null;
      zone_id: number;
      opening_hour: string;
      closing_hour: string;
      expected_delivery_time: number;
      phone?: string | null;
      business_type: BusinessType;
      cuisine_type?: string | null;
      food_category?: string | null;
      pharmacy_type?: string | null;
    }
  ): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("partner_id", sql.Int, partnerId)
      .input("name", sql.VarChar(100), input.name)
      .input("description", sql.VarChar(255), input.description || null)
      .input("link_website", sql.VarChar(255), input.link_website || null)
      .input("zone_id", sql.Int, input.zone_id)
      .input("opening_hour", sql.VarChar(8), input.opening_hour)
      .input("closing_hour", sql.VarChar(8), input.closing_hour)
      .input("expected_delivery_time", sql.Int, input.expected_delivery_time)
      .input("phone", sql.Char(11), input.phone || null)
      .input("business_type", sql.VarChar(20), input.business_type)
      .input("cuisine_type", sql.VarChar(50), input.cuisine_type || null)
      .input("food_category", sql.VarChar(50), input.food_category || null)
      .input("pharmacy_type", sql.VarChar(50), input.pharmacy_type || null)
      .execute("Register_Business");
    return res.returnValue;
  },

  async updateBusinessInfo(
    businessId: number,
    input: { opening_hour?: string | null; closing_hour?: string | null; phone?: string | null; link_website?: string | null }
  ): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("business_id", sql.Int, businessId)
      .input("opening_hour", sql.VarChar(8), input.opening_hour || null)
      .input("closing_hour", sql.VarChar(8), input.closing_hour || null)
      .input("phone", sql.Char(11), input.phone || null)
      .input("link_website", sql.VarChar(255), input.link_website || null)
      .execute("Update_Business_Info");
    return res.returnValue;
  },

  async getMyProducts(partnerId: number): Promise<PartnerProduct[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("partner_id", sql.Int, partnerId)
      .query("SELECT * FROM dbo.h_MyProducts(@partner_id)");
    return res.recordset.map((r) => ({
      ...r,
      price: Number(r.price),
      discount_amount: Number(r.discount_amount),
      final_price: Number(r.final_price),
      is_available: Boolean(r.is_available),
    }));
  },

  async upsertProduct(
    businessId: number,
    input: {
      product_id?: number | null;
      name: string;
      description?: string | null;
      category: string;
      price: number;
      is_available: boolean;
    }
  ): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("business_id", sql.Int, businessId)
      .input("product_id", sql.Int, input.product_id ?? null)
      .input("name", sql.VarChar(100), input.name)
      .input("description", sql.VarChar(255), input.description || null)
      .input("category", sql.VarChar(50), input.category)
      .input("price", sql.Decimal(10, 2), input.price)
      .input("is_available", sql.Bit, input.is_available ? 1 : 0)
      .execute("Upsert_Product");
    return res.returnValue;
  },

  async toggleProductStatus(productId: number, isAvailable: boolean): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("product_id", sql.Int, productId)
      .input("is_available", sql.Bit, isAvailable ? 1 : 0)
      .execute("Toggle_Product_Status");
    return res.returnValue;
  },

  async setProductPromotion(productId: number, discountAmount: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("product_id", sql.Int, productId)
      .input("discount_amount", sql.Decimal(10, 2), discountAmount)
      .execute("Set_Product_Promotion");
    return res.returnValue;
  },

  async getBusinessSalesReport(businessId: number, fromDate: string, toDate: string): Promise<BusinessSalesRow[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("business_id", sql.Int, businessId)
      .input("from_date", sql.Date, fromDate)
      .input("to_date", sql.Date, toDate)
      .query("SELECT * FROM dbo.BusinessSalesReport(@business_id, @from_date, @to_date)");
    return res.recordset.map((r) => ({
      ...r,
      units_sold: Number(r.units_sold),
      revenue_per_product: Number(r.revenue_per_product),
    }));
  },

  async getBusinessFeedbackOverview(businessId: number): Promise<BusinessFeedbackOverview> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("business_id", sql.Int, businessId)
      .query("SELECT * FROM dbo.BusinessFeedbackOverview(@business_id)");
    const r = res.recordset[0];
    return {
      avg_rating: r?.avg_rating !== null && r?.avg_rating !== undefined ? Number(r.avg_rating) : null,
      number_of_feedbacks: Number(r?.number_of_feedbacks ?? 0),
      five_star: Number(r?.five_star ?? 0),
      four_star: Number(r?.four_star ?? 0),
      three_star: Number(r?.three_star ?? 0),
      two_star: Number(r?.two_star ?? 0),
      one_star: Number(r?.one_star ?? 0),
    };
  },

  // ---------------- Rider ----------------
  async getRiderProfile(riderId: number): Promise<RiderProfile | null> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("rider_id", sql.Int, riderId)
      .query("SELECT * FROM dbo.h_RiderProfile(@rider_id)");
    const r = res.recordset[0];
    if (!r) return null;
    return { ...r, is_available: Boolean(r.is_available) };
  },

  async setRiderAvailability(riderId: number, isAvailable: boolean): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("rider_id", sql.Int, riderId)
      .input("is_available", sql.Bit, isAvailable ? 1 : 0)
      .execute("Set_Rider_Availability");
    return res.returnValue;
  },

  async getMyActiveDeliveries(riderId: number): Promise<ActiveDelivery[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("rider_id", sql.Int, riderId)
      .query("SELECT * FROM dbo.My_Active_Deliveries(@rider_id)");
    return res.recordset.map((r) => ({
      ...r,
      assigned_at: fmtDateTime(r.assigned_at),
    }));
  },

  async markPickedUp(deliveryId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("delivery_id", sql.Int, deliveryId)
      .execute("Mark_Picked_Up");
    return res.returnValue;
  },

  async markDelivered(deliveryId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("delivery_id", sql.Int, deliveryId)
      .execute("Mark_Delivered");
    return res.returnValue;
  },

  async getMyEarnings(riderId: number, fromDate: string, toDate: string): Promise<RiderEarnings> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("rider_id", sql.Int, riderId)
      .input("from_date", sql.Date, fromDate)
      .input("to_date", sql.Date, toDate)
      .query("SELECT * FROM dbo.My_Earnings(@rider_id, @from_date, @to_date)");
    const r = res.recordset[0];
    return {
      completed_deliveries: Number(r?.completed_deliveries ?? 0),
      total_delivery_fees: Number(r?.total_delivery_fees ?? 0),
      total_earnings: Number(r?.total_earnings ?? 0),
    };
  },

  async getMyRatingSummary(riderId: number): Promise<RiderRatingSummary> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("rider_id", sql.Int, riderId)
      .query("SELECT * FROM dbo.My_Rating_Summary(@rider_id)");
    const r = res.recordset[0];
    return {
      avg_rating: r?.avg_rating !== null && r?.avg_rating !== undefined ? Number(r.avg_rating) : null,
      ratings_count: Number(r?.ratings_count ?? 0),
      five_star: Number(r?.five_star ?? 0),
      four_star: Number(r?.four_star ?? 0),
      three_star: Number(r?.three_star ?? 0),
      two_star: Number(r?.two_star ?? 0),
      one_star: Number(r?.one_star ?? 0),
    };
  },

  async getMyDeliveryHistory(riderId: number, fromDate: string, toDate: string): Promise<RiderDeliveryHistoryRow[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("rider_id", sql.Int, riderId)
      .input("from_date", sql.Date, fromDate)
      .input("to_date", sql.Date, toDate)
      .query("SELECT * FROM dbo.My_Delivery_History(@rider_id, @from_date, @to_date)");
    return res.recordset.map((r) => ({
      ...r,
      assigned_at: fmtDateTime(r.assigned_at),
      picked_up_at: r.picked_up_at ? fmtDateTime(r.picked_up_at) : null,
      delivered_at: r.delivered_at ? fmtDateTime(r.delivered_at) : null,
      tracking_time: r.tracking_time !== null ? Number(r.tracking_time) : null,
    }));
  },

  // ---------------- Customer ----------------
  async getCustomerProfile(customerId: number): Promise<CustomerProfile | null> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .query("SELECT * FROM dbo.h_CustomerProfile(@customer_id)");
    const r = res.recordset[0];
    if (!r) return null;
    return { ...r, wallet_balance: Number(r.wallet_balance) };
  },

  async getMyAddresses(customerId: number): Promise<CustomerAddress[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .query("SELECT * FROM dbo.h_MyAddresses(@customer_id)");
    return res.recordset.map((r) => ({ ...r, is_active: Boolean(r.is_active) }));
  },

  async addCustomerAddress(customerId: number, description: string, zoneId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .input("description", sql.VarChar(150), description)
      .input("zone_id", sql.Int, zoneId)
      .execute("Add_Customer_Address");
    return res.returnValue;
  },

  async updateOrDeleteCustomerAddress(
    customerId: number,
    addressId: number,
    description: string,
    zoneId: number,
    action: "Update" | "Delete" | "Remove"
  ): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .input("address_id", sql.Int, addressId)
      .input("description", sql.VarChar(150), description)
      .input("zone_id", sql.Int, zoneId)
      .input("action", sql.VarChar(20), action)
      .execute("Update_Delete_Customer_Address");
    return res.returnValue;
  },

  async changeActiveAddress(customerId: number, newAddressId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .input("new_address_id", sql.Int, newAddressId)
      .execute("Change_Active_Address");
    return res.returnValue;
  },

  async getMyCards(customerId: number): Promise<CustomerCard[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .query("SELECT * FROM dbo.h_MyCards(@customer_id)");
    return res.recordset.map((r) => ({
      ...r,
      expiration_date: fmtDate(r.expiration_date),
    }));
  },

  async addCard(
    customerId: number,
    cardNo: string,
    cardHolderName: string,
    expirationDate: string
  ): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .input("card_no", sql.Char(16), cardNo)
      .input("card_holder_name", sql.VarChar(100), cardHolderName)
      .input("expiration_date", sql.Date, expirationDate)
      .execute("Add_Card");
    return res.returnValue;
  },

  async getMyActiveCartId(customerId: number): Promise<number | null> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .query("SELECT dbo.h_MyActiveCart(@customer_id) AS cart_id");
    return res.recordset[0]?.cart_id ?? null;
  },

  async getCartItems(cartId: number): Promise<CartItemRow[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("cart_id", sql.Int, cartId)
      .query("SELECT * FROM dbo.h_CartItems(@cart_id)");
    return res.recordset.map((r) => ({
      ...r,
      unit_price: Number(r.unit_price),
      line_total: Number(r.line_total),
      is_available: Boolean(r.is_available),
    }));
  },

  async getMyVouchers(customerId: number): Promise<CustomerVoucher[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .query("SELECT * FROM dbo.h_MyVouchers(@customer_id)");
    return res.recordset.map((r) => ({
      ...r,
      is_percentage: Boolean(r.is_percentage),
      amount: Number(r.amount),
      expiry_date: fmtDate(r.expiry_date),
    }));
  },

  async createCart(customerId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool.request().input("customer_id", sql.Int, customerId).execute("Create_Cart");
    return res.returnValue;
  },

  async addToCart(cartId: number, productId: number, quantity: number, notes: string | null): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("cart_id", sql.Int, cartId)
      .input("product_id", sql.Int, productId)
      .input("quantity", sql.Int, quantity)
      .input("notes", sql.VarChar(255), notes || null)
      .execute("Add_To_Cart");
    return res.returnValue;
  },

  async removeFromCart(cartId: number, productId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("cart_id", sql.Int, cartId)
      .input("product_id", sql.Int, productId)
      .execute("Remove_From_Cart");
    return res.returnValue;
  },

  async calculateVoucherDiscount(voucherId: number | null, orderSubtotal: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("voucher_id", sql.Int, voucherId)
      .input("order_subtotal", sql.Decimal(10, 2), orderSubtotal)
      .query("SELECT dbo.Calculate_Voucher_Discount(@voucher_id, @order_subtotal) AS discount");
    return Number(res.recordset[0]?.discount ?? 0);
  },

  async checkoutCart(
    cartId: number,
    voucherId: number | null,
    paymentMethod: PaymentMethod,
    cardId: number | null
  ): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("cart_id", sql.Int, cartId)
      .input("voucher_id", sql.Int, voucherId)
      .input("payment_method", sql.VarChar(20), paymentMethod)
      .input("card_id", sql.Int, cardId)
      .execute("Checkout_Cart");
    return res.returnValue;
  },

  async searchPlatform(customerId: number, keyword: string): Promise<BrowseBusinessItem[]> {
    const pool = await getPool();
    const [searchRes, ratings] = await Promise.all([
      pool
        .request()
        .input("customer_id", sql.Int, customerId)
        .input("keyword", sql.VarChar(100), keyword)
        .query("SELECT * FROM dbo.Search_Platform(@customer_id, @keyword)"),
      this.getBusinessRatingsSummary(),
    ]);
    return searchRes.recordset.map((r) => {
      const rt = ratings.find((x) => x.business_id === r.business_id);
      return {
        business_id: r.business_id,
        business_name: r.business_name,
        same_zone: true,
        avg_rating: rt?.avg_rating ?? null,
        ratings_count: rt?.ratings_count ?? 0,
        priority: r.priority,
      };
    });
  },

  async nearbyBusinessesByCategory(addressId: number, category: string): Promise<BrowseBusinessItem[]> {
    const pool = await getPool();
    const [res, ratings] = await Promise.all([
      pool
        .request()
        .input("address_id", sql.Int, addressId)
        .input("product_category", sql.VarChar(50), category)
        .query("SELECT * FROM dbo.Nearby_Businesses_By_Category(@address_id, @product_category)"),
      this.getBusinessRatingsSummary(),
    ]);
    return res.recordset.map((r) => {
      const rt = ratings.find((x) => x.business_id === r.business_id);
      return {
        business_id: r.business_id,
        business_name: r.business_name,
        zone_name: r.zone_name,
        same_zone: Boolean(r.same_zone),
        zone_avg_delivery_time: r.zone_avg_delivery_time !== null ? Number(r.zone_avg_delivery_time) : null,
        avg_rating: rt?.avg_rating ?? null,
        ratings_count: rt?.ratings_count ?? 0,
      };
    });
  },

  async browseActiveBusinesses(customerId: number): Promise<BrowseBusinessItem[]> {
    const pool = await getPool();
    const [profile, allRes, ratings] = await Promise.all([
      this.getCustomerProfile(customerId),
      pool.request().query("SELECT * FROM dbo.allBusinessProfiles WHERE status = 'Active'"),
      this.getBusinessRatingsSummary(),
    ]);
    return allRes.recordset.map((r) => {
      const rt = ratings.find((x) => x.business_id === r.business_id);
      return {
        business_id: r.business_id,
        business_name: r.business_name,
        business_type: r.business_type,
        zone_name: r.zone_name,
        same_zone: profile?.active_zone ? r.zone_name === profile.active_zone : false,
        avg_rating: rt?.avg_rating ?? null,
        ratings_count: rt?.ratings_count ?? 0,
      };
    });
  },

  async getProductCategories(): Promise<string[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .query("SELECT DISTINCT category FROM dbo.Product WHERE is_available = 1 ORDER BY category");
    return res.recordset.map((r) => r.category);
  },

  async getBusinessDetails(businessId: number): Promise<BusinessDetails | null> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("business_id", sql.Int, businessId)
      .query("SELECT * FROM dbo.h_BusinessDetails(@business_id)");
    const r = res.recordset[0];
    if (!r) return null;
    return {
      ...r,
      opening_hour: fmtTime(r.opening_hour),
      closing_hour: fmtTime(r.closing_hour),
      is_open_now: Boolean(r.is_open_now),
      avg_rating: r.avg_rating !== null ? Number(r.avg_rating) : null,
      number_of_ratings: Number(r.number_of_ratings),
    };
  },

  async getBusinessProducts(businessId: number): Promise<PublicProduct[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("business_id", sql.Int, businessId)
      .query("SELECT * FROM dbo.h_BusinessProducts(@business_id)");
    return res.recordset.map((r) => ({
      ...r,
      price: Number(r.price),
      discount_amount: Number(r.discount_amount),
      final_price: Number(r.final_price),
    }));
  },

  async toggleFavorite(customerId: number, itemId: number, itemType: "Business" | "Product"): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .input("item_id", sql.Int, itemId)
      .input("item_type", sql.VarChar(20), itemType)
      .execute("Toggle_Favorite");
    return res.returnValue;
  },

  async getFavoriteIds(customerId: number): Promise<{ businessIds: number[]; productIds: number[] }> {
    const pool = await getPool();
    const [bRes, pRes] = await Promise.all([
      pool
        .request()
        .input("customer_id", sql.Int, customerId)
        .query("SELECT business_id FROM dbo.Favorite_Business WHERE customer_id = @customer_id"),
      pool
        .request()
        .input("customer_id", sql.Int, customerId)
        .query("SELECT product_id FROM dbo.Favorite_Product WHERE customer_id = @customer_id"),
    ]);
    return {
      businessIds: bRes.recordset.map((r) => r.business_id),
      productIds: pRes.recordset.map((r) => r.product_id),
    };
  },

  async getMyFavorites(customerId: number): Promise<FavoriteProductRow[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .query("SELECT * FROM dbo.My_Favorites(@customer_id)");
    return res.recordset.map((r) => ({ ...r, is_orderable: Boolean(r.is_orderable) }));
  },

  async getRecommendedProducts(customerId: number): Promise<RecommendedProductRow[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .query("SELECT * FROM dbo.Recommended_Products(@customer_id)");
    return res.recordset.map((r) => ({ ...r, final_price: Number(r.final_price) }));
  },

  async getMyOrderHistory(customerId: number): Promise<CustomerOrderRow[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("customer_id", sql.Int, customerId)
      .query("SELECT * FROM dbo.My_Order_History(@customer_id) ORDER BY order_id DESC");
    return res.recordset.map((r) => ({
      ...r,
      order_date: fmtDateTime(r.order_date),
      discount_amount: Number(r.discount_amount),
      total_amount: Number(r.total_amount),
      refunded_amount: Number(r.refunded_amount),
    }));
  },

  async getOrderSubOrders(orderId: number): Promise<OrderSubOrderRow[]> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("order_id", sql.Int, orderId)
      .query("SELECT * FROM dbo.h_OrderSubOrders(@order_id)");
    return res.recordset.map((r) => ({
      ...r,
      total_price: Number(r.total_price),
      delivery_fee: Number(r.delivery_fee),
      assigned_at: r.assigned_at ? fmtDateTime(r.assigned_at) : null,
      picked_up_at: r.picked_up_at ? fmtDateTime(r.picked_up_at) : null,
      delivered_at: r.delivered_at ? fmtDateTime(r.delivered_at) : null,
      has_feedback: Boolean(r.has_feedback),
    }));
  },

  async cancelOrder(orderId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool.request().input("order_id", sql.Int, orderId).execute("Cancel_Order");
    return res.returnValue;
  },

  async reorder(orderId: number, addressId: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("order_id", sql.Int, orderId)
      .input("address_id", sql.Int, addressId)
      .execute("Reorder");
    return res.returnValue;
  },

  async submitFeedback(
    suborderId: number,
    headline: string,
    description: string | null,
    rating: number
  ): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("suborder_id", sql.Int, suborderId)
      .input("headline", sql.VarChar(100), headline)
      .input("description", sql.VarChar(500), description || null)
      .input("rating", sql.Int, rating)
      .execute("Submit_Feedback");
    return res.returnValue;
  },

  async rateRider(suborderId: number, riderRating: number): Promise<number> {
    const pool = await getPool();
    const res = await pool
      .request()
      .input("suborder_id", sql.Int, suborderId)
      .input("rider_rating", sql.Int, riderRating)
      .execute("Rate_Rider");
    return res.returnValue;
  },
};
