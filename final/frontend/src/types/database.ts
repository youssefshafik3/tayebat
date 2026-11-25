/**
 * TypeScript Data Models for Tayebat
 * ---------------------------------------------------------------------------
 * Every interface in this file mirrors the exact column names and types
 * returned by the SQL Server tables, views, and functions defined in
 * `final/MS3_Database_Solution.sql`.
 *
 * Beginner Note:
 * In TypeScript, an `interface` describes the shape of an object (its property
 * names and value types). Using interfaces ensures our frontend components and
 * API routes always agree on the exact field names from the database.
 */

export type UserRole = "Admin" | "Partner" | "Rider" | "Customer";

export type AdminRole = "Super Admin" | "Zone Admin";

export type BusinessStatus = "Pending" | "Active" | "Suspended" | "Rejected";

export type BusinessType = "Restaurant" | "Pharmacy";

export type PaymentMethod = "Cash" | "Card" | "Wallet";

export type OrderStatus = "Placed" | "In Progress" | "Delivered" | "Cancelled";

export type SubOrderStatus = "Placed" | "Assigned" | "Picked Up" | "Delivered" | "Cancelled";

/** Standard Milestone 2 stored procedure return codes (Table 3.1). */
export type ReturnCode = 0 | -1 | -2 | -3 | -4 | -5 | -6 | -7 | -8 | -9;

/** Signed-in session stored securely in an HTTP-only cookie on the server. */
export interface SessionUser {
  userId: number;
  username: string;
  role: UserRole;
  displayName?: string;
  adminRole?: AdminRole;
  zoneId?: number | null;
  zoneName?: string | null;
}

/** h_ZoneList view */
export interface Zone {
  zone_id: number;
  zone_name: string;
  delivery_fee: number;
}

/** h_AdminProfile(admin_id) */
export interface AdminProfile {
  admin_id: number;
  admin_name: string;
  role: AdminRole;
  zone_id: number | null;
  zone_name: string | null;
}

/** h_AdminList view */
export interface AdminListItem {
  admin_id: number;
  admin_name: string;
  username: string;
  role: AdminRole;
  zone_name: string | null;
}

/** h_CustomerList view */
export interface CustomerListItem {
  customer_id: number;
  customer_name: string;
  username: string;
  email: string;
  account_status: "Active" | "Blacklisted";
  active_zone: string | null;
}

/** h_BlacklistedCustomers view */
export interface BlacklistedCustomer {
  customer_id: number;
  customer_name: string;
  reason: string;
  admin_id: number;
  blacklisted_by: string;
}

/** allBusinessProfiles view */
export interface BusinessProfile {
  business_id: number;
  business_name: string;
  business_type: BusinessType;
  zone_name: string;
  partner_name: string;
  status: BusinessStatus;
  opening_hour: string;
  closing_hour: string;
}

/** PendingBusinessApprovals view */
export interface PendingBusinessApproval {
  business_id: number;
  business_name: string;
  business_type: BusinessType;
  zone_name: string;
  partner_name: string;
}

/** h_SuspendedBusinesses view */
export interface SuspendedBusiness {
  business_id: number;
  business_name: string;
  zone_name: string;
  suspension_reason: string | null;
}

/** ActiveVouchers view */
export interface ActiveVoucher {
  voucher_id: number;
  promo_code: string;
  customer_id: number;
  customer_name?: string;
  is_percentage: boolean;
  amount: number;
  expiry_date: string;
}

/** Platform_Health_Snapshot() */
export interface PlatformHealthSnapshot {
  active_businesses: number;
  available_riders: number;
  orders_today: number;
  avg_delivery_time_today: number | null;
  low_ratings_today: number;
}

/** Reconcile_Order_Totals() */
export interface OrderReconciliationIssue {
  order_id: number;
  expected_total: number;
  order_total: number;
  payment_amount: number | null;
}

/** BusinessesPerZone view */
export interface BusinessesPerZoneRow {
  zone_id: number;
  zone_name: string;
  business_count: number;
}

/** ZoneDeliveryPerformance view */
export interface ZoneDeliveryPerformanceRow {
  zone_id: number;
  zone_name: string;
  delivery_count: number;
  avg_tracking_time: number | null;
}

/** ZoneOrderReport(zone_id, from_date, to_date) */
export interface ZoneOrderReportRow {
  zone_id: number;
  zone_name: string;
  number_of_orders: number;
  avg_order_total: number | null;
  platform_commission: number;
}

/** Daily_Revenue_Report(report_date) */
export interface DailyRevenueRow {
  zone_name: string;
  business_type: BusinessType;
  number_of_suborders: number;
  gross_sales: number;
  delivery_fees: number;
  platform_commission: number;
}

/** TopRiders(from_date, to_date) */
export interface TopRiderRow {
  rider_rank: number;
  rider_id: number;
  rider_name: string;
  completed_delivery_count: number;
}

/** RiderPerformanceSummary view */
export interface RiderPerformanceRow {
  rider_id: number;
  rider_name: string;
  zone_name: string;
  completed_deliveries: number;
  avg_rating: number | null;
}

/** TopSellingProducts view */
export interface TopSellingProductRow {
  product_id: number;
  product_name: string;
  business_name: string;
  business_type: BusinessType;
  units_sold: number;
  total_revenue: number;
}

/** BusinessRatingsSummary view */
export interface BusinessRatingRow {
  business_id: number;
  business_name: string;
  avg_rating: number | null;
  ratings_count: number;
}

