-- Youssef Sameh 64-10650
CREATE PROCEDURE Suspend_Business
    @business_id INT, @admin_id INT, @reason VARCHAR(255)
AS
    DECLARE @admin_role VARCHAR(20);

    SELECT @admin_role = role
    FROM Admin
    WHERE admin_id = @admin_id;

    IF @admin_role = 'Zone Admin'
    BEGIN
        DECLARE @business_zone_id INT;
        DECLARE @admin_zone_id INT;

        SELECT @business_zone_id = zone_id
        FROM Business
        WHERE business_id = @business_id;

        SELECT @admin_zone_id = zone_id
        FROM Admin
        WHERE admin_id = @admin_id;
        
        IF @admin_zone_id <> business_zone_id
        BEGIN
            RETURN -3;
        END
    END

    DECLARE @business_status VARCHAR(20);

    SELECT @business_status = status
    FROM Business
    WHERE business_id = @business_id;
    
    IF @business_status <> 'Active'
    BEGIN
        RETURN -4;
    END

    UPDATE Business
    SET status = 'Suspended', reason = @reason
    WHERE business_id = @business_id;

    UPDATE Product
    SET is_available = 0
    WHERE business_id = @business_id;

    SELECT O.order_id, O.voucher_id
    INTO #EditedOrders
    FROM Orders O JOIN SubOrder S ON O.order_id = S.order_id
    AND S.business_id = @business_id
    AND S.status IN ('Placed', 'Assigned');

    UPDATE Suborder
    SET status = 'Cancelled'
    WHERE business_id = @business_id
    AND status IN ('Placed', 'Assigned');

    SELECT 
        O.order_id, 
        ROW_NUMBER() OVER (ORDER BY O.order_id) AS RowNum
    INTO #TempOrders
    FROM Orders O
    INNER JOIN SubOrder S ON O.order_id = S.order_id
    WHERE S.business_id = @business_id;

    DECLARE @i INT = 1;
    DECLARE @max INT = (SELECT COUNT(*) FROM #TempOrders);
    DECLARE @curr_order_id INT;

    WHILE @i <= @max
    BEGIN
        SELECT @curr_order_id = order_id 
        FROM #TempOrders 
        WHERE RowNum = @i;

        EXEC Helper_Recompute_Order_Status @order_id = @curr_order_id;

        SET @i = @i + 1;
    END;

    DROP TABLE #TempOrders;

    UPDATE Voucher
    SET status = 'Unused'
    WHERE voucher_id IN (
        SELECT voucher_id
        FROM #EditedOrders EO JOIN Orders O ON EO.order_id = O.order_id
        WHERE O.status = 'Cancelled'
    );

    UPDATE Orders
    SET voucher_id = NULL
    WHERE order_id IN (
        SELECT order_id
        FROM #EditedOrders EO JOIN Orders O ON EO.order_id = O.order_id
        WHERE O.status = 'Cancelled'
    );

    DROP TABLE #EditedOrders;
    RETURN 0;
GO