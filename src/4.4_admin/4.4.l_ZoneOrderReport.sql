-- Youssef Sameh 64-10650
CREATE FUNCTION dbo.ZoneOrderReport (@zone_id INT, @from_date DATE, @to_date DATE)
RETURNS TABLE
AS
RETURN
(
    SELECT Z.zone_id AS zone_id, Z.zone_name AS zone_name,
            (
            SELECT COUNT(O.order_id)
            FROM Orders O
            WHERE EXISTS
                (
                    SELECT S.order_id FROM SubOrder S
                    WHERE S.status <> 'Cancelled' AND S.order_id = O.order_id
                )
            AND O.zone_id = @zone_id
            AND CAST(O.order_date AS DATE) BETWEEN @from_date AND @to_date
            ) AS number_of_orders,
            (
            SELECT CAST(AVG(O.total_amount) AS DECIMAL(10,2)) 
            FROM Orders O
            WHERE EXISTS
                (
                    SELECT S.order_id FROM SubOrder S
                    WHERE S.status <> 'Cancelled' AND S.order_id = O.order_id
                )
            AND O.zone_id = @zone_id
            AND CAST(O.order_date AS DATE) BETWEEN @from_date AND @to_date
            ) AS avg_order_total,
            ISNULL((SELECT CAST((1/10.0)*SUM(S.total_price) AS DECIMAL(10,2))
             FROM Orders O JOIN SubOrder S ON O.order_id = S.order_id
             WHERE O.zone_id = @zone_id AND CAST(O.order_date AS DATE) BETWEEN @from_date AND @to_date
             AND S.status <> 'Cancelled'
            ),0) AS platform_commission
    FROM Zone Z
    WHERE Z.zone_id = @zone_id
    AND @to_date > @from_date
);
GO