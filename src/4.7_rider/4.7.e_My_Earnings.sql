-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION My_Earnings(@rider_id INT, @from_date DATE, @to_date DATE)
	RETURNS TABLE
AS
RETURN(
	SELECT COUNT(*) AS completed_deliveries,SUM(so.delivery_fee) AS total_delivery_fees,
	SUM(0.8 * so.delivery_fee) AS total_earnings

	FROM Delivery d INNER JOIN SubOrder so ON d.suborder_id = so.suborder_id
	WHERE d.rider_id = @rider_id AND CAST(d.delivered_at AS DATE) >= @from_date 
	AND CAST(d.delivered_at AS DATE) <= @to_date AND so.status = 'Delivered' 
);
GO