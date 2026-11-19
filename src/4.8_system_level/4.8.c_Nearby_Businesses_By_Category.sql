--Ziad Yasser Ibrahim 65-33790

CREATE FUNCTION dbo.Nearby_Businesses_By_Category(@address_id INT, @product_category VARCHAR(50))
RETURNS TABLE
AS
RETURN(
SELECT B.business_id, B.name AS business_name, Z.zone_name, CASE WHEN B.zone_id = A.zone_id
THEN 1 ELSE 0 END AS same_zone, (SELECT AVG(CAST(D.tracking_time AS DECIMAL(10,2)))
FROM Delivery D INNER JOIN SubOrder SO ON D.suborder_id = SO.suborder_id
INNER JOIN Orders O ON SO.order_id = O.order_id WHERE O.zone_id = B.zone_id AND SO.status = 'Delivered'
) AS zone_avg_delivery_time
FROM Business B 
INNER JOIN Zone Z ON B.zone_id = Z.zone_id
INNER JOIN Address A ON A.address_id = @address_id
WHERE @product_category IS NOT NULL AND B.status = 'Active' AND EXISTS 
(SELECT * FROM Product P WHERE B.business_id = P.business_id AND P.is_available = 1  AND P.category = @product_category)
);
GO