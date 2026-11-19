--Ziad Yasser Ibrahim 65-33790

CREATE VIEW TopSellingProducts 
AS
SELECT TOP 10 P.product_id, P.name AS product_name,B.name AS business_name, CASE WHEN R.business_id IS NOT NULL 
THEN 'Restaurant' WHEN PH.business_id IS NOT NULL THEN 'Pharmacy' END AS business_type, SUM(CI.quantity) AS units_sold,
SUM(CI.quantity * CI.unit_price) AS total_revenue
FROM CartItem CI
INNER JOIN Orders O ON CI.cart_id = O.cart_id 
INNER JOIN Product P ON CI.product_id = P.product_id
INNER JOIN SubOrder S ON O.order_id = S.order_id AND S.business_id = P.business_id
INNER JOIN Business B ON P.business_id = B.business_id
LEFT OUTER JOIN Restaurant R ON B.business_id = R.business_id
LEFT OUTER JOIN Pharmacy PH ON B.business_id = PH.business_id
WHERE S.status <> 'Cancelled'
GROUP BY P.product_id, P.name, B.name, R.business_id, PH.business_id
ORDER BY units_sold DESC, P.product_id ASC
GO