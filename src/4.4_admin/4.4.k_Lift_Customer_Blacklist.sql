-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Lift_Customer_Blacklist
@customer_id INT,@admin_id INT
AS
BEGIN
IF NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@customer_id)
BEGIN
RETURN -1;
END;

IF NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@admin_id)
BEGIN
RETURN -1;
END;


IF NOT EXISTS(SELECT 1 FROM Customer C WHERE C.customer_id=@customer_id)
BEGIN
RETURN -3;
END;

IF NOT EXISTS(SELECT 1 FROM Blacklist B WHERE B.customer_id=@customer_id)
BEGIN
RETURN -4;
END;
IF NOT EXISTS(SELECT 1 FROM Blacklist B WHERE B.customer_id=@customer_id AND B.admin_id=@admin_id) OR NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@admin_id)
BEGIN
RETURN -3;
END;

DELETE FROM Blacklist WHERE customer_id=@customer_id;
UPDATE Users
SET account_status='Active' WHERE user_id=@customer_id;
RETURN 0;
END;
GO