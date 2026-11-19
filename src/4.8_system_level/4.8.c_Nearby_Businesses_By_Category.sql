--Ziad Yasser Ibrahim 65-33790
CREATE FUNCTION dbo.Nearby_Businesses_By_Category(@address_id INT, @product_category VARCHAR(50))
RETURNS @Result TABLE (
business_id INT,
business_name VARCHAR(100),
zone_name VARCHAR(50),
same_zone BIT,
zone_avg_delivery_time DECIMAL(10,2)
)
AS
BEGIN
IF @address_id IS NULL OR @product_category IS NULL OR LTRIM(RTRIM(@product_category)) = ''
RETURN;

INSERT INTO @Result (business_id, business_name, zone_name, same_zone, zone_avg_delivery_time)
SELECT
B.business_id,
B.name AS business_name,
Z.zone_name,
CAST(CASE WHEN B.zone_id = A.zone_id THEN 1 ELSE 0 END AS BIT) AS same_zone,
(
SELECT AVG(CAST(D.tracking_time AS DECIMAL(10,2)))
FROM Delivery D
INNER JOIN SubOrder SO ON D.suborder_id = SO.suborder_id
INNER JOIN Orders O ON SO.order_id = O.order_id
WHERE O.zone_id = B.zone_id AND SO.status = 'Delivered'
) AS zone_avg_delivery_time
FROM Business B
INNER JOIN Zone Z ON B.zone_id = Z.zone_id
INNER JOIN Address A ON A.address_id = @address_id
WHERE B.status = 'Active'
AND EXISTS (
SELECT *
FROM Product P
WHERE P.business_id = B.business_id
AND P.is_available = 1 AND P.category = @product_category
)
ORDER BY
same_zone DESC,
zone_avg_delivery_time ASC,
B.business_id ASC;

RETURN;
END;
GO