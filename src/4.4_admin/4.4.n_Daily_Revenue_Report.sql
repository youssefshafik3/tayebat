-- Youssef Sameh 64-10650
CREATE FUNCTION dbo.Daily_Revenue_Report (@report_date DATE)
RETURNS TABLE
AS
RETURN
(
    SELECT Z.zone_name AS zone_name,
    CASE WHEN P.pharmacy_type IS NOT NULL THEN 'Pharmacy'
         ELSE 'Restaurant'
         END 
         AS business_type,
        COUNT(S.suborder_id) AS number_of_suborders, SUM(S.total_price) AS gross_sales, SUM(S.delivery_fee) AS delivery_fees, CAST((1/10.0)*SUM(S.total_price) AS DECIMAL(10,2)) AS platform_commission
    FROM SubOrder S LEFT JOIN Pharmacy P ON P.business_id = S.business_id
    JOIN Business B ON S.business_id = B.business_id
    JOIN Zone Z ON B.zone_id = Z.zone_id
    WHERE S.order_id IN
    (
        SELECT order_id
        FROM Orders O
        WHERE CAST (O.order_date AS DATE) = @report_date
    )
    AND S.status <> 'Cancelled'
    GROUP BY Z.zone_name, CASE WHEN P.pharmacy_type IS NOT NULL THEN 'Pharmacy'
         ELSE 'Restaurant'
         END
);
GO