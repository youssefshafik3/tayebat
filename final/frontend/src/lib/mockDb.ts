/**
 * In-Memory Demo Database (Seeded from `final/seed_data.sql`)
 * ---------------------------------------------------------------------------
 * Why this exists:
 * Next.js is a frontend + server-API framework, NOT a replacement for SQL Server.
 * When SQL Server is not yet running on your Mac (DB_MODE=mock), this module
 * lets you explore and test every screen immediately using the exact seed
 * records and procedure logic from `final/MS3_Database_Solution.sql` and
 * `final/seed_data.sql`.
 *
 * When you connect SQL Server (DB_MODE=mssql), `src/lib/mssqlDb.ts` is used
 * instead, and every action directly calls the SQL Server procedures, views,
 * and functions without duplicating business logic.
 */

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
  BusinessStatus,
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
  OrderStatus,
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
  SubOrderStatus,
  SuspendedBusiness,
  TopRiderRow,
  TopSellingProductRow,
  UserRole,
  Zone,
  ZoneDeliveryPerformanceRow,
  ZoneOrderReportRow,
} from "@/types/database";

interface DbUser {
  user_id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  username: string;
  password: string;
  email: string;
  dob: string | null;
  account_status: "Active" | "Blacklisted";
}

interface DbAdmin {
  admin_id: number;
  role: AdminRole;
  zone_id: number | null;
}

interface DbRider {
  rider_id: number;
  vehicle_type: string;
  plate_no: string;
  license_no: string;
  is_available: boolean;
  zone_id: number;
}

interface DbCustomer {
  customer_id: number;
  wallet_balance: number;
}

interface DbAddress {
  address_id: number;
  description: string;
  is_active: boolean;
  customer_id: number;
  zone_id: number;
}

interface DbCard {
  card_id: number;
  card_no: string;
  card_holder_name: string;
  expiration_date: string;
  customer_id: number;
}

interface DbBusiness {
  business_id: number;
  name: string;
  description: string | null;
  link_website: string | null;
  opening_hour: string;
  closing_hour: string;
  expected_delivery_time: number;
  status: BusinessStatus;
  suspension_reason: string | null;
  partner_id: number;
  zone_id: number;
  business_type: BusinessType;
  cuisine_type: string | null;
  food_category: string | null;
  pharmacy_type: string | null;
}

interface DbProduct {
  product_id: number;
  name: string;
  description: string | null;
  category: string;
  price: number;
  discount_amount: number;
  is_available: boolean;
  business_id: number;
}

interface DbVoucher {
  voucher_id: number;
  promo_code: string;
  is_percentage: boolean;
  amount: number;
  expiry_date: string;
  status: "Unused" | "Used";
  customer_id: number;
}

interface DbCart {
  cart_id: number;
  status: "Active" | "Checked Out";
  created_at: string;
  customer_id: number;
  address_id: number;
}

interface DbCartItem {
  cart_id: number;
  product_id: number;
  quantity: number;
  notes: string | null;
  unit_price: number | null;
}

interface DbOrder {
  order_id: number;
  order_date: string;
  status: OrderStatus;
  discount_amount: number;
  total_amount: number;
  cart_id: number;
  zone_id: number;
  voucher_id: number | null;
}

interface DbSubOrder {
  suborder_id: number;
  status: SubOrderStatus;
  total_price: number;
  delivery_fee: number;
  order_id: number;
  business_id: number;
}

interface DbDelivery {
  delivery_id: number;
  assigned_at: string;
  picked_up_at: string | null;
  delivered_at: string | null;
  tracking_time: number | null;
  rider_rating: number | null;
  suborder_id: number;
  rider_id: number;
}

interface DbPayment {
  payment_id: number;
  amount: number;
  currency: string;
  method: PaymentMethod;
  transaction_date: string;
  refunded_amount: number;
  order_id: number;
  card_id: number | null;
}

interface DbFeedback {
  feedback_id: number;
  headline: string;
  description: string | null;
  rating: number;
  feedback_date: string;
  suborder_id: number;
}

interface MockStore {
  zones: Zone[];
  users: DbUser[];
  userPhones: { user_id: number; phone: string }[];
  admins: DbAdmin[];
  partners: number[];
  riders: DbRider[];
  customers: DbCustomer[];
  addresses: DbAddress[];
  cards: DbCard[];
  businesses: DbBusiness[];
  businessPhones: { business_id: number; phone: string }[];
  blacklist: { customer_id: number; admin_id: number; reason: string }[];
  products: DbProduct[];
  favoriteBusinesses: { customer_id: number; business_id: number }[];
  favoriteProducts: { customer_id: number; product_id: number }[];
  vouchers: DbVoucher[];
  carts: DbCart[];
  cartItems: DbCartItem[];
  orders: DbOrder[];
  subOrders: DbSubOrder[];
  deliveries: DbDelivery[];
  payments: DbPayment[];
  feedbacks: DbFeedback[];
}

