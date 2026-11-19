-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION Reconcile_Order_Totals()
RETURNS TABLE
AS
RETURN(
	SELECT * 
	FROM (SELECT o.order_id,
	SUM(so.total_price + so.delivery_fee) - o.discount_amount AS expected_total,
	o.total_amount AS order_total,
	p.amount AS payment_amount
	FROM (Orders o INNER JOIN SubOrder so ON o.order_id=so.order_id)
	LEFT OUTER JOIN Payment p ON o.order_id = p.order_id 
	GROUP BY o.order_id,o.total_amount,p.amount
	) AS T
	WHERE T.expected_total <> T.order_total OR T.payment_amount is NULL OR T.payment_amount <>T.order_total

);
GO