-- Omar Waleed El-sayed 64-29234

GO
CREATE PROCEDURE Set_Rider_Availability
	@rider_id INT,
	@is_available BIT
AS
BEGIN
	IF @rider_id NOT IN (SELECT rider_id FROM Rider)
	BEGIN
	RETURN -1;
	END

	UPDATE Rider
	SET Rider.is_available = @is_available
	WHERE Rider.rider_id = @rider_id;

	RETURN 0;
END
GO