-- Youssef Sameh 64-10650
CREATE OR ALTER FUNCTION dbo.ZoneOrderReport (@zone_id INT, @from_date DATE, @to_date DATE)
RETURNS TABLE
AS
RETURN
(

    SELECT Z.zone_id AS zone_id, Z.zone_name AS zone_name, COUNT(O.order_id) AS number_of_orders, CAST(AVG(O.total_amount) AS DECIMAL(10,2)) AS avg_order_total,
    ISNULL((SELECT CAST((1/10.0)*SUM(S.total_price) AS DECIMAL(10,2))
    FROM Orders O2 JOIN SubOrder S ON O2.order_id = S.order_id
    WHERE O2.zone_id = @zone_id AND CAST(O2.order_date AS DATE) BETWEEN @from_date AND @to_date
             AND S.status <> 'Cancelled'
            ),0) AS platform_commission
    FROM Zone Z LEFT JOIN Orders O ON Z.zone_id = O.zone_id AND O.status <> 'Cancelled' AND CAST(O.order_date AS DATE) BETWEEN @from_date AND @to_date
    WHERE Z.zone_id = @zone_id 
    AND @to_date >= @from_date
    GROUP BY Z.zone_id, Z.zone_name
    
);
GO