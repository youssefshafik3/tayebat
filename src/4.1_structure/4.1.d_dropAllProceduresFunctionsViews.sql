-- Youssef Sameh 64-10650
CREATE PROCEDURE dropAllProceduresFunctionsViews
AS
BEGIN

    -- Views

    DROP VIEW IF EXISTS allBusinessProfiles;
    DROP VIEW IF EXISTS BusinessesPerZone;
    DROP VIEW IF EXISTS BusinessRatingsSummary;
    DROP VIEW IF EXISTS ActiveVouchers;
    DROP VIEW IF EXISTS PendingBusinessApprovals;
    DROP VIEW IF EXISTS RiderPerformanceSummary;
    DROP VIEW IF EXISTS TopSellingProducts;
    DROP VIEW IF EXISTS ZoneDeliveryPerformance;

    -- Functions

    DROP FUNCTION IF EXISTS CustomerLoginValidation;
    DROP FUNCTION IF EXISTS PartnerLoginValidation;
    DROP FUNCTION IF EXISTS RiderLoginValidation;
    DROP FUNCTION IF EXISTS AdminLoginValidation;
    DROP FUNCTION IF EXISTS ZoneOrderReport;
    DROP FUNCTION IF EXISTS TopRiders;
    DROP FUNCTION IF EXISTS Daily_Revenue_Report;
    DROP FUNCTION IF EXISTS BusinessSalesReport;
    DROP FUNCTION IF EXISTS BusinessFeedbackOverview;
    DROP FUNCTION IF EXISTS Calculate_Voucher_Discount;
    DROP FUNCTION IF EXISTS My_Order_History;
    DROP FUNCTION IF EXISTS My_Favorites;
    DROP FUNCTION IF EXISTS Recommended_Products;
    DROP FUNCTION IF EXISTS My_Active_Deliveries;
    DROP FUNCTION IF EXISTS My_Earnings;
    DROP FUNCTION IF EXISTS My_Rating_Summary;
    DROP FUNCTION IF EXISTS My_Delivery_History;
    DROP FUNCTION IF EXISTS Search_Platform;
    DROP FUNCTION IF EXISTS Reconcile_Order_Totals;
    DROP FUNCTION IF EXISTS Nearby_Businesses_By_Category;
    DROP FUNCTION IF EXISTS Platform_Health_Snapshot;

    -- Procedures

    DROP PROCEDURE IF EXISTS createAllTables;
    DROP PROCEDURE IF EXISTS dropAllTables;
    DROP PROCEDURE IF EXISTS Customer_Register;
    DROP PROCEDURE IF EXISTS Partner_Register;
    DROP PROCEDURE IF EXISTS Rider_Register;
    DROP PROCEDURE IF EXISTS Change_Password;
    DROP PROCEDURE IF EXISTS Create_Admin;
    DROP PROCEDURE IF EXISTS Approve_Business;
    DROP PROCEDURE IF EXISTS Reject_Business;
    DROP PROCEDURE IF EXISTS Suspend_Business;
    DROP PROCEDURE IF EXISTS Reinstate_Business;
    DROP PROCEDURE IF EXISTS Create_Zone;
    DROP PROCEDURE IF EXISTS Update_Zone_Fee;
    DROP PROCEDURE IF EXISTS Assign_Admin_Zone;
    DROP PROCEDURE IF EXISTS Issue_Voucher;
    DROP PROCEDURE IF EXISTS Blacklist_Customer;
    DROP PROCEDURE IF EXISTS Lift_Customer_Blacklist;
    DROP PROCEDURE IF EXISTS Register_Business;
    DROP PROCEDURE IF EXISTS Update_Business_Info;
    DROP PROCEDURE IF EXISTS Upsert_Product;
    DROP PROCEDURE IF EXISTS Toggle_Product_Status;
    DROP PROCEDURE IF EXISTS Set_Product_Promotion;
    DROP PROCEDURE IF EXISTS Add_Customer_Address;
    DROP PROCEDURE IF EXISTS Update_Delete_Customer_Address;
    DROP PROCEDURE IF EXISTS Change_Active_Address;
    DROP PROCEDURE IF EXISTS Add_Card;
    DROP PROCEDURE IF EXISTS Create_Cart;
    DROP PROCEDURE IF EXISTS Add_To_Cart;
    DROP PROCEDURE IF EXISTS Remove_From_Cart;
    DROP PROCEDURE IF EXISTS Checkout_Cart;
    DROP PROCEDURE IF EXISTS Cancel_Order;
    DROP PROCEDURE IF EXISTS Reorder;
    DROP PROCEDURE IF EXISTS Submit_Feedback;
    DROP PROCEDURE IF EXISTS Rate_Rider;
    DROP PROCEDURE IF EXISTS Toggle_Favorite;
    DROP PROCEDURE IF EXISTS Set_Rider_Availability;
    DROP PROCEDURE IF EXISTS Mark_Picked_Up;
    DROP PROCEDURE IF EXISTS Mark_Delivered;
    DROP PROCEDURE IF EXISTS Helper_Recompute_Order_Status;

    RETURN 0;

END;
GO