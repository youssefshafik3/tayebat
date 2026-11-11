-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION My_Active_Deliveries(@rider_id INT)
	RETURNS TABLE
AS
RETURN(
	
	SELECT d.delivery_id,
	o.order_id,
	so.suborder_id,
	b.name AS business_name,
	CONCAT(u.first_name+' '+u.last_name) AS customer_name,
	a.description AS address_description,
	z.zone_name,
	so.status,
	d.assigned_at

	FROM Delivery d 
	INNER JOIN SubOrder so ON d.suborder_id = so.suborder_id
	INNER JOIN Orders o ON so.order_id = o.order_id 
	INNER JOIN Business b ON so.business_id=b.business_id
	INNER JOIN Zone z ON o.zone_id = z.zone_id
	INNER JOIN Cart c ON o.cart_id = c.cart_id
	INNER JOIN Address a ON c.address_id = a.address_id
	INNER JOIN Users u ON c.customer_id = u.user_id
	
	WHERE d.rider_id = @rider_id AND so.status IN ('Assigned','Picked Up')

)
GO