-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION Recommended_Products(@customer_id INT)
RETURNS TABLE
AS
RETURN(
SELECT TOP 10 T.product_id,T.product_name,T.business_name,T.category,T.final_price
FROM(
SELECT p.product_id,p.name AS product_name,b.name AS business_name,p.category,
		p.price-p.discount_amount AS final_price,
		(SELECT SUM(ci2.quantity)
		FROM Orders o2 INNER JOIN Cart c2 ON o2.cart_id = c2.cart_id 
					INNER JOIN CartItem ci2 ON ci2.cart_id = c2.cart_id
					INNER JOIN Product p2 ON ci2.product_id = p2.product_id
		WHERE c2.customer_id = @customer_id AND p.category = p2.category) AS count_of_ordered_category

FROM Product p INNER JOIN Business b ON p.business_id = b.business_id

WHERE p.is_available = 1 AND b.status = 'Active'  
	AND b.zone_id = (SELECT a.zone_id FROM Address a WHERE a.is_active=1 AND a.customer_id =@customer_id)
	AND NOT EXISTS( SELECT *
	FROM Orders o INNER JOIN Cart c ON o.cart_id = c.cart_id
		INNER JOIN CartItem ci ON ci.cart_id = c.cart_id
	WHERE c.customer_id = @customer_id AND ci.product_id = p.product_id
	)
) AS T

WHERE T.count_of_ordered_category>0

ORDER BY T.count_of_ordered_category DESC , T.product_id ASC
);
GO