-- Omar Waleed El-sayed 64-29234

GO
CREATE PROCEDURE Mark_Delivered
	@delivery_id INT
AS
BEGIN
	IF @delivery_id NOT IN (SELECT delivery_id FROM Delivery)
	BEGIN
	RETURN -1;
	END

	DECLARE @so_state VARCHAR(20);
	DECLARE @so_id INT;
	DECLARE @o_id INT;
	DECLARE @o_state VARCHAR(20);

	SELECT @so_state = so.status,@o_id = so.order_id,@o_state = o.status,@so_id = so.suborder_id
	FROM Delivery d INNER JOIN SubOrder so ON d.suborder_id = so.suborder_id INNER JOIN Orders o 
	ON so.order_id = o.order_id
	WHERE d.delivery_id = @delivery_id

	IF @so_state <> 'Picked Up' OR @o_state <> 'In Progress'
	BEGIN
	RETURN -4;
	END

	UPDATE SubOrder
	SET status = 'Delivered'
	WHERE suborder_id = @so_id

	UPDATE Delivery
	SET delivered_at = GETDATE(), tracking_time = DATEDIFF(MINUTE,picked_up_at,GETDATE())
	WHERE delivery_id = @delivery_id;

	UPDATE Orders
	SET status = 'Delivered'
	WHERE order_id=@o_id AND NOT EXISTS(SELECT so.suborder_id
	FROM SubOrder so
	WHERE so.order_id = @o_id AND so.status <> 'Delivered' AND so.status <> 'Cancelled'
	)
	AND EXISTS(SELECT so.suborder_id
	FROM SubOrder so
	WHERE so.order_id = @o_id AND so.status = 'Delivered'
	)
	RETURN 0;
END
GO
