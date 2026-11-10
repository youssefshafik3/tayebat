-- Youssef Sameh 64-10650
CREATE PROCEDURE dropAllProceduresFunctionsViews
AS

    DROP PROCEDURE IF EXISTS Helper_Recompute_Order_Status, createAllTables, dropAllTables,
    clearAllTables, Suspend_Business, Reinstate_Business, Create_Zone, Update_Zone_Fee;
    DROP FUNCTION IF EXISTS dbo.ZoneOrderReport, dbo.Daily_Revenue_Report;
    DROP VIEW IF EXISTS BusinessesPerZone;

    RETURN 0;
GO