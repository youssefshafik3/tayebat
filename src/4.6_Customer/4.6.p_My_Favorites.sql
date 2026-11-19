--Ziad Yasser Ibrahim 65-33790

CREATE FUNCTION dbo.My_Favorites (@customer_id int)
RETURNS TABLE 
AS
RETURN(
SELECT P.product_id, P.name AS product_name, B.name AS business_name, CASE WHEN P.is_available = 1 AND
B.status = 'Active' THEN 1 ELSE 0 END AS is_orderable
FROM Favorite_Product FP
INNER JOIN Product P ON FP.product_id = P.product_id
INNER JOIN Business B ON P.business_id = B.business_id
WHERE FP.customer_id = @customer_id
);
GO