/** h_MyBusiness(partner_id) */
export interface PartnerBusiness {
  business_id: number;
  business_name: string;
  description: string | null;
  link_website: string | null;
  business_type: BusinessType;
  cuisine_type: string | null;
  food_category: string | null;
  pharmacy_type: string | null;
  zone_id: number;
  zone_name: string;
  opening_hour: string;
  closing_hour: string;
  expected_delivery_time: number;
  status: BusinessStatus;
  suspension_reason: string | null;
}

/** h_MyProducts(partner_id) */
export interface PartnerProduct {
  product_id: number;
  product_name: string;
  description: string | null;
  category: string;
  price: number;
  discount_amount: number;
  final_price: number;
  is_available: boolean;
}

/** BusinessSalesReport(business_id, from_date, to_date) */
export interface BusinessSalesRow {
  product_id: number;
  product_name: string;
  units_sold: number;
  revenue_per_product: number;
}

/** BusinessFeedbackOverview(business_id) */
export interface BusinessFeedbackOverview {
  avg_rating: number | null;
  number_of_feedbacks: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

/** h_RiderProfile(rider_id) */
export interface RiderProfile {
  rider_id: number;
  rider_name: string;
  zone_name: string;
  vehicle_type: string;
  plate_no: string;
  is_available: boolean;
  account_status: string;
}

/** My_Active_Deliveries(rider_id) */
export interface ActiveDelivery {
  delivery_id: number;
  order_id: number;
  suborder_id: number;
  business_name: string;
  customer_name: string;
  address_description: string;
  zone_name: string;
  status: "Assigned" | "Picked Up";
  assigned_at: string;
}

/** My_Earnings(rider_id, from_date, to_date) */
export interface RiderEarnings {
  completed_deliveries: number;
  total_delivery_fees: number;
  total_earnings: number;
}

/** My_Rating_Summary(rider_id) */
export interface RiderRatingSummary {
  avg_rating: number | null;
  ratings_count: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

/** My_Delivery_History(rider_id, from_date, to_date) */
export interface RiderDeliveryHistoryRow {
  delivery_id: number;
  order_id: number;
  business_name: string;
  status: "Delivered" | "Cancelled";
  assigned_at: string;
  picked_up_at: string | null;
  delivered_at: string | null;
  tracking_time: number | null;
}

/** h_CustomerProfile(customer_id) */
export interface CustomerProfile {
  customer_id: number;
  customer_name: string;
  account_status: "Active" | "Blacklisted";
  wallet_balance: number;
  active_address_id: number | null;
  active_address: string | null;
  active_zone_id: number | null;
  active_zone: string | null;
}

/** h_MyAddresses(customer_id) */
export interface CustomerAddress {
  address_id: number;
  description: string;
  zone_id: number;
  zone_name: string;
  is_active: boolean;
}

/** h_MyCards(customer_id) — only last 4 digits are ever exposed! */
export interface CustomerCard {
  card_id: number;
  card_holder_name: string;
  last_four_digits: string;
  expiration_date: string;
}

/** h_CartItems(cart_id) */
export interface CartItemRow {
  product_id: number;
  product_name: string;
  business_id: number;
  business_name: string;
  quantity: number;
  notes: string | null;
  unit_price: number;
  line_total: number;
  is_available: boolean;
}

/** h_MyVouchers(customer_id) */
export interface CustomerVoucher {
  voucher_id: number;
  promo_code: string;
  is_percentage: boolean;
  amount: number;
  expiry_date: string;
}

/** h_BusinessDetails(business_id) */
export interface BusinessDetails {
  business_id: number;
  business_name: string;
  description: string | null;
  link_website: string | null;
  zone_name: string;
  zone_id?: number;
  opening_hour: string;
  closing_hour: string;
  is_open_now: boolean;
  expected_delivery_time: number;
  status: BusinessStatus;
  avg_rating: number | null;
  number_of_ratings: number;
}

/** h_BusinessProducts(business_id) */
export interface PublicProduct {
  product_id: number;
  product_name: string;
  description: string | null;
  category: string;
  price: number;
  discount_amount: number;
  final_price: number;
}

/** Search_Platform / Nearby_Businesses_By_Category combined browse item */
export interface BrowseBusinessItem {
  business_id: number;
  business_name: string;
  business_type?: BusinessType;
  zone_name?: string;
  same_zone?: boolean;
  zone_avg_delivery_time?: number | null;
  avg_rating?: number | null;
  ratings_count?: number;
  is_open_now?: boolean;
  expected_delivery_time?: number;
  priority?: number;
}

/** My_Favorites(customer_id) */
export interface FavoriteProductRow {
  product_id: number;
  product_name: string;
  business_name: string;
  business_id?: number;
  is_orderable: boolean;
}

/** Recommended_Products(customer_id) */
export interface RecommendedProductRow {
  product_id: number;
  product_name: string;
  business_name: string;
  business_id?: number;
  category: string;
  final_price: number;
}

/** My_Order_History(customer_id) */
export interface CustomerOrderRow {
  order_id: number;
  order_date: string;
  zone_name: string;
  status: OrderStatus;
  number_of_suborders: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod | null;
  refunded_amount: number;
}

/** h_OrderSubOrders(order_id) */
export interface OrderSubOrderRow {
  suborder_id: number;
  business_id: number;
  business_name: string;
  status: SubOrderStatus;
  total_price: number;
  delivery_fee: number;
  delivery_id: number | null;
  rider_name: string | null;
  assigned_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  expected_delivery_time: number;
  has_feedback: boolean;
  rider_rating: number | null;
}

/** Standard JSON envelope returned by all `/api/...` routes */
export interface ApiResponse<T = unknown> {
  ok: boolean;
  code: number;
  message: string;
  data?: T;
  dbMode?: "mock" | "mssql";
}
