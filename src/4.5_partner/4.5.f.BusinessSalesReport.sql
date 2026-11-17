CREATE FUNCTION dbo.BusinessSalesReport (@business_id INT, @from_date DATE, @to_date DATE)
RETURNS TABLE
AS
RETURN(
SELECT P.product_id, P.name AS product_name, SUM(CI.quantity) AS units_sold, SUM(CI.quantity * CI.unit_price) AS revenue_per_product
FROM Orders O 
INNER JOIN SubOrder S ON O.order_id = S.order_id
INNER JOIN CartItem CI ON O.cart_id = CI.cart_id
INNER JOIN Product P ON CI.product_id = P.product_id
WHERE S.business_id = @business_id AND P.business_id = @business_id AND S.status <> 'Cancelled' AND @from_date IS NOT NULL AND @to_date IS NOT NULL AND
@from_date <= @to_date AND (CAST(O.order_date AS DATE) BETWEEN @from_date AND @to_date)

GROUP BY P.product_id, P.name
);
GO