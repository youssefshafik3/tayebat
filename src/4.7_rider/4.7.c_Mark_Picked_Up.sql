-- Omar Waleed El-sayed 64-29234

GO
CREATE PROCEDURE Mark_Picked_Up
	@delivery_id INT
AS
BEGIN
	
	IF @delivery_id NOT IN (SELECT delivery_id FROM Delivery)
	BEGIN
	RETURN -1;
	END
	
	DECLARE @c_state VARCHAR(20);

	SELECT @c_state = so.status
	FROM Delivery d INNER JOIN SubOrder so ON d.suborder_id = so.suborder_id
	WHERE d.delivery_id = @delivery_id

	IF @c_state <> 'Assigned'
	BEGIN
	RETURN -4;
	END

	UPDATE Delivery
	SET picked_up_at = GETDATE()
	WHERE delivery_id = @delivery_id;

	UPDATE SubOrder
	SET status = 'Picked Up'
	WHERE suborder_id IN (SELECT o.suborder_id
							FROM Delivery d INNER JOIN SubOrder o ON d.suborder_id=o.suborder_id
							WHERE d.delivery_id = @delivery_id)

	UPDATE Orders
	SET status = 'In Progress'
	WHERE order_id IN ( SELECT o.order_id
						FROM Delivery d 
						INNER JOIN SubOrder so ON d.suborder_id = so.suborder_id
						INNER JOIN Orders o ON so.order_id = o.order_id
						WHERE d.delivery_id = @delivery_id)

	RETURN 0;
END
GO