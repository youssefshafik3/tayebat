-- Omar Waleed El-sayed 64-29234


GO
CREATE PROCEDURE Submit_Feedback
	@suborder_id INT,
	@headline VARCHAR(100),
	@description VARCHAR(500),
	@rating INT
AS
BEGIN
	IF @suborder_id NOT IN (SELECT suborder_id FROM SubOrder)
	BEGIN
		RETURN -1;
	END

	IF @rating NOT BETWEEN 1 AND 5 OR @headline is NULL OR @rating is NULL
	BEGIN
		RETURN -1;
	END
	
	IF @suborder_id IN (SELECT suborder_id FROM Feedback)
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

	INSERT INTO Feedback(headline,description,rating,suborder_id)
	VALUES(@headline,@description,@rating,@suborder_id);

	RETURN 0;
END
GO