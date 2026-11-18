-- Omar Waleed El-sayed 64-29234

GO
CREATE PROCEDURE Rate_Rider
	@suborder_id int,
	@rider_rating int
AS
BEGIN
	IF @suborder_id NOT IN (SELECT suborder_id FROM SubOrder) OR @rider_rating NOT BETWEEN 1 AND 5
	BEGIN
		RETURN -1;
	END

	IF (SELECT d.rider_rating FROM Delivery d WHERE d.suborder_id=@suborder_id) is NOT NULL
	BEGIN
		RETURN -2;
	END

	DECLARE @so_state VARCHAR(20)

	SELECT @so_state = status
	FROM SubOrder
	WHERE suborder_id = @suborder_id

	IF @so_state <> 'Delivered'
	BEGIN
		RETURN -4;
	END

	UPDATE Delivery
	SET rider_rating=@rider_rating
	WHERE suborder_id = @suborder_id

	RETURN 0;
END
GO