function createSeedStore(): MockStore {
  return {
    zones: [
      { zone_id: 1, zone_name: "Maadi", delivery_fee: 20 },
      { zone_id: 2, zone_name: "Zamalek", delivery_fee: 25 },
      { zone_id: 3, zone_name: "New Cairo", delivery_fee: 30 },
      { zone_id: 4, zone_name: "Heliopolis", delivery_fee: 15 },
    ],
    users: [
      { user_id: 1, first_name: "Mona", middle_name: "Adel", last_name: "Hassan", username: "mona.hassan", password: "Pass@001", email: "mona.hassan@mail.com", dob: "1985-03-12", account_status: "Active" },
      { user_id: 2, first_name: "Karim", middle_name: null, last_name: "Adel", username: "karim.adel", password: "Pass@002", email: "karim.adel@mail.com", dob: "1990-07-01", account_status: "Active" },
      { user_id: 3, first_name: "Hana", middle_name: null, last_name: "Samir", username: "hana.samir", password: "Pass@003", email: "hana.samir@mail.com", dob: "1992-11-23", account_status: "Active" },
      { user_id: 4, first_name: "Tarek", middle_name: "Ali", last_name: "Fouad", username: "tarek.fouad", password: "Pass@004", email: "tarek.fouad@mail.com", dob: "1980-01-15", account_status: "Active" },
      { user_id: 5, first_name: "Laura", middle_name: null, last_name: "Bianchi", username: "laura.bianchi", password: "Pass@005", email: "laura.bianchi@mail.com", dob: "1983-04-30", account_status: "Active" },
      { user_id: 6, first_name: "Seif", middle_name: null, last_name: "Mahmoud", username: "seif.mahmoud", password: "Pass@006", email: "seif.mahmoud@mail.com", dob: "1979-09-09", account_status: "Active" },
      { user_id: 7, first_name: "Kenji", middle_name: null, last_name: "Sato", username: "kenji.sato", password: "Pass@007", email: "kenji.sato@mail.com", dob: "1987-02-14", account_status: "Active" },
      { user_id: 8, first_name: "Dina", middle_name: null, last_name: "Fathy", username: "dina.fathy", password: "Pass@008", email: "dina.fathy@mail.com", dob: "1991-06-18", account_status: "Active" },
      { user_id: 9, first_name: "Rania", middle_name: null, last_name: "Ezz", username: "rania.ezz", password: "Pass@009", email: "rania.ezz@mail.com", dob: "1984-12-02", account_status: "Active" },
      { user_id: 10, first_name: "Hassan", middle_name: null, last_name: "Gaber", username: "hassan.gaber", password: "Pass@010", email: "hassan.gaber@mail.com", dob: "1978-08-25", account_status: "Active" },
      { user_id: 11, first_name: "Mai", middle_name: null, last_name: "Lotfy", username: "mai.lotfy", password: "Pass@011", email: "mai.lotfy@mail.com", dob: "1995-03-03", account_status: "Active" },
      { user_id: 12, first_name: "Ali", middle_name: null, last_name: "Ibrahim", username: "ali.ibrahim", password: "Pass@012", email: "ali.ibrahim@mail.com", dob: "1998-05-05", account_status: "Active" },
      { user_id: 13, first_name: "Mostafa", middle_name: null, last_name: "Kamal", username: "mostafa.kamal", password: "Pass@013", email: "mostafa.kamal@mail.com", dob: "1997-10-10", account_status: "Active" },
      { user_id: 14, first_name: "Yehia", middle_name: null, last_name: "Saad", username: "yehia.saad", password: "Pass@014", email: "yehia.saad@mail.com", dob: "1999-01-20", account_status: "Active" },
      { user_id: 15, first_name: "Ziad", middle_name: null, last_name: "Nabil", username: "ziad.nabil", password: "Pass@015", email: "ziad.nabil@mail.com", dob: "1996-04-04", account_status: "Active" },
      { user_id: 16, first_name: "Fady", middle_name: null, last_name: "Ramzy", username: "fady.ramzy", password: "Pass@016", email: "fady.ramzy@mail.com", dob: "1994-07-07", account_status: "Active" },
      { user_id: 17, first_name: "Ahmed", middle_name: "Samy", last_name: "Salem", username: "ahmed.salem", password: "Pass@017", email: "ahmed.salem@mail.com", dob: "2000-02-02", account_status: "Active" },
      { user_id: 18, first_name: "Sara", middle_name: null, last_name: "Mostafa", username: "sara.mostafa", password: "Pass@018", email: "sara.mostafa@mail.com", dob: "2001-08-08", account_status: "Active" },
      { user_id: 19, first_name: "Omar", middle_name: null, last_name: "Khaled", username: "omar.khaled", password: "Pass@019", email: "omar.khaled@mail.com", dob: "1999-09-19", account_status: "Active" },
      { user_id: 20, first_name: "Laila", middle_name: null, last_name: "Hany", username: "laila.hany", password: "Pass@020", email: "laila.hany@mail.com", dob: "2002-12-12", account_status: "Active" },
      { user_id: 21, first_name: "Youssef", middle_name: null, last_name: "Amin", username: "youssef.amin", password: "Pass@021", email: "youssef.amin@mail.com", dob: "1993-03-21", account_status: "Blacklisted" },
      { user_id: 22, first_name: "Nour", middle_name: null, last_name: "Tamer", username: "nour.tamer", password: "Pass@022", email: "nour.tamer@mail.com", dob: "2003-06-22", account_status: "Active" },
      { user_id: 23, first_name: "Farida", middle_name: null, last_name: "Naguib", username: "farida.naguib", password: "Pass@023", email: "farida.naguib@mail.com", dob: "2000-10-10", account_status: "Active" },
      { user_id: 24, first_name: "Nabil", middle_name: null, last_name: "Fares", username: "nabil.fares", password: "Pass@024", email: "nabil.fares@mail.com", dob: "1986-05-17", account_status: "Active" },
    ],
    userPhones: Array.from({ length: 24 }, (_, idx) => ({
      user_id: idx + 1,
      phone: `010000000${String(idx + 1).padStart(2, "0")}`,
    })).concat([{ user_id: 17, phone: "01100000017" }]),
    admins: [
      { admin_id: 1, role: "Super Admin", zone_id: null },
      { admin_id: 2, role: "Zone Admin", zone_id: 1 },
      { admin_id: 3, role: "Zone Admin", zone_id: 2 },
    ],
    partners: [4, 5, 6, 7, 8, 9, 10, 11, 24],
    riders: [
      { rider_id: 12, vehicle_type: "Motorcycle", plate_no: "MAA-1201", license_no: "LIC-1201", is_available: true, zone_id: 1 },
      { rider_id: 13, vehicle_type: "Motorcycle", plate_no: "MAA-1302", license_no: "LIC-1302", is_available: true, zone_id: 1 },
      { rider_id: 14, vehicle_type: "Bicycle", plate_no: "MAA-1403", license_no: "LIC-1403", is_available: false, zone_id: 1 },
      { rider_id: 15, vehicle_type: "Motorcycle", plate_no: "ZAM-1504", license_no: "LIC-1504", is_available: true, zone_id: 2 },
      { rider_id: 16, vehicle_type: "Car", plate_no: "NCA-1605", license_no: "LIC-1605", is_available: true, zone_id: 3 },
    ],
    customers: [
      { customer_id: 17, wallet_balance: 500 },
      { customer_id: 18, wallet_balance: 50 },
      { customer_id: 19, wallet_balance: 0 },
      { customer_id: 20, wallet_balance: 100 },
      { customer_id: 21, wallet_balance: 0 },
      { customer_id: 22, wallet_balance: 25 },
      { customer_id: 23, wallet_balance: 0 },
    ],
    addresses: [
      { address_id: 1, description: "Street 9 Building 12", is_active: true, customer_id: 17, zone_id: 1 },
      { address_id: 2, description: "Zamalek Tower Apt 3", is_active: false, customer_id: 17, zone_id: 2 },
      { address_id: 3, description: "Dokki Old Flat", is_active: false, customer_id: 17, zone_id: 2 },
      { address_id: 4, description: "Road 233 Villa 7", is_active: true, customer_id: 18, zone_id: 1 },
      { address_id: 5, description: "Zamalek Tower Apt 3", is_active: true, customer_id: 19, zone_id: 2 },
      { address_id: 6, description: "Fifth Settlement B5", is_active: true, customer_id: 20, zone_id: 3 },
      { address_id: 7, description: "Degla Street 4", is_active: true, customer_id: 21, zone_id: 1 },
      { address_id: 8, description: "Road 233 Villa 7", is_active: true, customer_id: 22, zone_id: 1 },
      { address_id: 9, description: "Old Heliopolis Flat", is_active: false, customer_id: 20, zone_id: 4 },
      { address_id: 10, description: "Maadi Corniche 5", is_active: false, customer_id: 17, zone_id: 1 },
      { address_id: 11, description: "Sarayat Street 8", is_active: true, customer_id: 23, zone_id: 1 },
      { address_id: 12, description: "Fifth Settlement B9", is_active: false, customer_id: 20, zone_id: 3 },
    ],
    cards: [
      { card_id: 1, card_no: "4111111111111111", card_holder_name: "Ahmed Salem", expiration_date: "2030-12-31", customer_id: 17 },
      { card_id: 2, card_no: "5500000000000004", card_holder_name: "Ahmed Salem", expiration_date: "2025-06-30", customer_id: 17 },
      { card_id: 3, card_no: "4000000000000002", card_holder_name: "Omar Khaled", expiration_date: "2029-01-31", customer_id: 19 },
      { card_id: 4, card_no: "4012888888881881", card_holder_name: "Laila Hany", expiration_date: "2028-05-31", customer_id: 20 },
      { card_id: 5, card_no: "4222222222222222", card_holder_name: "Sara Mostafa", expiration_date: "2031-01-31", customer_id: 18 },
    ],
    businesses: [
      { business_id: 1, name: "Koshary El Tahrir", description: "Traditional Egyptian koshary", link_website: "www.koshary.example", opening_hour: "00:00", closing_hour: "00:00", expected_delivery_time: 30, status: "Active", suspension_reason: null, partner_id: 4, zone_id: 1, business_type: "Restaurant", cuisine_type: "Egyptian", food_category: "Fast Food", pharmacy_type: null },
      { business_id: 2, name: "Pizza Roma", description: "Wood-fired Italian pizza", link_website: null, opening_hour: "00:00", closing_hour: "00:00", expected_delivery_time: 40, status: "Active", suspension_reason: null, partner_id: 5, zone_id: 1, business_type: "Restaurant", cuisine_type: "Italian", food_category: "Pizza", pharmacy_type: null },
      { business_id: 3, name: "Seif Pharmacy", description: "Medicines and personal care", link_website: "www.seif.example", opening_hour: "00:00", closing_hour: "00:00", expected_delivery_time: 25, status: "Active", suspension_reason: null, partner_id: 6, zone_id: 1, business_type: "Pharmacy", cuisine_type: null, food_category: null, pharmacy_type: "Retail" },
      { business_id: 4, name: "Sushi Zen", description: "Japanese sushi bar", link_website: null, opening_hour: "00:00", closing_hour: "00:00", expected_delivery_time: 45, status: "Active", suspension_reason: null, partner_id: 7, zone_id: 2, business_type: "Restaurant", cuisine_type: "Japanese", food_category: "Seafood", pharmacy_type: null },
      { business_id: 5, name: "Zamalek Pharmacy", description: "Neighborhood pharmacy", link_website: null, opening_hour: "09:00", closing_hour: "21:00", expected_delivery_time: 20, status: "Pending", suspension_reason: null, partner_id: 8, zone_id: 2, business_type: "Pharmacy", cuisine_type: null, food_category: null, pharmacy_type: "Retail" },
      { business_id: 6, name: "Sweet Corner", description: "Oriental desserts", link_website: null, opening_hour: "10:00", closing_hour: "02:00", expected_delivery_time: 35, status: "Suspended", suspension_reason: "Hygiene violation", partner_id: 9, zone_id: 3, business_type: "Restaurant", cuisine_type: "Egyptian", food_category: "Desserts", pharmacy_type: null },
      { business_id: 7, name: "Cairo Grill", description: "Charcoal grilled meats", link_website: null, opening_hour: "00:00", closing_hour: "00:00", expected_delivery_time: 50, status: "Active", suspension_reason: null, partner_id: 10, zone_id: 3, business_type: "Restaurant", cuisine_type: "Egyptian", food_category: "Grills", pharmacy_type: null },
      { business_id: 8, name: "Nile Sweets", description: "Konafa and oriental sweets", link_website: null, opening_hour: "10:00", closing_hour: "23:00", expected_delivery_time: 30, status: "Rejected", suspension_reason: null, partner_id: 24, zone_id: 3, business_type: "Restaurant", cuisine_type: "Egyptian", food_category: "Desserts", pharmacy_type: null },
    ],
    businessPhones: [
      { business_id: 1, phone: "02200000001" },
      { business_id: 1, phone: "02200000011" },
      { business_id: 2, phone: "02200000002" },
      { business_id: 3, phone: "02200000003" },
      { business_id: 4, phone: "02200000004" },
      { business_id: 5, phone: "02200000005" },
      { business_id: 6, phone: "02200000006" },
      { business_id: 7, phone: "02200000007" },
      { business_id: 8, phone: "02200000008" },
    ],
    blacklist: [{ customer_id: 21, admin_id: 2, reason: "Repeated payment disputes" }],
    products: [
      { product_id: 1, name: "Koshary Large", description: "Large koshary box", category: "Main Dishes", price: 60, discount_amount: 0, is_available: true, business_id: 1 },
      { product_id: 2, name: "Koshary Small", description: "Small koshary box", category: "Main Dishes", price: 40, discount_amount: 0, is_available: true, business_id: 1 },
      { product_id: 3, name: "Rice Pudding", description: "Creamy rice pudding", category: "Desserts", price: 25, discount_amount: 5, is_available: true, business_id: 1 },
      { product_id: 4, name: "Feteer", description: "Egyptian pastry", category: "Main Dishes", price: 80, discount_amount: 0, is_available: false, business_id: 1 },
      { product_id: 5, name: "Margherita Pizza", description: "Tomato and mozzarella", category: "Pizza", price: 120, discount_amount: 20, is_available: true, business_id: 2 },
      { product_id: 6, name: "Pepperoni Pizza", description: "Spicy pepperoni", category: "Pizza", price: 150, discount_amount: 0, is_available: true, business_id: 2 },
      { product_id: 7, name: "Tiramisu", description: "Italian dessert", category: "Desserts", price: 70, discount_amount: 0, is_available: true, business_id: 2 },
      { product_id: 8, name: "Panadol Extra", description: "Pain relief, 24 tablets", category: "Painkillers", price: 45, discount_amount: 0, is_available: true, business_id: 3 },
      { product_id: 9, name: "Vitamin C", description: "1000 mg, 30 tablets", category: "Vitamins", price: 90, discount_amount: 10, is_available: true, business_id: 3 },
      { product_id: 10, name: "Hand Sanitizer", description: "250 ml", category: "Hygiene", price: 30, discount_amount: 0, is_available: true, business_id: 3 },
      { product_id: 11, name: "Salmon Roll", description: "8 pieces", category: "Sushi", price: 180, discount_amount: 0, is_available: true, business_id: 4 },
      { product_id: 12, name: "Miso Soup", description: "Hot soup", category: "Soups", price: 50, discount_amount: 0, is_available: true, business_id: 4 },
      { product_id: 13, name: "Green Tea Ice Cream", description: "2 scoops", category: "Desserts", price: 60, discount_amount: 0, is_available: true, business_id: 4 },
      { product_id: 14, name: "Aspirin", description: "100 mg, 20 tablets", category: "Painkillers", price: 20, discount_amount: 0, is_available: true, business_id: 5 },
      { product_id: 15, name: "Basbousa", description: "Semolina cake", category: "Desserts", price: 35, discount_amount: 0, is_available: false, business_id: 6 },
      { product_id: 16, name: "Mixed Grill", description: "Kofta, kebab and chicken", category: "Grill", price: 220, discount_amount: 0, is_available: true, business_id: 7 },
      { product_id: 17, name: "Kofta Sandwich", description: "Grilled kofta", category: "Sandwiches", price: 55, discount_amount: 0, is_available: true, business_id: 7 },
      { product_id: 18, name: "Hawawshi", description: "Spiced meat bread", category: "Main Dishes", price: 50, discount_amount: 0, is_available: true, business_id: 1 },
      { product_id: 19, name: "Face Mask", description: "Box of 10", category: "Hygiene", price: 15, discount_amount: 0, is_available: true, business_id: 3 },
      { product_id: 20, name: "Konafa", description: "Cheese konafa", category: "Desserts", price: 40, discount_amount: 0, is_available: true, business_id: 8 },
    ],
    favoriteBusinesses: [
      { customer_id: 17, business_id: 1 },
      { customer_id: 18, business_id: 6 },
    ],
    favoriteProducts: [
      { customer_id: 17, product_id: 5 },
      { customer_id: 19, product_id: 15 },
    ],
    vouchers: [
      { voucher_id: 1, promo_code: "SARA30", is_percentage: false, amount: 30, expiry_date: "2027-06-30", status: "Used", customer_id: 18 },
      { voucher_id: 2, promo_code: "OMAR10", is_percentage: true, amount: 10, expiry_date: "2027-06-30", status: "Used", customer_id: 19 },
      { voucher_id: 3, promo_code: "WELCOME50", is_percentage: false, amount: 50, expiry_date: "2030-12-31", status: "Unused", customer_id: 17 },
      { voucher_id: 4, promo_code: "SAVE10", is_percentage: true, amount: 10, expiry_date: "2030-12-31", status: "Unused", customer_id: 17 },
      { voucher_id: 5, promo_code: "NOUR15", is_percentage: false, amount: 15, expiry_date: "2030-12-31", status: "Used", customer_id: 22 },
      { voucher_id: 6, promo_code: "OLD20", is_percentage: false, amount: 20, expiry_date: "2025-01-01", status: "Unused", customer_id: 20 },
      { voucher_id: 7, promo_code: "SARA25", is_percentage: true, amount: 25, expiry_date: "2030-12-31", status: "Unused", customer_id: 18 },
    ],
    carts: [
      { cart_id: 1, status: "Checked Out", created_at: "2026-09-01 11:50", customer_id: 17, address_id: 1 },
      { cart_id: 2, status: "Checked Out", created_at: "2026-09-02 18:50", customer_id: 18, address_id: 4 },
      { cart_id: 3, status: "Checked Out", created_at: "2026-09-05 12:50", customer_id: 19, address_id: 5 },
      { cart_id: 4, status: "Checked Out", created_at: "2026-09-10 19:50", customer_id: 21, address_id: 7 },
      { cart_id: 5, status: "Checked Out", created_at: "2026-09-15 13:50", customer_id: 20, address_id: 6 },
      { cart_id: 6, status: "Checked Out", created_at: "2026-09-20 17:50", customer_id: 17, address_id: 1 },
      { cart_id: 7, status: "Checked Out", created_at: "2026-09-21 09:50", customer_id: 18, address_id: 4 },
      { cart_id: 8, status: "Checked Out", created_at: "2026-09-21 10:50", customer_id: 22, address_id: 8 },
      { cart_id: 9, status: "Active", created_at: "2026-09-25 10:00", customer_id: 17, address_id: 1 },
      { cart_id: 10, status: "Active", created_at: "2026-09-25 10:00", customer_id: 18, address_id: 4 },
      { cart_id: 11, status: "Active", created_at: "2026-09-25 10:00", customer_id: 19, address_id: 5 },
      { cart_id: 12, status: "Active", created_at: "2026-09-25 10:00", customer_id: 21, address_id: 7 },
      { cart_id: 13, status: "Active", created_at: "2026-09-25 10:00", customer_id: 20, address_id: 6 },
      { cart_id: 14, status: "Active", created_at: "2026-09-25 10:00", customer_id: 22, address_id: 8 },
      { cart_id: 15, status: "Active", created_at: "2026-09-25 10:00", customer_id: 17, address_id: 3 },
    ],
    cartItems: [
      { cart_id: 1, product_id: 1, quantity: 2, notes: "Extra sauce", unit_price: 60 },
      { cart_id: 1, product_id: 5, quantity: 1, notes: null, unit_price: 100 },
      { cart_id: 2, product_id: 8, quantity: 2, notes: null, unit_price: 45 },
      { cart_id: 2, product_id: 3, quantity: 2, notes: null, unit_price: 20 },
      { cart_id: 3, product_id: 11, quantity: 1, notes: null, unit_price: 180 },
      { cart_id: 3, product_id: 12, quantity: 2, notes: "No onions", unit_price: 50 },
      { cart_id: 4, product_id: 7, quantity: 1, notes: null, unit_price: 70 },
      { cart_id: 5, product_id: 16, quantity: 1, notes: null, unit_price: 220 },
      { cart_id: 5, product_id: 15, quantity: 2, notes: null, unit_price: 35 },
      { cart_id: 6, product_id: 2, quantity: 3, notes: null, unit_price: 40 },
      { cart_id: 6, product_id: 10, quantity: 1, notes: null, unit_price: 30 },
      { cart_id: 7, product_id: 9, quantity: 1, notes: null, unit_price: 80 },
      { cart_id: 8, product_id: 6, quantity: 1, notes: null, unit_price: 150 },
      { cart_id: 9, product_id: 1, quantity: 1, notes: "Extra sauce", unit_price: null },
      { cart_id: 9, product_id: 8, quantity: 2, notes: null, unit_price: null },
      { cart_id: 11, product_id: 12, quantity: 1, notes: null, unit_price: null },
      { cart_id: 12, product_id: 1, quantity: 1, notes: null, unit_price: null },
      { cart_id: 13, product_id: 17, quantity: 2, notes: null, unit_price: null },
      { cart_id: 14, product_id: 4, quantity: 1, notes: null, unit_price: null },
      { cart_id: 15, product_id: 11, quantity: 1, notes: null, unit_price: null },
    ],
    orders: [
      { order_id: 1, order_date: "2026-09-01 12:00", status: "Delivered", discount_amount: 0, total_amount: 260, cart_id: 1, zone_id: 1, voucher_id: null },
      { order_id: 2, order_date: "2026-09-02 19:00", status: "Delivered", discount_amount: 30, total_amount: 140, cart_id: 2, zone_id: 1, voucher_id: 1 },
      { order_id: 3, order_date: "2026-09-05 13:00", status: "Delivered", discount_amount: 28, total_amount: 277, cart_id: 3, zone_id: 2, voucher_id: 2 },
      { order_id: 4, order_date: "2026-09-10 20:00", status: "Cancelled", discount_amount: 0, total_amount: 90, cart_id: 4, zone_id: 1, voucher_id: null },
      { order_id: 5, order_date: "2026-09-15 14:00", status: "Delivered", discount_amount: 0, total_amount: 350, cart_id: 5, zone_id: 3, voucher_id: null },
      { order_id: 6, order_date: "2026-09-20 18:00", status: "In Progress", discount_amount: 0, total_amount: 190, cart_id: 6, zone_id: 1, voucher_id: null },
      { order_id: 7, order_date: "2026-09-21 10:00", status: "Placed", discount_amount: 0, total_amount: 100, cart_id: 7, zone_id: 1, voucher_id: null },
      { order_id: 8, order_date: "2026-09-21 11:00", status: "Placed", discount_amount: 15, total_amount: 155, cart_id: 8, zone_id: 1, voucher_id: 5 },
    ],
    subOrders: [
      { suborder_id: 1, status: "Delivered", total_price: 120, delivery_fee: 20, order_id: 1, business_id: 1 },
      { suborder_id: 2, status: "Delivered", total_price: 100, delivery_fee: 20, order_id: 1, business_id: 2 },
      { suborder_id: 3, status: "Delivered", total_price: 90, delivery_fee: 20, order_id: 2, business_id: 3 },
      { suborder_id: 4, status: "Delivered", total_price: 40, delivery_fee: 20, order_id: 2, business_id: 1 },
      { suborder_id: 5, status: "Delivered", total_price: 280, delivery_fee: 25, order_id: 3, business_id: 4 },
      { suborder_id: 6, status: "Cancelled", total_price: 70, delivery_fee: 20, order_id: 4, business_id: 2 },
      { suborder_id: 7, status: "Delivered", total_price: 220, delivery_fee: 30, order_id: 5, business_id: 7 },
      { suborder_id: 8, status: "Cancelled", total_price: 70, delivery_fee: 30, order_id: 5, business_id: 6 },
      { suborder_id: 9, status: "Picked Up", total_price: 120, delivery_fee: 20, order_id: 6, business_id: 1 },
      { suborder_id: 10, status: "Assigned", total_price: 30, delivery_fee: 20, order_id: 6, business_id: 3 },
      { suborder_id: 11, status: "Assigned", total_price: 80, delivery_fee: 20, order_id: 7, business_id: 3 },
      { suborder_id: 12, status: "Assigned", total_price: 150, delivery_fee: 20, order_id: 8, business_id: 2 },
    ],
    deliveries: [
      { delivery_id: 1, assigned_at: "2026-09-01 12:00", picked_up_at: "2026-09-01 12:10", delivered_at: "2026-09-01 12:40", tracking_time: 30, rider_rating: 5, suborder_id: 1, rider_id: 12 },
      { delivery_id: 2, assigned_at: "2026-09-01 12:00", picked_up_at: "2026-09-01 12:15", delivered_at: "2026-09-01 12:35", tracking_time: 20, rider_rating: 4, suborder_id: 2, rider_id: 13 },
      { delivery_id: 3, assigned_at: "2026-09-02 19:00", picked_up_at: "2026-09-02 19:05", delivered_at: "2026-09-02 19:30", tracking_time: 25, rider_rating: 4, suborder_id: 3, rider_id: 12 },
      { delivery_id: 4, assigned_at: "2026-09-02 19:00", picked_up_at: "2026-09-02 19:10", delivered_at: "2026-09-02 19:25", tracking_time: 15, rider_rating: null, suborder_id: 4, rider_id: 13 },
      { delivery_id: 5, assigned_at: "2026-09-05 13:00", picked_up_at: "2026-09-05 13:10", delivered_at: "2026-09-05 13:45", tracking_time: 35, rider_rating: 5, suborder_id: 5, rider_id: 15 },
      { delivery_id: 6, assigned_at: "2026-09-10 20:00", picked_up_at: null, delivered_at: null, tracking_time: null, rider_rating: null, suborder_id: 6, rider_id: 12 },
      { delivery_id: 7, assigned_at: "2026-09-15 14:00", picked_up_at: "2026-09-15 14:20", delivered_at: "2026-09-15 15:00", tracking_time: 40, rider_rating: 3, suborder_id: 7, rider_id: 16 },
      { delivery_id: 8, assigned_at: "2026-09-15 14:00", picked_up_at: null, delivered_at: null, tracking_time: null, rider_rating: null, suborder_id: 8, rider_id: 16 },
      { delivery_id: 9, assigned_at: "2026-09-20 18:00", picked_up_at: "2026-09-20 18:20", delivered_at: null, tracking_time: null, rider_rating: null, suborder_id: 9, rider_id: 12 },
      { delivery_id: 10, assigned_at: "2026-09-20 18:00", picked_up_at: null, delivered_at: null, tracking_time: null, rider_rating: null, suborder_id: 10, rider_id: 13 },
      { delivery_id: 11, assigned_at: "2026-09-21 10:00", picked_up_at: null, delivered_at: null, tracking_time: null, rider_rating: null, suborder_id: 11, rider_id: 12 },
      { delivery_id: 12, assigned_at: "2026-09-21 11:00", picked_up_at: null, delivered_at: null, tracking_time: null, rider_rating: null, suborder_id: 12, rider_id: 13 },
    ],
    payments: [
      { payment_id: 1, amount: 260, currency: "EGP", method: "Card", transaction_date: "2026-09-01 12:00", refunded_amount: 0, order_id: 1, card_id: 1 },
      { payment_id: 2, amount: 140, currency: "EGP", method: "Wallet", transaction_date: "2026-09-02 19:00", refunded_amount: 0, order_id: 2, card_id: null },
      { payment_id: 3, amount: 277, currency: "EGP", method: "Card", transaction_date: "2026-09-05 13:00", refunded_amount: 0, order_id: 3, card_id: 3 },
      { payment_id: 4, amount: 90, currency: "EGP", method: "Cash", transaction_date: "2026-09-10 20:00", refunded_amount: 90, order_id: 4, card_id: null },
      { payment_id: 5, amount: 350, currency: "EGP", method: "Card", transaction_date: "2026-09-15 14:00", refunded_amount: 100, order_id: 5, card_id: 4 },
      { payment_id: 6, amount: 190, currency: "EGP", method: "Card", transaction_date: "2026-09-20 18:00", refunded_amount: 0, order_id: 6, card_id: 1 },
      { payment_id: 7, amount: 100, currency: "EGP", method: "Cash", transaction_date: "2026-09-21 10:00", refunded_amount: 0, order_id: 7, card_id: null },
      { payment_id: 8, amount: 155, currency: "EGP", method: "Wallet", transaction_date: "2026-09-21 11:00", refunded_amount: 0, order_id: 8, card_id: null },
    ],
    feedbacks: [
      { feedback_id: 1, headline: "Great koshary", description: "Hot and tasty", rating: 5, feedback_date: "2026-09-01 13:00", suborder_id: 1 },
      { feedback_id: 2, headline: "Fast delivery", description: "Medicine arrived quickly", rating: 4, feedback_date: "2026-09-02 20:00", suborder_id: 3 },
      { feedback_id: 3, headline: "Too sweet", description: "Rice pudding was too sweet", rating: 2, feedback_date: "2026-09-02 20:05", suborder_id: 4 },
      { feedback_id: 4, headline: "Excellent sushi", description: "Fresh fish", rating: 5, feedback_date: "2026-09-05 14:30", suborder_id: 5 },
      { feedback_id: 5, headline: "Good grill", description: "Generous portions", rating: 4, feedback_date: "2026-09-15 16:00", suborder_id: 7 },
    ],
  };
}

