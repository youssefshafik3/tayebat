-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION My_Delivery_History(@rider_id INT,@from_date DATE, @to_date DATE)
RETURNS TABLE
AS
RETURN(
	
	SELECT d.delivery_id,o.order_id,b.name AS business_name,so.status,
	d.assigned_at,d.picked_up_at,d.delivered_at,d.tracking_time
	FROM Delivery d INNER JOIN SubOrder so ON d.suborder_id = so.suborder_id
	INNER JOIN Orders o ON o.order_id = so.order_id
	INNER JOIN Business b ON so.business_id = b.business_id
	WHERE d.rider_id = @rider_id AND so.status IN ('Delivered','Cancelled')
			AND CAST(d.assigned_at AS DATE) >= @from_date AND CAST(d.assigned_at AS DATE) <=@to_date

)
GO