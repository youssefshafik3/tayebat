-- Youssef Sameh 64-10650
CREATE OR ALTER PROCEDURE Suspend_Business
    @business_id INT, @admin_id INT, @reason VARCHAR(255)
AS
    IF @admin_id IS NULL OR @business_id IS NULL OR @reason IS NULL OR LTRIM(RTRIM(@reason)) = ''
        RETURN -1;

    IF NOT EXISTS (SELECT *
                    FROM Admin
                    WHERE admin_id = @admin_id)
        RETURN -3;

    IF NOT EXISTS (SELECT *
                    FROM Business
                    WHERE business_id = @business_id)
        RETURN -1;

    DECLARE @admin_role VARCHAR(20);

    SELECT @admin_role = role
    FROM Admin
    WHERE admin_id = @admin_id;

    DECLARE @business_zone_id INT;
    DECLARE @admin_zone_id INT;

    SELECT @business_zone_id = zone_id
    FROM Business
    WHERE business_id = @business_id;

    SELECT @admin_zone_id = zone_id
    FROM Admin
    WHERE admin_id = @admin_id;
        
    IF @admin_role = 'Zone Admin' AND @admin_zone_id <> @business_zone_id
        RETURN -3;

    DECLARE @business_status VARCHAR(20);

    SELECT @business_status = status
    FROM Business
    WHERE business_id = @business_id;
    
    IF @business_status <> 'Active'
    BEGIN
        RETURN -4;
    END

    UPDATE Business
    SET status = 'Suspended', suspension_reason = @reason
    WHERE business_id = @business_id;

    UPDATE Product
    SET is_available = 0
    WHERE business_id = @business_id;

    SELECT O.order_id, O.voucher_id
    INTO #EditedOrders
    FROM Orders O JOIN SubOrder S ON O.order_id = S.order_id
    AND S.business_id = @business_id
    AND S.status IN ('Placed', 'Assigned');

    SELECT S.order_id, S.suborder_id, S.total_price, S.delivery_fee
    INTO #EditedSubOrders
    FROM SubOrder S
    WHERE S.business_id = @business_id
    AND S.status IN ('Placed', 'Assigned');

    UPDATE Suborder
    SET status = 'Cancelled'
    WHERE business_id = @business_id
    AND status IN ('Placed', 'Assigned');

    SELECT 
        P.payment_id,
        P.order_id,
        P.method,
        CASE 
            WHEN P.refunded_amount + ESO.raw_refund > P.amount 
                THEN P.amount - P.refunded_amount
            ELSE ESO.raw_refund
        END AS actual_refund
    INTO #OrderRefunds
    FROM Payment P
    INNER JOIN (
        SELECT order_id, SUM(total_price + delivery_fee) AS raw_refund
        FROM #EditedSubOrders
        GROUP BY order_id
    ) ESO ON P.order_id = ESO.order_id;

    UPDATE P
    SET P.refunded_amount = P.refunded_amount + R.actual_refund
    FROM Payment P
    INNER JOIN #OrderRefunds R ON P.payment_id = R.payment_id;

    UPDATE C
    SET C.wallet_balance = C.wallet_balance + WalletCredits.total_credit
    FROM Customer C
    INNER JOIN (
        SELECT 
            Ct.customer_id,
            SUM(R.actual_refund) AS total_credit
        FROM #OrderRefunds R
        INNER JOIN Orders O ON R.order_id = O.order_id
        INNER JOIN Cart Ct ON O.cart_id = Ct.cart_id
        WHERE R.method <> 'Cash'
        GROUP BY Ct.customer_id
    ) WalletCredits ON C.customer_id = WalletCredits.customer_id;

    DROP TABLE #OrderRefunds;
    DROP TABLE #EditedSubOrders;

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
        SELECT EO.voucher_id
        FROM #EditedOrders EO JOIN Orders O ON EO.order_id = O.order_id
        WHERE O.status = 'Cancelled'
    );

    UPDATE Orders
    SET voucher_id = NULL
    WHERE order_id IN (
        SELECT EO.order_id
        FROM #EditedOrders EO JOIN Orders O ON EO.order_id = O.order_id
        WHERE O.status = 'Cancelled'
    );

    DROP TABLE #EditedOrders;
    RETURN 0;
GO