const globalForMock = globalThis as unknown as { __tayebatMockStore?: MockStore };

function getStore(): MockStore {
  if (!globalForMock.__tayebatMockStore) {
    globalForMock.__tayebatMockStore = createSeedStore();
  }
  return globalForMock.__tayebatMockStore;
}

function nowDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowDateTimeStr(): string {
  const d = new Date();
  return `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`;
}

function nowTimeStr(): string {
  return new Date().toTimeString().slice(0, 5);
}

function isBusinessOpen(opening: string, closing: string, nowTime = nowTimeStr()): boolean {
  const op = opening.slice(0, 5);
  const cl = closing.slice(0, 5);
  if (op === cl) return true;
  if (op < cl) return nowTime >= op && nowTime < cl;
  return nowTime >= op || nowTime < cl;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function nextId(items: number[]): number {
  return items.length === 0 ? 1 : Math.max(...items) + 1;
}

function isSuperAdmin(store: MockStore, adminId: number): boolean {
  return store.admins.some((a) => a.admin_id === adminId && a.role === "Super Admin");
}

function adminCanManageBusiness(store: MockStore, adminId: number, businessId: number): boolean {
  if (isSuperAdmin(store, adminId)) return true;
  const admin = store.admins.find((a) => a.admin_id === adminId);
  const biz = store.businesses.find((b) => b.business_id === businessId);
  return Boolean(admin && biz && admin.role === "Zone Admin" && admin.zone_id === biz.zone_id);
}

function adminCanManageCustomer(store: MockStore, adminId: number, customerId: number): boolean {
  if (isSuperAdmin(store, adminId)) return true;
  const admin = store.admins.find((a) => a.admin_id === adminId);
  if (!admin || admin.role !== "Zone Admin") return false;
  return store.addresses.some((a) => a.customer_id === customerId && a.zone_id === admin.zone_id);
}

function activeAddressId(store: MockStore, customerId: number): number | null {
  const found = store.addresses
    .filter((a) => a.customer_id === customerId && a.is_active)
    .sort((a, b) => a.address_id - b.address_id)[0];
  return found ? found.address_id : null;
}

function leastBusyRider(store: MockStore, zoneId: number): number | null {
  const eligible = store.riders
    .filter((r) => {
      const u = store.users.find((usr) => usr.user_id === r.rider_id);
      return r.zone_id === zoneId && r.is_available && u?.account_status === "Active";
    })
    .map((r) => {
      const activeCount = store.deliveries.filter((d) => {
        if (d.rider_id !== r.rider_id) return false;
        const s = store.subOrders.find((so) => so.suborder_id === d.suborder_id);
        return s?.status === "Assigned" || s?.status === "Picked Up";
      }).length;
      return { rider_id: r.rider_id, activeCount };
    })
    .sort((a, b) => a.activeCount - b.activeCount || a.rider_id - b.rider_id);
  return eligible[0]?.rider_id ?? null;
}

function recomputeOrderStatus(store: MockStore, orderId: number): void {
  const subs = store.subOrders.filter((s) => s.order_id === orderId);
  const order = store.orders.find((o) => o.order_id === orderId);
  if (!order) return;
  if (!subs.some((s) => s.status !== "Cancelled")) {
    order.status = "Cancelled";
  } else if (!subs.some((s) => s.status !== "Cancelled" && s.status !== "Delivered")) {
    order.status = "Delivered";
  } else if (subs.some((s) => s.status === "Picked Up" || s.status === "Delivered")) {
    order.status = "In Progress";
  } else {
    order.status = "Placed";
  }
}

function refundOrder(store: MockStore, orderId: number, amount: number): void {
  const payment = store.payments.find((p) => p.order_id === orderId);
  if (!payment) return;
  const remaining = payment.amount - payment.refunded_amount;
  const refund = Math.min(amount, remaining);
  if (refund <= 0) return;

  payment.refunded_amount = round2(payment.refunded_amount + refund);
  if (payment.method !== "Cash") {
    const order = store.orders.find((o) => o.order_id === orderId);
    const cart = store.carts.find((c) => c.cart_id === order?.cart_id);
    const cust = store.customers.find((c) => c.customer_id === cart?.customer_id);
    if (cust) {
      cust.wallet_balance = round2(cust.wallet_balance + refund);
    }
  }
}

function restoreVoucherIfCancelled(store: MockStore, orderId: number): void {
  const order = store.orders.find((o) => o.order_id === orderId && o.status === "Cancelled");
  if (order && order.voucher_id !== null) {
    const v = store.vouchers.find((vr) => vr.voucher_id === order.voucher_id);
    if (v) v.status = "Unused";
    order.voucher_id = null;
  }
}

function validateAccountInput(
  store: MockStore,
  input: {
    first_name: string;
    last_name: string;
    username: string;
    password: string;
    email: string;
    phone?: string | null;
    dob?: string | null;
  }
): number {
  if (
    !input.first_name?.trim() ||
    !input.last_name?.trim() ||
    !input.username?.trim() ||
    !input.password?.trim() ||
    !input.email?.trim()
  ) {
    return -1;
  }
  if (input.phone && !/^\d{11}$/.test(input.phone)) return -1;
  if (input.dob && input.dob > nowDateStr()) return -1;
  if (
    store.users.some(
      (u) =>
        u.username.toLowerCase() === input.username.trim().toLowerCase() ||
        u.email.toLowerCase() === input.email.trim().toLowerCase()
    )
  ) {
    return -2;
  }
  return 0;
}

function createUserRecord(
  store: MockStore,
  input: {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    username: string;
    password: string;
    email: string;
    phone?: string | null;
    dob?: string | null;
  }
): number {
  const user_id = nextId(store.users.map((u) => u.user_id));
  store.users.push({
    user_id,
    first_name: input.first_name.trim(),
    middle_name: input.middle_name?.trim() || null,
    last_name: input.last_name.trim(),
    username: input.username.trim(),
    password: input.password,
    email: input.email.trim(),
    dob: input.dob || null,
    account_status: "Active",
  });
  if (input.phone) {
    store.userPhones.push({ user_id, phone: input.phone });
  }
  return user_id;
}

export const mockDb = {
  // ---------------- Auth & Shared ----------------
  async validateLogin(role: UserRole, username: string, password: string): Promise<boolean> {
    const store = getStore();
    const user = store.users.find(
      (u) => u.username === username && u.password === password && u.account_status === "Active"
    );
    if (!user) return false;
    if (role === "Admin") return store.admins.some((a) => a.admin_id === user.user_id);
    if (role === "Partner") return store.partners.includes(user.user_id);
    if (role === "Rider") return store.riders.some((r) => r.rider_id === user.user_id);
    return store.customers.some((c) => c.customer_id === user.user_id);
  },

  async getUserId(username: string): Promise<number | null> {
    const store = getStore();
    return store.users.find((u) => u.username === username)?.user_id ?? null;
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
    const store = getStore();
    const rc = validateAccountInput(store, input);
    if (rc !== 0) return rc;
    const user_id = createUserRecord(store, input);
    store.customers.push({ customer_id: user_id, wallet_balance: 0 });
    return 0;
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
    const store = getStore();
    const rc = validateAccountInput(store, input);
    if (rc !== 0) return rc;
    const user_id = createUserRecord(store, input);
    store.partners.push(user_id);
    return 0;
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
    const store = getStore();
    if (
      !input.vehicle_type?.trim() ||
      !input.plate_no?.trim() ||
      !input.license_no?.trim() ||
      !store.zones.some((z) => z.zone_id === input.zone_id)
    ) {
      return -1;
    }
    const rc = validateAccountInput(store, input);
    if (rc !== 0) return rc;
    if (
      store.riders.some(
        (r) =>
          r.plate_no.toLowerCase() === input.plate_no.trim().toLowerCase() ||
          r.license_no.toLowerCase() === input.license_no.trim().toLowerCase()
      )
    ) {
      return -2;
    }
    const user_id = createUserRecord(store, input);
    store.riders.push({
      rider_id: user_id,
      vehicle_type: input.vehicle_type.trim(),
      plate_no: input.plate_no.trim(),
      license_no: input.license_no.trim(),
      is_available: true,
      zone_id: input.zone_id,
    });
    return 0;
  },

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    newPasswordRepeat: string
  ): Promise<number> {
    const store = getStore();
    if (!newPassword || !newPasswordRepeat || newPassword !== newPasswordRepeat) return -1;
    const user = store.users.find((u) => u.user_id === userId && u.password === oldPassword);
    if (!user) return -1;
    if (newPassword === oldPassword) return -1;
    user.password = newPassword;
    return 0;
  },

  async getZones(): Promise<Zone[]> {
    return [...getStore().zones];
  },

  // ---------------- Admin ----------------
  async getAdminProfile(adminId: number): Promise<AdminProfile | null> {
    const store = getStore();
    const admin = store.admins.find((a) => a.admin_id === adminId);
    const user = store.users.find((u) => u.user_id === adminId);
    if (!admin || !user) return null;
    const zone = store.zones.find((z) => z.zone_id === admin.zone_id);
    return {
      admin_id: admin.admin_id,
      admin_name: `${user.first_name} ${user.last_name}`,
      role: admin.role,
      zone_id: admin.zone_id,
      zone_name: zone?.zone_name ?? null,
    };
  },

  async getAdminList(): Promise<AdminListItem[]> {
    const store = getStore();
    return store.admins.map((a) => {
      const u = store.users.find((usr) => usr.user_id === a.admin_id)!;
      const z = store.zones.find((zn) => zn.zone_id === a.zone_id);
      return {
        admin_id: a.admin_id,
        admin_name: `${u.first_name} ${u.last_name}`,
        username: u.username,
        role: a.role,
        zone_name: z?.zone_name ?? null,
      };
    });
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
    const store = getStore();
    if (!isSuperAdmin(store, superAdminId)) return -3;
    const role = input.role || "Super Admin";
    if (role !== "Super Admin" && role !== "Zone Admin") return -1;
    if (role === "Super Admin" && input.zone_id !== null) return -1;
    if (role === "Zone Admin" && (!input.zone_id || !store.zones.some((z) => z.zone_id === input.zone_id))) {
      return -1;
    }
    const rc = validateAccountInput(store, input);
    if (rc !== 0) return rc;
    const user_id = createUserRecord(store, input);
    store.admins.push({ admin_id: user_id, role, zone_id: input.zone_id });
    return 0;
  },

  async assignAdminZone(superAdminId: number, adminId: number, zoneId: number): Promise<number> {
    const store = getStore();
    if (!isSuperAdmin(store, superAdminId)) return -3;
    const admin = store.admins.find((a) => a.admin_id === adminId && a.role === "Zone Admin");
    if (!admin || !store.zones.some((z) => z.zone_id === zoneId)) return -1;
    admin.zone_id = zoneId;
    return 0;
  },

  async getAllBusinessProfiles(): Promise<BusinessProfile[]> {
    const store = getStore();
    return store.businesses.map((b) => {
      const z = store.zones.find((zn) => zn.zone_id === b.zone_id)!;
      const u = store.users.find((usr) => usr.user_id === b.partner_id)!;
      return {
        business_id: b.business_id,
        business_name: b.name,
        business_type: b.business_type,
        zone_name: z.zone_name,
        partner_name: `${u.first_name} ${u.last_name}`,
        status: b.status,
        opening_hour: b.opening_hour,
        closing_hour: b.closing_hour,
      };
    });
  },

  async getPendingBusinessApprovals(): Promise<PendingBusinessApproval[]> {
    const all = await this.getAllBusinessProfiles();
    return all
      .filter((b) => b.status === "Pending")
      .map(({ business_id, business_name, business_type, zone_name, partner_name }) => ({
        business_id,
        business_name,
        business_type,
        zone_name,
        partner_name,
      }));
  },

  async getSuspendedBusinesses(): Promise<SuspendedBusiness[]> {
    const store = getStore();
    return store.businesses
      .filter((b) => b.status === "Suspended")
      .map((b) => ({
        business_id: b.business_id,
        business_name: b.name,
        zone_name: store.zones.find((z) => z.zone_id === b.zone_id)!.zone_name,
        suspension_reason: b.suspension_reason,
      }));
  },

  async approveBusiness(businessId: number, adminId: number): Promise<number> {
    const store = getStore();
    const biz = store.businesses.find((b) => b.business_id === businessId);
    if (!biz) return -1;
    if (!adminCanManageBusiness(store, adminId, businessId)) return -3;
    if (biz.status !== "Pending") return -4;
    biz.status = "Active";
    return 0;
  },

  async rejectBusiness(businessId: number, adminId: number): Promise<number> {
    const store = getStore();
    const biz = store.businesses.find((b) => b.business_id === businessId);
    if (!biz) return -1;
    if (!adminCanManageBusiness(store, adminId, businessId)) return -3;
    if (biz.status !== "Pending") return -4;
    biz.status = "Rejected";
    return 0;
  },

  async suspendBusiness(businessId: number, adminId: number, reason: string): Promise<number> {
    const store = getStore();
    const biz = store.businesses.find((b) => b.business_id === businessId);
    if (!biz || !reason?.trim()) return -1;
    if (!adminCanManageBusiness(store, adminId, businessId)) return -3;
    if (biz.status !== "Active") return -4;

    biz.status = "Suspended";
    biz.suspension_reason = reason.trim();
    store.products.filter((p) => p.business_id === businessId).forEach((p) => (p.is_available = false));

    const affectedSubs = store.subOrders.filter(
      (s) => s.business_id === businessId && (s.status === "Placed" || s.status === "Assigned")
    );
    for (const s of affectedSubs) {
      s.status = "Cancelled";
      refundOrder(store, s.order_id, s.total_price + s.delivery_fee);
      recomputeOrderStatus(store, s.order_id);
      restoreVoucherIfCancelled(store, s.order_id);
    }
    return 0;
  },

  async reinstateBusiness(businessId: number, superAdminId: number): Promise<number> {
    const store = getStore();
    const biz = store.businesses.find((b) => b.business_id === businessId);
    if (!biz) return -1;
    if (!isSuperAdmin(store, superAdminId)) return -3;
    if (biz.status !== "Suspended") return -4;
    biz.status = "Active";
    biz.suspension_reason = null;
    return 0;
  },

  async createZone(zoneName: string, deliveryFee: number, superAdminId: number): Promise<number> {
    const store = getStore();
    if (!isSuperAdmin(store, superAdminId)) return -3;
    if (!zoneName?.trim() || Number.isNaN(deliveryFee) || deliveryFee < 0) return -1;
    if (store.zones.some((z) => z.zone_name.toLowerCase() === zoneName.trim().toLowerCase())) return -2;
    store.zones.push({
      zone_id: nextId(store.zones.map((z) => z.zone_id)),
      zone_name: zoneName.trim(),
      delivery_fee: round2(deliveryFee),
    });
    return 0;
  },

  async updateZoneFee(zoneId: number, newFee: number, superAdminId: number): Promise<number> {
    const store = getStore();
    if (!isSuperAdmin(store, superAdminId)) return -3;
    const zone = store.zones.find((z) => z.zone_id === zoneId);
    if (!zone || Number.isNaN(newFee) || newFee < 0) return -1;
    zone.delivery_fee = round2(newFee);
    return 0;
  },

  async getCustomerList(): Promise<CustomerListItem[]> {
    const store = getStore();
    return store.customers.map((c) => {
      const u = store.users.find((usr) => usr.user_id === c.customer_id)!;
      const addr = store.addresses.find((a) => a.customer_id === c.customer_id && a.is_active);
      const zone = store.zones.find((z) => z.zone_id === addr?.zone_id);
      return {
        customer_id: c.customer_id,
        customer_name: `${u.first_name} ${u.last_name}`,
        username: u.username,
        email: u.email,
        account_status: u.account_status,
        active_zone: zone?.zone_name ?? null,
      };
    });
  },

  async getActiveVouchers(): Promise<ActiveVoucher[]> {
    const store = getStore();
    const today = nowDateStr();
    return store.vouchers
      .filter((v) => v.status === "Unused" && v.expiry_date >= today)
      .map((v) => {
        const u = store.users.find((usr) => usr.user_id === v.customer_id);
        return {
          voucher_id: v.voucher_id,
          promo_code: v.promo_code,
          customer_id: v.customer_id,
          customer_name: u ? `${u.first_name} ${u.last_name}` : undefined,
          is_percentage: v.is_percentage,
          amount: v.amount,
          expiry_date: v.expiry_date,
        };
      });
  },

  async issueVoucher(input: {
    customer_id: number;
    promo_code: string;
    is_percentage: boolean;
    amount: number;
    expiry_date: string;
    admin_id: number;
  }): Promise<number> {
    const store = getStore();
    if (!store.admins.some((a) => a.admin_id === input.admin_id)) return -3;
    if (!store.customers.some((c) => c.customer_id === input.customer_id)) return -1;
    const custUser = store.users.find((u) => u.user_id === input.customer_id);
    if (custUser?.account_status === "Blacklisted") return -3;

    if (
      !input.promo_code?.trim() ||
      input.amount <= 0 ||
      !input.expiry_date ||
      input.expiry_date < nowDateStr() ||
      (input.is_percentage && (input.amount < 1 || input.amount > 100))
    ) {
      return -1;
    }
    if (store.vouchers.some((v) => v.promo_code.toLowerCase() === input.promo_code.trim().toLowerCase())) {
      return -2;
    }
    store.vouchers.push({
      voucher_id: nextId(store.vouchers.map((v) => v.voucher_id)),
      promo_code: input.promo_code.trim(),
      is_percentage: input.is_percentage,
      amount: round2(input.amount),
      expiry_date: input.expiry_date,
      status: "Unused",
      customer_id: input.customer_id,
    });
    return 0;
  },

  async getBlacklistedCustomers(): Promise<BlacklistedCustomer[]> {
    const store = getStore();
    return store.blacklist.map((bl) => {
      const cu = store.users.find((u) => u.user_id === bl.customer_id)!;
      const au = store.users.find((u) => u.user_id === bl.admin_id)!;
      return {
        customer_id: bl.customer_id,
        customer_name: `${cu.first_name} ${cu.last_name}`,
        reason: bl.reason,
        admin_id: bl.admin_id,
        blacklisted_by: `${au.first_name} ${au.last_name}`,
      };
    });
  },

  async blacklistCustomer(customerId: number, adminId: number, reason: string): Promise<number> {
    const store = getStore();
    if (!store.customers.some((c) => c.customer_id === customerId)) return -1;
    if (!store.admins.some((a) => a.admin_id === adminId)) return -3;
    if (!adminCanManageCustomer(store, adminId, customerId)) return -3;
    if (!reason?.trim()) return -1;
    const custUser = store.users.find((u) => u.user_id === customerId);
    if (!custUser || custUser.account_status === "Blacklisted") return -4;

    custUser.account_status = "Blacklisted";
    store.blacklist.push({ customer_id: customerId, admin_id: adminId, reason: reason.trim() });

    const customerCartIds = new Set(store.carts.filter((c) => c.customer_id === customerId).map((c) => c.cart_id));
    for (const order of store.orders) {
      if (!customerCartIds.has(order.cart_id) || order.status === "Cancelled") continue;
      const subs = store.subOrders.filter((s) => s.order_id === order.order_id);
      const hasProgressed = subs.some((s) => s.status === "Picked Up" || s.status === "Delivered");
      if (!hasProgressed) {
        const pay = store.payments.find((p) => p.order_id === order.order_id);
        if (pay) {
          refundOrder(store, order.order_id, pay.amount - pay.refunded_amount);
        }
        subs.forEach((s) => {
          if (s.status === "Placed" || s.status === "Assigned") s.status = "Cancelled";
        });
        recomputeOrderStatus(store, order.order_id);
        restoreVoucherIfCancelled(store, order.order_id);
      }
    }

    store.vouchers = store.vouchers.filter((v) => !(v.customer_id === customerId && v.status === "Unused"));
    return 0;
  },

  async liftCustomerBlacklist(customerId: number, adminId: number): Promise<number> {
    const store = getStore();
    if (!store.admins.some((a) => a.admin_id === adminId)) return -3;
    const entry = store.blacklist.find((b) => b.customer_id === customerId);
    if (!entry) return -4;
    if (entry.admin_id !== adminId) return -3;

    store.blacklist = store.blacklist.filter((b) => b.customer_id !== customerId);
    const user = store.users.find((u) => u.user_id === customerId);
    if (user) user.account_status = "Active";
    return 0;
  },

  async getPlatformHealthSnapshot(): Promise<PlatformHealthSnapshot> {
    const store = getStore();
    const today = nowDateStr();
    const todayDeliveries = store.deliveries.filter(
      (d) => d.tracking_time !== null && d.delivered_at?.slice(0, 10) === today
    );
    const avg =
      todayDeliveries.length > 0
        ? round2(todayDeliveries.reduce((sum, d) => sum + (d.tracking_time ?? 0), 0) / todayDeliveries.length)
        : null;
    return {
      active_businesses: store.businesses.filter((b) => b.status === "Active").length,
      available_riders: store.riders.filter((r) => {
        const u = store.users.find((usr) => usr.user_id === r.rider_id);
        return r.is_available && u?.account_status === "Active";
      }).length,
      orders_today: store.orders.filter((o) => o.order_date.slice(0, 10) === today).length,
      avg_delivery_time_today: avg,
      low_ratings_today: store.feedbacks.filter(
        (f) => f.rating <= 2 && f.feedback_date.slice(0, 10) === today
      ).length,
    };
  },

  async getReconcileOrderTotals(): Promise<OrderReconciliationIssue[]> {
    const store = getStore();
    const issues: OrderReconciliationIssue[] = [];
    for (const o of store.orders) {
      const subsSum = store.subOrders
        .filter((s) => s.order_id === o.order_id)
        .reduce((acc, s) => acc + s.total_price + s.delivery_fee, 0);
      const expected = round2(subsSum - o.discount_amount);
      const payment = store.payments.find((p) => p.order_id === o.order_id);
      if (o.total_amount !== expected || !payment || payment.amount !== o.total_amount) {
        issues.push({
          order_id: o.order_id,
          expected_total: expected,
          order_total: o.total_amount,
          payment_amount: payment?.amount ?? null,
        });
      }
    }
    return issues;
  },

  async getBusinessesPerZone(): Promise<BusinessesPerZoneRow[]> {
    const store = getStore();
    return store.zones.map((z) => ({
      zone_id: z.zone_id,
      zone_name: z.zone_name,
      business_count: store.businesses.filter((b) => b.zone_id === z.zone_id && b.status === "Active").length,
    }));
  },

  async getZoneDeliveryPerformance(): Promise<ZoneDeliveryPerformanceRow[]> {
    const store = getStore();
    return store.zones.map((z) => {
      const zoneDeliveries = store.deliveries.filter((d) => {
        const s = store.subOrders.find((so) => so.suborder_id === d.suborder_id && so.status === "Delivered");
        const o = s ? store.orders.find((ord) => ord.order_id === s.order_id) : undefined;
        return o?.zone_id === z.zone_id;
      });
      const times = zoneDeliveries.map((d) => d.tracking_time).filter((t): t is number => t !== null);
      return {
        zone_id: z.zone_id,
        zone_name: z.zone_name,
        delivery_count: zoneDeliveries.length,
        avg_tracking_time: times.length > 0 ? round2(times.reduce((a, b) => a + b, 0) / times.length) : null,
      };
    });
  },

  async getZoneOrderReport(zoneId: number, fromDate: string, toDate: string): Promise<ZoneOrderReportRow | null> {
    const store = getStore();
    if (fromDate > toDate) return null;
    const zone = store.zones.find((z) => z.zone_id === zoneId);
    if (!zone) return null;
    const matchedOrders = store.orders.filter(
      (o) =>
        o.zone_id === zoneId &&
        o.status !== "Cancelled" &&
        o.order_date.slice(0, 10) >= fromDate &&
        o.order_date.slice(0, 10) <= toDate
    );
    const totalSum = matchedOrders.reduce((acc, o) => acc + o.total_amount, 0);
    const subPriceSum = matchedOrders.reduce((acc, o) => {
      const subs = store.subOrders.filter((s) => s.order_id === o.order_id && s.status !== "Cancelled");
      return acc + subs.reduce((sa, s) => sa + s.total_price, 0);
    }, 0);
    return {
      zone_id: zone.zone_id,
      zone_name: zone.zone_name,
      number_of_orders: matchedOrders.length,
      avg_order_total: matchedOrders.length > 0 ? round2(totalSum / matchedOrders.length) : null,
      platform_commission: round2(subPriceSum * 0.1),
    };
  },

  async getDailyRevenueReport(reportDate: string): Promise<DailyRevenueRow[]> {
    const store = getStore();
    const groups = new Map<string, DailyRevenueRow>();
    for (const o of store.orders) {
      if (o.order_date.slice(0, 10) !== reportDate) continue;
      const zone = store.zones.find((z) => z.zone_id === o.zone_id)!;
      const subs = store.subOrders.filter((s) => s.order_id === o.order_id && s.status !== "Cancelled");
      for (const s of subs) {
        const biz = store.businesses.find((b) => b.business_id === s.business_id)!;
        const key = `${zone.zone_name}::${biz.business_type}`;
        const existing = groups.get(key) ?? {
          zone_name: zone.zone_name,
          business_type: biz.business_type,
          number_of_suborders: 0,
          gross_sales: 0,
          delivery_fees: 0,
          platform_commission: 0,
        };
        existing.number_of_suborders += 1;
        existing.gross_sales = round2(existing.gross_sales + s.total_price);
        existing.delivery_fees = round2(existing.delivery_fees + s.delivery_fee);
        existing.platform_commission = round2(existing.gross_sales * 0.1);
        groups.set(key, existing);
      }
    }
    return Array.from(groups.values());
  },

  async getTopRiders(fromDate: string, toDate: string): Promise<TopRiderRow[]> {
    const store = getStore();
    if (fromDate > toDate) return [];
    const counts = new Map<number, number>();
    for (const d of store.deliveries) {
      const s = store.subOrders.find((so) => so.suborder_id === d.suborder_id && so.status === "Delivered");
      const dt = d.delivered_at?.slice(0, 10);
      if (s && dt && dt >= fromDate && dt <= toDate) {
        counts.set(d.rider_id, (counts.get(d.rider_id) ?? 0) + 1);
      }
    }
    const sorted = Array.from(counts.entries())
      .map(([rider_id, completed_delivery_count]) => {
        const u = store.users.find((usr) => usr.user_id === rider_id)!;
        return {
          rider_id,
          rider_name: `${u.first_name} ${u.last_name}`,
          completed_delivery_count,
        };
      })
      .sort((a, b) => b.completed_delivery_count - a.completed_delivery_count || a.rider_id - b.rider_id)
      .slice(0, 5);

    return sorted.map((item, i) => ({ rider_rank: i + 1, ...item }));
  },

  async getRiderPerformanceSummary(): Promise<RiderPerformanceRow[]> {
    const store = getStore();
    return store.riders.map((r) => {
      const u = store.users.find((usr) => usr.user_id === r.rider_id)!;
      const z = store.zones.find((zn) => zn.zone_id === r.zone_id)!;
      const myDels = store.deliveries.filter((d) => d.rider_id === r.rider_id);
      const completed = myDels.filter(
        (d) => store.subOrders.find((s) => s.suborder_id === d.suborder_id)?.status === "Delivered"
      ).length;
      const ratings = myDels.map((d) => d.rider_rating).filter((rt): rt is number => rt !== null);
      return {
        rider_id: r.rider_id,
        rider_name: `${u.first_name} ${u.last_name}`,
        zone_name: z.zone_name,
        completed_deliveries: completed,
        avg_rating: ratings.length > 0 ? round2(ratings.reduce((a, b) => a + b, 0) / ratings.length) : null,
      };
    });
  },

  async getTopSellingProducts(): Promise<TopSellingProductRow[]> {
    const store = getStore();
    const map = new Map<number, TopSellingProductRow>();
    for (const o of store.orders) {
      const items = store.cartItems.filter((ci) => ci.cart_id === o.cart_id);
      for (const ci of items) {
        const p = store.products.find((pr) => pr.product_id === ci.product_id)!;
        const s = store.subOrders.find((so) => so.order_id === o.order_id && so.business_id === p.business_id);
        if (!s || s.status === "Cancelled") continue;
        const b = store.businesses.find((bz) => bz.business_id === p.business_id)!;
        const unit = ci.unit_price ?? p.price - p.discount_amount;
        const cur = map.get(p.product_id) ?? {
          product_id: p.product_id,
          product_name: p.name,
          business_name: b.name,
          business_type: b.business_type,
          units_sold: 0,
          total_revenue: 0,
        };
        cur.units_sold += ci.quantity;
        cur.total_revenue = round2(cur.total_revenue + ci.quantity * unit);
        map.set(p.product_id, cur);
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.units_sold - a.units_sold || a.product_id - b.product_id)
      .slice(0, 10);
  },

  async getBusinessRatingsSummary(): Promise<BusinessRatingRow[]> {
    const store = getStore();
    return store.businesses.map((b) => {
      const subIds = new Set(store.subOrders.filter((s) => s.business_id === b.business_id).map((s) => s.suborder_id));
      const fbs = store.feedbacks.filter((f) => subIds.has(f.suborder_id));
      return {
        business_id: b.business_id,
        business_name: b.name,
        avg_rating: fbs.length > 0 ? round2(fbs.reduce((a, f) => a + f.rating, 0) / fbs.length) : null,
        ratings_count: fbs.length,
      };
    });
  },

  // ---------------- Partner ----------------
  async getMyBusiness(partnerId: number): Promise<PartnerBusiness | null> {
    const store = getStore();
    const b = store.businesses.find((bz) => bz.partner_id === partnerId);
    if (!b) return null;
    const z = store.zones.find((zn) => zn.zone_id === b.zone_id)!;
    return {
      business_id: b.business_id,
      business_name: b.name,
      description: b.description,
      link_website: b.link_website,
      business_type: b.business_type,
      cuisine_type: b.cuisine_type,
      food_category: b.food_category,
      pharmacy_type: b.pharmacy_type,
      zone_id: b.zone_id,
      zone_name: z.zone_name,
      opening_hour: b.opening_hour,
      closing_hour: b.closing_hour,
      expected_delivery_time: b.expected_delivery_time,
      status: b.status,
      suspension_reason: b.suspension_reason,
    };
  },

  async getBusinessPhones(businessId: number): Promise<string[]> {
    return getStore()
      .businessPhones.filter((bp) => bp.business_id === businessId)
      .map((bp) => bp.phone);
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
    const store = getStore();
    if (!store.partners.includes(partnerId)) return -3;
    if (
      !input.name?.trim() ||
      !store.zones.some((z) => z.zone_id === input.zone_id) ||
      !input.opening_hour ||
      !input.closing_hour ||
      !input.expected_delivery_time ||
      input.expected_delivery_time <= 0 ||
      (input.phone && !/^\d{11}$/.test(input.phone)) ||
      (input.business_type !== "Restaurant" && input.business_type !== "Pharmacy") ||
      (input.business_type === "Restaurant" && (!input.cuisine_type?.trim() || !input.food_category?.trim())) ||
      (input.business_type === "Pharmacy" && !input.pharmacy_type?.trim())
    ) {
      return -1;
    }

    const existing = store.businesses.find((b) => b.partner_id === partnerId);
    if (existing && existing.status !== "Rejected") return -2;

    let businessId: number;
    if (!existing) {
      businessId = nextId(store.businesses.map((b) => b.business_id));
      store.businesses.push({
        business_id: businessId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        link_website: input.link_website?.trim() || null,
        opening_hour: input.opening_hour,
        closing_hour: input.closing_hour,
        expected_delivery_time: input.expected_delivery_time,
        status: "Pending",
        suspension_reason: null,
        partner_id: partnerId,
        zone_id: input.zone_id,
        business_type: input.business_type,
        cuisine_type: input.business_type === "Restaurant" ? input.cuisine_type!.trim() : null,
        food_category: input.business_type === "Restaurant" ? input.food_category!.trim() : null,
        pharmacy_type: input.business_type === "Pharmacy" ? input.pharmacy_type!.trim() : null,
      });
    } else {
      businessId = existing.business_id;
      existing.name = input.name.trim();
      existing.description = input.description?.trim() || null;
      existing.link_website = input.link_website?.trim() || null;
      existing.opening_hour = input.opening_hour;
      existing.closing_hour = input.closing_hour;
      existing.expected_delivery_time = input.expected_delivery_time;
      existing.zone_id = input.zone_id;
      existing.status = "Pending";
      existing.suspension_reason = null;
      existing.business_type = input.business_type;
      existing.cuisine_type = input.business_type === "Restaurant" ? input.cuisine_type!.trim() : null;
      existing.food_category = input.business_type === "Restaurant" ? input.food_category!.trim() : null;
      existing.pharmacy_type = input.business_type === "Pharmacy" ? input.pharmacy_type!.trim() : null;
      store.businessPhones = store.businessPhones.filter((bp) => bp.business_id !== businessId);
    }

    if (input.phone) {
      store.businessPhones.push({ business_id: businessId, phone: input.phone });
    }
    return 0;
  },

  async updateBusinessInfo(
    businessId: number,
    input: { opening_hour?: string | null; closing_hour?: string | null; phone?: string | null; link_website?: string | null }
  ): Promise<number> {
    const store = getStore();
    const biz = store.businesses.find((b) => b.business_id === businessId);
    if (!biz) return -1;
    if (input.phone && !/^\d{11}$/.test(input.phone)) return -1;
    if (input.phone && store.businessPhones.some((bp) => bp.business_id === businessId && bp.phone === input.phone)) {
      return -2;
    }
    if (input.opening_hour) biz.opening_hour = input.opening_hour;
    if (input.closing_hour) biz.closing_hour = input.closing_hour;
    if (input.link_website !== undefined && input.link_website !== null) {
      biz.link_website = input.link_website.trim() || null;
    }
    if (input.phone) {
      store.businessPhones.push({ business_id: businessId, phone: input.phone });
    }
    return 0;
  },

  async getMyProducts(partnerId: number): Promise<PartnerProduct[]> {
    const store = getStore();
    const biz = store.businesses.find((b) => b.partner_id === partnerId);
    if (!biz) return [];
    return store.products
      .filter((p) => p.business_id === biz.business_id)
      .map((p) => ({
        product_id: p.product_id,
        product_name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        discount_amount: p.discount_amount,
        final_price: round2(p.price - p.discount_amount),
        is_available: p.is_available,
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
    const store = getStore();
    const biz = store.businesses.find((b) => b.business_id === businessId);
    if (!biz) return -1;

    let existing: DbProduct | undefined;
    if (input.product_id) {
      existing = store.products.find((p) => p.product_id === input.product_id);
      if (!existing) return -1;
      if (existing.business_id !== businessId) return -3;
    }

    if (
      !input.name?.trim() ||
      !input.category?.trim() ||
      Number.isNaN(input.price) ||
      input.price <= 0 ||
      (existing && existing.discount_amount > 0.5 * input.price)
    ) {
      return -1;
    }
    if (biz.status === "Suspended") return -4;

    if (!existing) {
      store.products.push({
        product_id: nextId(store.products.map((p) => p.product_id)),
        name: input.name.trim(),
        description: input.description?.trim() || null,
        category: input.category.trim(),
        price: round2(input.price),
        discount_amount: 0,
        is_available: input.is_available,
        business_id: businessId,
      });
    } else {
      existing.name = input.name.trim();
      existing.description = input.description?.trim() || null;
      existing.category = input.category.trim();
      existing.price = round2(input.price);
      existing.is_available = input.is_available;
    }
    return 0;
  },

  async toggleProductStatus(productId: number, isAvailable: boolean): Promise<number> {
    const store = getStore();
    const p = store.products.find((pr) => pr.product_id === productId);
    if (!p) return -1;
    const biz = store.businesses.find((b) => b.business_id === p.business_id);
    if (!biz) return -1;
    if (isAvailable && biz.status === "Suspended") return -4;
    p.is_available = isAvailable;
    return 0;
  },

  async setProductPromotion(productId: number, discountAmount: number): Promise<number> {
    const store = getStore();
    const p = store.products.find((pr) => pr.product_id === productId);
    if (!p || Number.isNaN(discountAmount) || discountAmount < 0 || discountAmount > 0.5 * p.price) {
      return -1;
    }
    p.discount_amount = round2(discountAmount);
    return 0;
  },

  async getBusinessSalesReport(businessId: number, fromDate: string, toDate: string): Promise<BusinessSalesRow[]> {
    const store = getStore();
    if (fromDate > toDate) return [];
    const map = new Map<number, BusinessSalesRow>();
    for (const o of store.orders) {
      const d = o.order_date.slice(0, 10);
      if (d < fromDate || d > toDate) continue;
      const sub = store.subOrders.find((s) => s.order_id === o.order_id && s.business_id === businessId && s.status !== "Cancelled");
      if (!sub) continue;
      const items = store.cartItems.filter((ci) => ci.cart_id === o.cart_id);
      for (const ci of items) {
        const p = store.products.find((pr) => pr.product_id === ci.product_id && pr.business_id === businessId);
        if (!p) continue;
        const unit = ci.unit_price ?? p.price - p.discount_amount;
        const cur = map.get(p.product_id) ?? {
          product_id: p.product_id,
          product_name: p.name,
          units_sold: 0,
          revenue_per_product: 0,
        };
        cur.units_sold += ci.quantity;
        cur.revenue_per_product = round2(cur.revenue_per_product + ci.quantity * unit);
        map.set(p.product_id, cur);
      }
    }
    return Array.from(map.values());
  },

  async getBusinessFeedbackOverview(businessId: number): Promise<BusinessFeedbackOverview> {
    const store = getStore();
    const subIds = new Set(store.subOrders.filter((s) => s.business_id === businessId).map((s) => s.suborder_id));
    const fbs = store.feedbacks.filter((f) => subIds.has(f.suborder_id));
    return {
      avg_rating: fbs.length > 0 ? round2(fbs.reduce((a, f) => a + f.rating, 0) / fbs.length) : null,
      number_of_feedbacks: fbs.length,
      five_star: fbs.filter((f) => f.rating === 5).length,
      four_star: fbs.filter((f) => f.rating === 4).length,
      three_star: fbs.filter((f) => f.rating === 3).length,
      two_star: fbs.filter((f) => f.rating === 2).length,
      one_star: fbs.filter((f) => f.rating === 1).length,
    };
  },

  // ---------------- Rider ----------------
  async getRiderProfile(riderId: number): Promise<RiderProfile | null> {
    const store = getStore();
    const r = store.riders.find((rd) => rd.rider_id === riderId);
    const u = store.users.find((usr) => usr.user_id === riderId);
    if (!r || !u) return null;
    const z = store.zones.find((zn) => zn.zone_id === r.zone_id)!;
    return {
      rider_id: r.rider_id,
      rider_name: `${u.first_name} ${u.last_name}`,
      zone_name: z.zone_name,
      vehicle_type: r.vehicle_type,
      plate_no: r.plate_no,
      is_available: r.is_available,
      account_status: u.account_status,
    };
  },

  async setRiderAvailability(riderId: number, isAvailable: boolean): Promise<number> {
    const store = getStore();
    const r = store.riders.find((rd) => rd.rider_id === riderId);
    if (!r) return -3;
    r.is_available = isAvailable;
    return 0;
  },

  async getMyActiveDeliveries(riderId: number): Promise<ActiveDelivery[]> {
    const store = getStore();
    return store.deliveries
      .filter((d) => d.rider_id === riderId)
      .map((d) => {
        const s = store.subOrders.find((so) => so.suborder_id === d.suborder_id);
        if (!s || (s.status !== "Assigned" && s.status !== "Picked Up")) return null;
        const o = store.orders.find((ord) => ord.order_id === s.order_id)!;
        const b = store.businesses.find((bz) => bz.business_id === s.business_id)!;
        const c = store.carts.find((ct) => ct.cart_id === o.cart_id)!;
        const u = store.users.find((usr) => usr.user_id === c.customer_id)!;
        const a = store.addresses.find((ad) => ad.address_id === c.address_id)!;
        const z = store.zones.find((zn) => zn.zone_id === o.zone_id)!;
        return {
          delivery_id: d.delivery_id,
          order_id: o.order_id,
          suborder_id: s.suborder_id,
          business_name: b.name,
          customer_name: `${u.first_name} ${u.last_name}`,
          address_description: a.description,
          zone_name: z.zone_name,
          status: s.status,
          assigned_at: d.assigned_at,
        };
      })
      .filter((x): x is ActiveDelivery => x !== null);
  },

  async markPickedUp(deliveryId: number, riderId?: number): Promise<number> {
    const store = getStore();
    const d = store.deliveries.find((dl) => dl.delivery_id === deliveryId);
    if (!d) return -1;
    if (riderId && d.rider_id !== riderId) return -3;
    const s = store.subOrders.find((so) => so.suborder_id === d.suborder_id);
    if (!s) return -1;
    if (s.status !== "Assigned") return -4;
    s.status = "Picked Up";
    d.picked_up_at = nowDateTimeStr();
    recomputeOrderStatus(store, s.order_id);
    return 0;
  },

  async markDelivered(deliveryId: number, riderId?: number): Promise<number> {
    const store = getStore();
    const d = store.deliveries.find((dl) => dl.delivery_id === deliveryId);
    if (!d) return -1;
    if (riderId && d.rider_id !== riderId) return -3;
    const s = store.subOrders.find((so) => so.suborder_id === d.suborder_id);
    if (!s) return -1;
    if (s.status !== "Picked Up") return -4;

    const now = new Date();
    const picked = d.picked_up_at ? new Date(d.picked_up_at.replace(" ", "T")) : now;
    const mins = Math.max(1, Math.round((now.getTime() - picked.getTime()) / 60000));

    s.status = "Delivered";
    d.delivered_at = nowDateTimeStr();
    d.tracking_time = mins;
    recomputeOrderStatus(store, s.order_id);
    return 0;
  },

  async getMyEarnings(riderId: number, fromDate: string, toDate: string): Promise<RiderEarnings> {
    const store = getStore();
    if (fromDate > toDate) {
      return { completed_deliveries: 0, total_delivery_fees: 0, total_earnings: 0 };
    }
    const matched = store.deliveries.filter((d) => {
      const s = store.subOrders.find((so) => so.suborder_id === d.suborder_id && so.status === "Delivered");
      const dt = d.delivered_at?.slice(0, 10);
      return d.rider_id === riderId && s && dt && dt >= fromDate && dt <= toDate;
    });
    const fees = matched.reduce((acc, d) => {
      const s = store.subOrders.find((so) => so.suborder_id === d.suborder_id)!;
      return acc + s.delivery_fee;
    }, 0);
    return {
      completed_deliveries: matched.length,
      total_delivery_fees: round2(fees),
      total_earnings: round2(fees * 0.8),
    };
  },

  async getMyRatingSummary(riderId: number): Promise<RiderRatingSummary> {
    const ratings = getStore()
      .deliveries.filter((d) => d.rider_id === riderId && d.rider_rating !== null)
      .map((d) => d.rider_rating!);
    return {
      avg_rating: ratings.length > 0 ? round2(ratings.reduce((a, b) => a + b, 0) / ratings.length) : null,
      ratings_count: ratings.length,
      five_star: ratings.filter((r) => r === 5).length,
      four_star: ratings.filter((r) => r === 4).length,
      three_star: ratings.filter((r) => r === 3).length,
      two_star: ratings.filter((r) => r === 2).length,
      one_star: ratings.filter((r) => r === 1).length,
    };
  },

  async getMyDeliveryHistory(riderId: number, fromDate: string, toDate: string): Promise<RiderDeliveryHistoryRow[]> {
    const store = getStore();
    if (fromDate > toDate) return [];
    return store.deliveries
      .filter((d) => d.rider_id === riderId && d.assigned_at.slice(0, 10) >= fromDate && d.assigned_at.slice(0, 10) <= toDate)
      .map((d) => {
        const s = store.subOrders.find((so) => so.suborder_id === d.suborder_id);
        if (!s || (s.status !== "Delivered" && s.status !== "Cancelled")) return null;
        const b = store.businesses.find((bz) => bz.business_id === s.business_id)!;
        return {
          delivery_id: d.delivery_id,
          order_id: s.order_id,
          business_name: b.name,
          status: s.status,
          assigned_at: d.assigned_at,
          picked_up_at: d.picked_up_at,
          delivered_at: d.delivered_at,
          tracking_time: d.tracking_time,
        };
      })
      .filter((x): x is RiderDeliveryHistoryRow => x !== null);
  },

  // ---------------- Customer ----------------
  async getCustomerProfile(customerId: number): Promise<CustomerProfile | null> {
    const store = getStore();
    const c = store.customers.find((cu) => cu.customer_id === customerId);
    const u = store.users.find((usr) => usr.user_id === customerId);
    if (!c || !u) return null;
    const addr = store.addresses.find((a) => a.customer_id === customerId && a.is_active);
    const zone = store.zones.find((z) => z.zone_id === addr?.zone_id);
    return {
      customer_id: c.customer_id,
      customer_name: `${u.first_name} ${u.last_name}`,
      account_status: u.account_status,
      wallet_balance: c.wallet_balance,
      active_address_id: addr?.address_id ?? null,
      active_address: addr?.description ?? null,
      active_zone_id: zone?.zone_id ?? null,
      active_zone: zone?.zone_name ?? null,
    };
  },

  async getMyAddresses(customerId: number): Promise<CustomerAddress[]> {
    const store = getStore();
    return store.addresses
      .filter((a) => a.customer_id === customerId)
      .map((a) => ({
        address_id: a.address_id,
        description: a.description,
        zone_id: a.zone_id,
        zone_name: store.zones.find((z) => z.zone_id === a.zone_id)!.zone_name,
        is_active: a.is_active,
      }));
  },

  async addCustomerAddress(customerId: number, description: string, zoneId: number): Promise<number> {
    const store = getStore();
    if (!store.customers.some((c) => c.customer_id === customerId)) return -3;
    if (!description?.trim() || !store.zones.some((z) => z.zone_id === zoneId)) return -1;
    store.addresses.filter((a) => a.customer_id === customerId).forEach((a) => (a.is_active = false));
    store.addresses.push({
      address_id: nextId(store.addresses.map((a) => a.address_id)),
      description: description.trim(),
      is_active: true,
      customer_id: customerId,
      zone_id: zoneId,
    });
    return 0;
  },

  async updateOrDeleteCustomerAddress(
    customerId: number,
    addressId: number,
    description: string,
    zoneId: number,
    action: "Update" | "Delete" | "Remove"
  ): Promise<number> {
    const store = getStore();
    if (action !== "Update" && action !== "Delete" && action !== "Remove") return -1;
    const addr = store.addresses.find((a) => a.address_id === addressId);
    if (!addr) return -1;
    if (addr.customer_id !== customerId) return -3;

    const hasOpenOrder = store.carts.some(
      (c) =>
        c.address_id === addressId &&
        store.orders.some((o) => o.cart_id === c.cart_id && (o.status === "Placed" || o.status === "In Progress"))
    );
    if (hasOpenOrder) return -4;

    if (action === "Update") {
      if (!description?.trim() || !store.zones.some((z) => z.zone_id === zoneId)) return -1;
      addr.description = description.trim();
      addr.zone_id = zoneId;
      return 0;
    }

    if (store.carts.some((c) => c.address_id === addressId)) return -4;
    const wasActive = addr.is_active;
    store.addresses = store.addresses.filter((a) => a.address_id !== addressId);
    if (wasActive) {
      const next = store.addresses
        .filter((a) => a.customer_id === customerId)
        .sort((a, b) => a.address_id - b.address_id)[0];
      if (next) next.is_active = true;
    }
    return 0;
  },

  async changeActiveAddress(customerId: number, newAddressId: number): Promise<number> {
    const store = getStore();
    if (!store.customers.some((c) => c.customer_id === customerId)) return -3;
    if (!store.addresses.some((a) => a.address_id === newAddressId && a.customer_id === customerId)) return -3;
    store.addresses.filter((a) => a.customer_id === customerId).forEach((a) => {
      a.is_active = a.address_id === newAddressId;
    });
    return 0;
  },

  async getMyCards(customerId: number): Promise<CustomerCard[]> {
    return getStore()
      .cards.filter((c) => c.customer_id === customerId)
      .map((c) => ({
        card_id: c.card_id,
        card_holder_name: c.card_holder_name,
        last_four_digits: c.card_no.slice(-4),
        expiration_date: c.expiration_date,
      }));
  },

  async addCard(
    customerId: number,
    cardNo: string,
    cardHolderName: string,
    expirationDate: string
  ): Promise<number> {
    const store = getStore();
    if (!store.customers.some((c) => c.customer_id === customerId)) return -3;
    if (!/^\d{16}$/.test(cardNo) || !cardHolderName?.trim() || !expirationDate || expirationDate < nowDateStr()) {
      return -1;
    }
    if (store.cards.some((c) => c.customer_id === customerId && c.card_no === cardNo)) return -2;
    store.cards.push({
      card_id: nextId(store.cards.map((c) => c.card_id)),
      card_no: cardNo,
      card_holder_name: cardHolderName.trim(),
      expiration_date: expirationDate,
      customer_id: customerId,
    });
    return 0;
  },

  async getMyActiveCartId(customerId: number): Promise<number | null> {
    const store = getStore();
    const activeAddr = activeAddressId(store, customerId);
    if (!activeAddr) return null;
    const cart = store.carts.find(
      (c) => c.customer_id === customerId && c.status === "Active" && c.address_id === activeAddr
    );
    return cart?.cart_id ?? null;
  },

  async getCartItems(cartId: number): Promise<CartItemRow[]> {
    const store = getStore();
    return store.cartItems
      .filter((ci) => ci.cart_id === cartId)
      .map((ci) => {
        const p = store.products.find((pr) => pr.product_id === ci.product_id)!;
        const b = store.businesses.find((bz) => bz.business_id === p.business_id)!;
        const unit = round2(p.price - p.discount_amount);
        return {
          product_id: p.product_id,
          product_name: p.name,
          business_id: b.business_id,
          business_name: b.name,
          quantity: ci.quantity,
          notes: ci.notes,
          unit_price: unit,
          line_total: round2(ci.quantity * unit),
          is_available: p.is_available,
        };
      });
  },

  async getMyVouchers(customerId: number): Promise<CustomerVoucher[]> {
    const today = nowDateStr();
    return getStore()
      .vouchers.filter((v) => v.customer_id === customerId && v.status === "Unused" && v.expiry_date >= today)
      .map((v) => ({
        voucher_id: v.voucher_id,
        promo_code: v.promo_code,
        is_percentage: v.is_percentage,
        amount: v.amount,
        expiry_date: v.expiry_date,
      }));
  },

  async createCart(customerId: number): Promise<number> {
    const store = getStore();
    if (!store.customers.some((c) => c.customer_id === customerId)) return -3;
    const u = store.users.find((usr) => usr.user_id === customerId);
    if (u?.account_status === "Blacklisted") return -3;
    const addrId = activeAddressId(store, customerId);
    if (!addrId) return -1;
    if (store.carts.some((c) => c.address_id === addrId && c.status === "Active")) return -2;
    store.carts.push({
      cart_id: nextId(store.carts.map((c) => c.cart_id)),
      status: "Active",
      created_at: nowDateTimeStr(),
      customer_id: customerId,
      address_id: addrId,
    });
    return 0;
  },

  async addToCart(cartId: number, productId: number, quantity: number, notes: string | null): Promise<number> {
    const store = getStore();
    const cart = store.carts.find((c) => c.cart_id === cartId);
    if (!cart) return -1;
    const p = store.products.find((pr) => pr.product_id === productId);
    const b = p ? store.businesses.find((bz) => bz.business_id === p.business_id) : undefined;
    if (!p || !b) return -1;

    if (!quantity || quantity < 1) return -1;
    if (quantity > 10) return -6;
    if (cart.status !== "Active") return -4;
    if ((activeAddressId(store, cart.customer_id) ?? 0) !== cart.address_id) return -4;
    if (!p.is_available || b.status !== "Active") return -4;
    const addr = store.addresses.find((a) => a.address_id === cart.address_id);
    if (!addr || b.zone_id !== addr.zone_id) return -5;

    const existing = store.cartItems.find((ci) => ci.cart_id === cartId && ci.product_id === productId);
    if ((existing?.quantity ?? 0) + quantity > 10) return -6;

    if (!existing) {
      store.cartItems.push({
        cart_id: cartId,
        product_id: productId,
        quantity,
        notes: notes?.trim() || null,
        unit_price: null,
      });
    } else {
      existing.quantity += quantity;
      if (notes?.trim()) existing.notes = notes.trim();
    }
    return 0;
  },

  async removeFromCart(cartId: number, productId: number): Promise<number> {
    const store = getStore();
    const cart = store.carts.find((c) => c.cart_id === cartId);
    if (!cart) return -1;
    if (cart.status !== "Active") return -4;
    if ((activeAddressId(store, cart.customer_id) ?? 0) !== cart.address_id) return -4;
    const idx = store.cartItems.findIndex((ci) => ci.cart_id === cartId && ci.product_id === productId);
    if (idx === -1) return -1;
    store.cartItems.splice(idx, 1);
    return 0;
  },

  async calculateVoucherDiscount(voucherId: number | null, orderSubtotal: number): Promise<number> {
    if (orderSubtotal < 0) return -1;
    if (!voucherId) return 0;
    const today = nowDateStr();
    const v = getStore().vouchers.find(
      (vr) => vr.voucher_id === voucherId && vr.status === "Unused" && vr.expiry_date >= today
    );
    if (!v) return 0;
    const disc = v.is_percentage ? (orderSubtotal * v.amount) / 100 : v.amount;
    return round2(Math.min(disc, orderSubtotal));
  },

  async checkoutCart(
    cartId: number,
    voucherId: number | null,
    paymentMethod: PaymentMethod,
    cardId: number | null
  ): Promise<number> {
    const store = getStore();
    const cart = store.carts.find((c) => c.cart_id === cartId);
    if (!cart || !["Cash", "Card", "Wallet"].includes(paymentMethod)) return -1;
    const custUser = store.users.find((u) => u.user_id === cart.customer_id);
    if (custUser?.account_status === "Blacklisted") return -3;
    if (cart.status !== "Active") return -4;
    if ((activeAddressId(store, cart.customer_id) ?? 0) !== cart.address_id) return -4;

    const items = store.cartItems.filter((ci) => ci.cart_id === cartId);
    if (items.length === 0) return -9;

    const addr = store.addresses.find((a) => a.address_id === cart.address_id)!;
    const zone = store.zones.find((z) => z.zone_id === addr.zone_id)!;
    const today = nowDateStr();
    const nowTime = nowTimeStr();

    for (const ci of items) {
      const p = store.products.find((pr) => pr.product_id === ci.product_id)!;
      const b = store.businesses.find((bz) => bz.business_id === p.business_id)!;
      if (!p.is_available || b.status !== "Active") return -4;
      if (b.zone_id !== addr.zone_id) return -5;
      if (!isBusinessOpen(b.opening_hour, b.closing_hour, nowTime)) return -4;
    }

    if (voucherId !== null) {
      const v = store.vouchers.find((vr) => vr.voucher_id === voucherId);
      if (!v || v.expiry_date < today) return -1;
      if (v.customer_id !== cart.customer_id) return -3;
      if (v.status !== "Unused") return -4;
    }

    let subtotal = 0;
    const bizMap = new Map<number, number>();
    for (const ci of items) {
      const p = store.products.find((pr) => pr.product_id === ci.product_id)!;
      const unit = round2(p.price - p.discount_amount);
      subtotal += ci.quantity * unit;
      bizMap.set(p.business_id, (bizMap.get(p.business_id) ?? 0) + ci.quantity * unit);
    }
    subtotal = round2(subtotal);
    const fees = round2(bizMap.size * zone.delivery_fee);
    const discount = await this.calculateVoucherDiscount(voucherId, subtotal);
    const total = round2(subtotal + fees - discount);

    if (paymentMethod === "Card") {
      const card = store.cards.find(
        (c) => c.card_id === cardId && c.customer_id === cart.customer_id && c.expiration_date >= today
      );
      if (!card) return -7;
    }
    const cust = store.customers.find((c) => c.customer_id === cart.customer_id)!;
    if (paymentMethod === "Wallet" && cust.wallet_balance < total) return -7;

    if (leastBusyRider(store, zone.zone_id) === null) return -8;

    // Lock unit prices
    for (const ci of items) {
      const p = store.products.find((pr) => pr.product_id === ci.product_id)!;
      ci.unit_price = round2(p.price - p.discount_amount);
    }

    const orderId = nextId(store.orders.map((o) => o.order_id));
    store.orders.push({
      order_id: orderId,
      order_date: nowDateTimeStr(),
      status: "Placed",
      discount_amount: discount,
      total_amount: total,
      cart_id: cartId,
      zone_id: zone.zone_id,
      voucher_id: voucherId,
    });

    const sortedBizIds = Array.from(bizMap.keys()).sort((a, b) => a - b);
    for (const bId of sortedBizIds) {
      const subId = nextId(store.subOrders.map((s) => s.suborder_id));
      const riderId = leastBusyRider(store, zone.zone_id)!;
      store.subOrders.push({
        suborder_id: subId,
        status: "Assigned",
        total_price: round2(bizMap.get(bId)!),
        delivery_fee: zone.delivery_fee,
        order_id: orderId,
        business_id: bId,
      });
      store.deliveries.push({
        delivery_id: nextId(store.deliveries.map((d) => d.delivery_id)),
        assigned_at: nowDateTimeStr(),
        picked_up_at: null,
        delivered_at: null,
        tracking_time: null,
        rider_rating: null,
        suborder_id: subId,
        rider_id: riderId,
      });
    }

    if (voucherId !== null) {
      const v = store.vouchers.find((vr) => vr.voucher_id === voucherId);
      if (v) v.status = "Used";
    }

    store.payments.push({
      payment_id: nextId(store.payments.map((p) => p.payment_id)),
      amount: total,
      currency: "EGP",
      method: paymentMethod,
      transaction_date: nowDateTimeStr(),
      refunded_amount: 0,
      order_id: orderId,
      card_id: paymentMethod === "Card" ? cardId : null,
    });

    if (paymentMethod === "Wallet") {
      cust.wallet_balance = round2(cust.wallet_balance - total);
    }
    cart.status = "Checked Out";
    return 0;
  },

  async searchPlatform(customerId: number, keyword: string): Promise<BrowseBusinessItem[]> {
    const store = getStore();
    const addrId = activeAddressId(store, customerId);
    const addr = store.addresses.find((a) => a.address_id === addrId);
    if (!addr || !keyword?.trim()) return [];
    const kw = keyword.trim().toLowerCase();
    const ratings = await this.getBusinessRatingsSummary();

    return store.businesses
      .filter((b) => b.status === "Active" && b.zone_id === addr.zone_id && b.name.toLowerCase().includes(kw))
      .map((b) => {
        const lower = b.name.toLowerCase();
        const priority = lower === kw ? 1 : lower.startsWith(kw) ? 2 : 3;
        const r = ratings.find((rt) => rt.business_id === b.business_id);
        const z = store.zones.find((zn) => zn.zone_id === b.zone_id)!;
        return {
          business_id: b.business_id,
          business_name: b.name,
          business_type: b.business_type,
          zone_name: z.zone_name,
          same_zone: true,
          avg_rating: r?.avg_rating ?? null,
          ratings_count: r?.ratings_count ?? 0,
          is_open_now: isBusinessOpen(b.opening_hour, b.closing_hour),
          expected_delivery_time: b.expected_delivery_time,
          priority,
        };
      })
      .sort((a, b) => (a.priority ?? 3) - (b.priority ?? 3) || a.business_id - b.business_id);
  },

  async nearbyBusinessesByCategory(addressId: number, category: string): Promise<BrowseBusinessItem[]> {
    const store = getStore();
    const addr = store.addresses.find((a) => a.address_id === addressId);
    if (!addr) return [];
    const zonePerf = await this.getZoneDeliveryPerformance();
    const ratings = await this.getBusinessRatingsSummary();

    return store.businesses
      .filter(
        (b) =>
          b.status === "Active" &&
          store.products.some(
            (p) => p.business_id === b.business_id && p.is_available && p.category.toLowerCase() === category.toLowerCase()
          )
      )
      .map((b) => {
        const z = store.zones.find((zn) => zn.zone_id === b.zone_id)!;
        const zp = zonePerf.find((p) => p.zone_id === b.zone_id);
        const r = ratings.find((rt) => rt.business_id === b.business_id);
        return {
          business_id: b.business_id,
          business_name: b.name,
          business_type: b.business_type,
          zone_name: z.zone_name,
          same_zone: b.zone_id === addr.zone_id,
          zone_avg_delivery_time: zp?.avg_tracking_time ?? null,
          avg_rating: r?.avg_rating ?? null,
          ratings_count: r?.ratings_count ?? 0,
          is_open_now: isBusinessOpen(b.opening_hour, b.closing_hour),
          expected_delivery_time: b.expected_delivery_time,
        };
      })
      .sort((a, b) => {
        if (a.same_zone !== b.same_zone) return a.same_zone ? -1 : 1;
        return (a.zone_avg_delivery_time ?? 999) - (b.zone_avg_delivery_time ?? 999) || a.business_id - b.business_id;
      });
  },

  async browseActiveBusinesses(customerId: number): Promise<BrowseBusinessItem[]> {
    const store = getStore();
    const addrId = activeAddressId(store, customerId);
    const addr = store.addresses.find((a) => a.address_id === addrId);
    const zonePerf = await this.getZoneDeliveryPerformance();
    const ratings = await this.getBusinessRatingsSummary();

    return store.businesses
      .filter((b) => b.status === "Active")
      .map((b) => {
        const z = store.zones.find((zn) => zn.zone_id === b.zone_id)!;
        const zp = zonePerf.find((p) => p.zone_id === b.zone_id);
        const r = ratings.find((rt) => rt.business_id === b.business_id);
        return {
          business_id: b.business_id,
          business_name: b.name,
          business_type: b.business_type,
          zone_name: z.zone_name,
          same_zone: addr ? b.zone_id === addr.zone_id : false,
          zone_avg_delivery_time: zp?.avg_tracking_time ?? null,
          avg_rating: r?.avg_rating ?? null,
          ratings_count: r?.ratings_count ?? 0,
          is_open_now: isBusinessOpen(b.opening_hour, b.closing_hour),
          expected_delivery_time: b.expected_delivery_time,
        };
      })
      .sort((a, b) => (a.same_zone === b.same_zone ? a.business_id - b.business_id : a.same_zone ? -1 : 1));
  },

  async getProductCategories(): Promise<string[]> {
    const cats = new Set(
      getStore()
        .products.filter((p) => p.is_available)
        .map((p) => p.category)
    );
    return Array.from(cats).sort();
  },

  async getBusinessDetails(businessId: number): Promise<BusinessDetails | null> {
    const store = getStore();
    const b = store.businesses.find((bz) => bz.business_id === businessId);
    if (!b) return null;
    const z = store.zones.find((zn) => zn.zone_id === b.zone_id)!;
    const subIds = new Set(store.subOrders.filter((s) => s.business_id === b.business_id).map((s) => s.suborder_id));
    const fbs = store.feedbacks.filter((f) => subIds.has(f.suborder_id));
    return {
      business_id: b.business_id,
      business_name: b.name,
      description: b.description,
      link_website: b.link_website,
      zone_name: z.zone_name,
      zone_id: b.zone_id,
      opening_hour: b.opening_hour,
      closing_hour: b.closing_hour,
      is_open_now: isBusinessOpen(b.opening_hour, b.closing_hour),
      expected_delivery_time: b.expected_delivery_time,
      status: b.status,
      avg_rating: fbs.length > 0 ? round2(fbs.reduce((a, f) => a + f.rating, 0) / fbs.length) : null,
      number_of_ratings: fbs.length,
    };
  },

  async getBusinessProducts(businessId: number): Promise<PublicProduct[]> {
    const store = getStore();
    const b = store.businesses.find((bz) => bz.business_id === businessId);
    if (!b || b.status !== "Active") return [];
    return store.products
      .filter((p) => p.business_id === businessId && p.is_available)
      .map((p) => ({
        product_id: p.product_id,
        product_name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        discount_amount: p.discount_amount,
        final_price: round2(p.price - p.discount_amount),
      }));
  },

  async toggleFavorite(customerId: number, itemId: number, itemType: "Business" | "Product"): Promise<number> {
    const store = getStore();
    if (!store.customers.some((c) => c.customer_id === customerId)) return -3;
    if (itemType === "Business") {
      if (!store.businesses.some((b) => b.business_id === itemId)) return -1;
      const idx = store.favoriteBusinesses.findIndex(
        (fb) => fb.customer_id === customerId && fb.business_id === itemId
      );
      if (idx >= 0) store.favoriteBusinesses.splice(idx, 1);
      else store.favoriteBusinesses.push({ customer_id: customerId, business_id: itemId });
      return 0;
    }
    if (itemType === "Product") {
      if (!store.products.some((p) => p.product_id === itemId)) return -1;
      const idx = store.favoriteProducts.findIndex(
        (fp) => fp.customer_id === customerId && fp.product_id === itemId
      );
      if (idx >= 0) store.favoriteProducts.splice(idx, 1);
      else store.favoriteProducts.push({ customer_id: customerId, product_id: itemId });
      return 0;
    }
    return -1;
  },

  async getFavoriteIds(customerId: number): Promise<{ businessIds: number[]; productIds: number[] }> {
    const store = getStore();
    return {
      businessIds: store.favoriteBusinesses.filter((f) => f.customer_id === customerId).map((f) => f.business_id),
      productIds: store.favoriteProducts.filter((f) => f.customer_id === customerId).map((f) => f.product_id),
    };
  },

  async getMyFavorites(customerId: number): Promise<FavoriteProductRow[]> {
    const store = getStore();
    return store.favoriteProducts
      .filter((fp) => fp.customer_id === customerId)
      .map((fp) => {
        const p = store.products.find((pr) => pr.product_id === fp.product_id)!;
        const b = store.businesses.find((bz) => bz.business_id === p.business_id)!;
        return {
          product_id: p.product_id,
          product_name: p.name,
          business_name: b.name,
          business_id: b.business_id,
          is_orderable: p.is_available && b.status === "Active",
        };
      });
  },

  async getRecommendedProducts(customerId: number): Promise<RecommendedProductRow[]> {
    const store = getStore();
    const addrId = activeAddressId(store, customerId);
    const addr = store.addresses.find((a) => a.address_id === addrId);
    if (!addr) return [];

    const orderedProductIds = new Set<number>();
    const categoryFreq = new Map<string, number>();
    for (const o of store.orders) {
      const c = store.carts.find((ct) => ct.cart_id === o.cart_id && ct.customer_id === customerId);
      if (!c) continue;
      for (const ci of store.cartItems.filter((item) => item.cart_id === c.cart_id)) {
        orderedProductIds.add(ci.product_id);
        const p = store.products.find((pr) => pr.product_id === ci.product_id);
        if (p) categoryFreq.set(p.category, (categoryFreq.get(p.category) ?? 0) + 1);
      }
    }

    return store.products
      .filter((p) => {
        const b = store.businesses.find((bz) => bz.business_id === p.business_id);
        return (
          p.is_available &&
          b?.status === "Active" &&
          b.zone_id === addr.zone_id &&
          categoryFreq.has(p.category) &&
          !orderedProductIds.has(p.product_id)
        );
      })
      .sort((a, b) => (categoryFreq.get(b.category) ?? 0) - (categoryFreq.get(a.category) ?? 0) || a.product_id - b.product_id)
      .slice(0, 10)
      .map((p) => {
        const b = store.businesses.find((bz) => bz.business_id === p.business_id)!;
        return {
          product_id: p.product_id,
          product_name: p.name,
          business_name: b.name,
          business_id: b.business_id,
          category: p.category,
          final_price: round2(p.price - p.discount_amount),
        };
      });
  },

  async getMyOrderHistory(customerId: number): Promise<CustomerOrderRow[]> {
    const store = getStore();
    const customerCartIds = new Set(store.carts.filter((c) => c.customer_id === customerId).map((c) => c.cart_id));
    return store.orders
      .filter((o) => customerCartIds.has(o.cart_id))
      .sort((a, b) => b.order_id - a.order_id)
      .map((o) => {
        const z = store.zones.find((zn) => zn.zone_id === o.zone_id)!;
        const pay = store.payments.find((p) => p.order_id === o.order_id);
        return {
          order_id: o.order_id,
          order_date: o.order_date,
          zone_name: z.zone_name,
          status: o.status,
          number_of_suborders: store.subOrders.filter((s) => s.order_id === o.order_id).length,
          discount_amount: o.discount_amount,
          total_amount: o.total_amount,
          payment_method: pay?.method ?? null,
          refunded_amount: pay?.refunded_amount ?? 0,
        };
      });
  },

  async getOrderSubOrders(orderId: number): Promise<OrderSubOrderRow[]> {
    const store = getStore();
    return store.subOrders
      .filter((s) => s.order_id === orderId)
      .map((s) => {
        const b = store.businesses.find((bz) => bz.business_id === s.business_id)!;
        const d = store.deliveries.find((dl) => dl.suborder_id === s.suborder_id);
        const ru = d ? store.users.find((u) => u.user_id === d.rider_id) : undefined;
        return {
          suborder_id: s.suborder_id,
          business_id: b.business_id,
          business_name: b.name,
          status: s.status,
          total_price: s.total_price,
          delivery_fee: s.delivery_fee,
          delivery_id: d?.delivery_id ?? null,
          rider_name: ru ? `${ru.first_name} ${ru.last_name}` : null,
          assigned_at: d?.assigned_at ?? null,
          picked_up_at: d?.picked_up_at ?? null,
          delivered_at: d?.delivered_at ?? null,
          expected_delivery_time: b.expected_delivery_time,
          has_feedback: store.feedbacks.some((f) => f.suborder_id === s.suborder_id),
          rider_rating: d?.rider_rating ?? null,
        };
      });
  },

  async cancelOrder(orderId: number, customerId?: number): Promise<number> {
    const store = getStore();
    const order = store.orders.find((o) => o.order_id === orderId);
    if (!order) return -1;
    if (customerId) {
      const cart = store.carts.find((c) => c.cart_id === order.cart_id);
      if (cart?.customer_id !== customerId) return -3;
    }
    if (order.status === "Cancelled") return -4;
    const subs = store.subOrders.filter((s) => s.order_id === orderId);
    if (subs.some((s) => s.status === "Picked Up" || s.status === "Delivered")) return -4;

    subs.forEach((s) => {
      if (s.status === "Placed" || s.status === "Assigned") s.status = "Cancelled";
    });
    recomputeOrderStatus(store, orderId);
    const pay = store.payments.find((p) => p.order_id === orderId);
    if (pay) {
      refundOrder(store, orderId, pay.amount - pay.refunded_amount);
    }
    restoreVoucherIfCancelled(store, orderId);
    return 0;
  },

  async reorder(orderId: number, addressId: number, customerId?: number): Promise<number> {
    const store = getStore();
    const order = store.orders.find((o) => o.order_id === orderId);
    if (!order) return -1;
    const oldCart = store.carts.find((c) => c.cart_id === order.cart_id)!;
    const ownerId = customerId ?? oldCart.customer_id;
    if (oldCart.customer_id !== ownerId) return -3;

    const custUser = store.users.find((u) => u.user_id === ownerId);
    if (custUser?.account_status === "Blacklisted") return -3;

    const addr = store.addresses.find((a) => a.address_id === addressId);
    if (!addr || addr.customer_id !== ownerId) return -3;
    if (addr.zone_id !== order.zone_id) return -5;
    if (store.carts.some((c) => c.address_id === addressId && c.status === "Active")) return -2;

    const oldItems = store.cartItems.filter((ci) => ci.cart_id === oldCart.cart_id);
    const copyable = oldItems.filter((ci) => {
      const p = store.products.find((pr) => pr.product_id === ci.product_id);
      const b = p ? store.businesses.find((bz) => bz.business_id === p.business_id) : undefined;
      return Boolean(p?.is_available && b?.status === "Active" && b.zone_id === addr.zone_id);
    });
    if (copyable.length === 0) return -9;

    store.addresses.filter((a) => a.customer_id === ownerId).forEach((a) => {
      a.is_active = a.address_id === addressId;
    });
    const newCartId = nextId(store.carts.map((c) => c.cart_id));
    store.carts.push({
      cart_id: newCartId,
      status: "Active",
      created_at: nowDateTimeStr(),
      customer_id: ownerId,
      address_id: addressId,
    });
    for (const item of copyable) {
      store.cartItems.push({
        cart_id: newCartId,
        product_id: item.product_id,
        quantity: item.quantity,
        notes: item.notes,
        unit_price: null,
      });
    }
    return 0;
  },

  async submitFeedback(
    suborderId: number,
    headline: string,
    description: string | null,
    rating: number
  ): Promise<number> {
    const store = getStore();
    const s = store.subOrders.find((so) => so.suborder_id === suborderId);
    if (!s || !headline?.trim() || !rating || rating < 1 || rating > 5) return -1;
    if (s.status !== "Delivered") return -4;
    if (store.feedbacks.some((f) => f.suborder_id === suborderId)) return -2;
    store.feedbacks.push({
      feedback_id: nextId(store.feedbacks.map((f) => f.feedback_id)),
      headline: headline.trim(),
      description: description?.trim() || null,
      rating,
      feedback_date: nowDateTimeStr(),
      suborder_id: suborderId,
    });
    return 0;
  },

  async rateRider(suborderId: number, riderRating: number): Promise<number> {
    const store = getStore();
    const s = store.subOrders.find((so) => so.suborder_id === suborderId);
    if (!s || !riderRating || riderRating < 1 || riderRating > 5) return -1;
    if (s.status !== "Delivered") return -4;
    const d = store.deliveries.find((dl) => dl.suborder_id === suborderId);
    if (!d) return -4;
    if (d.rider_rating !== null) return -2;
    d.rider_rating = riderRating;
    return 0;
  },
};
